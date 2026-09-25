import assert from "assert";
import fs from "fs";
import path from "path";
import { Client } from "pg";
import {
  withDatabase,
  closeDatabase,
  upsertStatute,
  replaceStatuteChunks,
  getNearestChunks,
} from "../../lib/vector-db";
import { contentHash } from "../../lib/statute-data";

// This integration test requires a running Postgres with pgvector available and DATABASE_URL set.
// We run migrations, insert test rows and query nearest chunks.

async function run() {
  if (!process.env.DATABASE_URL) {
    console.log("Skipping integration test: DATABASE_URL not set");
    return;
  }

  const migration = path.join(
    process.cwd(),
    "db",
    "migrations",
    "001_vector_statutes.sql",
  );
  if (!fs.existsSync(migration))
    throw new Error(`Migration not found: ${migration}`);

  // Apply the migration through pg so the test does not require psql on PATH.
  const migrationClient = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    await migrationClient.connect();
    await migrationClient.query(fs.readFileSync(migration, "utf8"));
  } finally {
    await migrationClient.end();
  }

  await withDatabase(async (client) => {
    // create a simple statute and chunks
    const record = {
      chapter: "1",
      chapterName: "Test Chapter",
      act: "Act",
      actName: "Test Act",
      section: "1",
      title: "Test",
      text: "This is a test statute used for integration testing.",
      url: "http://example.test",
    } as any;

    const documentId = await upsertStatute(
      client,
      record,
      contentHash(JSON.stringify(record)),
    );

    const chunks = [
      { index: 0, content: "alpha beta gamma" },
      { index: 1, content: "delta epsilon zeta" },
    ];

    // fake embeddings (must match migration VECTOR dimension - default 768)
    const dim = Number(process.env.EMBEDDING_DIMENSIONS || 768);
    const embeddings = chunks.map((_, i) =>
      Array.from({ length: dim }, (_, j) => (i === 0 && j === 0) || (i === 1 && j === 1) ? 1 : 0),
    );

    await replaceStatuteChunks(
      client,
      documentId,
      chunks as any,
      embeddings as any,
    );

    // query with a vector similar to chunk 0
    const queryEmbedding = Array.from({ length: dim }, (_, index) => index === 0 ? 1 : 0);
    const results = await getNearestChunks(client as any, queryEmbedding, 2);

    assert(results.length >= 1, "expected at least one result");
    assert(results[0].chunk_index === 0, "expected the matching chunk to rank first");
    console.log("Integration query returned:", results.slice(0, 2));
  });

  await closeDatabase();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
