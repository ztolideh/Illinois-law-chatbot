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

export async function withDatabase<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

export async function upsertStatute(client: PoolClient, record: StatuteRecord, documentHash: string) {
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
    [record.chapter, record.chapterName, record.act, record.actName, record.section, record.title, record.text, record.url, documentHash],
  );

  return result.rows[0].id;
}

export async function replaceStatuteChunks(client: PoolClient, documentId: string, chunks: StatuteChunk[], embeddings: number[][]) {
  await client.query("DELETE FROM statute_chunks WHERE document_id = $1", [documentId]);

  for (const [index, chunk] of chunks.entries()) {
    await client.query(
      `
        INSERT INTO statute_chunks (document_id, chunk_index, content, content_hash, embedding)
        VALUES ($1, $2, $3, encode(digest($3, 'sha256'), 'hex'), $4::vector)
      `,
      [documentId, index, chunk.content, vectorLiteral(embeddings[index])],
    );
  }
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}