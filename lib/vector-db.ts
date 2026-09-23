import { Pool, type PoolClient } from "pg";
import type { StatuteChunk, StatuteRecord } from "./statute-data";

let pool: Pool | undefined;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  pool ??= new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

function vectorLiteral(values: number[]) {
  return `[${values.join(",")}]`;
}

export async function withDatabase<T>(
  callback: (client: PoolClient) => Promise<T>,
) {
  const client = await getPool().connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

export async function upsertStatute(
  client: PoolClient,
  record: StatuteRecord,
  documentHash: string,
) {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO statute_documents
        (chapter, chapter_name, act, act_name, section, title, text, source_url, content_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (content_hash) DO UPDATE SET
        chapter = EXCLUDED.chapter,
        chapter_name = EXCLUDED.chapter_name,
        act = EXCLUDED.act,
        act_name = EXCLUDED.act_name,
        section = EXCLUDED.section,
        title = EXCLUDED.title,
        text = EXCLUDED.text,
        source_url = EXCLUDED.source_url,
        updated_at = NOW()
      RETURNING id
    `,
    [
      record.chapter,
      record.chapterName,
      record.act,
      record.actName,
      record.section,
      record.title,
      record.text,
      record.url,
      documentHash,
    ],
  );

  return result.rows[0].id;
}

export async function replaceStatuteChunks(
  client: PoolClient,
  documentId: string,
  chunks: StatuteChunk[],
  embeddings: number[][],
) {
  // Use a transaction to avoid leaving the document without chunks on failure.
  // Batch inserts with parameterized values to avoid interpolating vectors as SQL literals.
  await client.query("BEGIN");
  try {
    await client.query("DELETE FROM statute_chunks WHERE document_id = $1", [
      documentId,
    ]);

    if (chunks.length === 0) {
      await client.query("COMMIT");
      return;
    }

    // Build a single INSERT statement with multiple rows, and positional parameters.
    // Each row needs five columns: document_id, chunk_index, content, content_hash, embedding
    const values: any[] = [];
    const valuesClauseParts: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const docPos = values.push(documentId);
      const idxPos = values.push(i);
      const contentPos = values.push(chunks[i].content);
      const embedPos = values.push(embeddings[i]);

      valuesClauseParts.push(
        `($${docPos}, $${idxPos}, $${contentPos}, encode(digest($${contentPos}, 'sha256'), 'hex'), $${embedPos}::vector)`,
      );
    }

    const finalSql = `
      INSERT INTO statute_chunks (document_id, chunk_index, content, content_hash, embedding)
      VALUES ${valuesClauseParts.join(",")}
      ON CONFLICT (document_id, chunk_index) DO UPDATE SET
        content = EXCLUDED.content,
        content_hash = EXCLUDED.content_hash,
        embedding = EXCLUDED.embedding,
        created_at = NOW()
    `;

    await client.query(finalSql, values);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

export async function getNearestChunks(
  client: PoolClient,
  queryEmbedding: number[],
  limit = 10,
) {
  // Use cosine distance operator (<#>) since the HNSW index was created with vector_cosine_ops.
  // Return both the raw distance and a simple score (1 - distance) for convenience.
  const sql = `
    SELECT id, document_id, chunk_index, content,
      embedding <#> $1::vector AS distance,
      1 - (embedding <#> $1::vector) AS score
    FROM statute_chunks
    ORDER BY embedding <#> $1::vector
    LIMIT $2
  `;

  const values = [vectorLiteral(queryEmbedding), limit];
  const result = await client.query(sql, values);
  return result.rows;
}
