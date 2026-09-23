import assert from "assert";
import { PoolClient } from "pg";
import * as vectorDb from "../lib/vector-db";

// Mock client that records queries
class MockClient {
  queries: Array<{ text: string; values: any[] }> = [];
  async query(text: any, values?: any[]) {
    // Accept either (text, values) or a single config object { text, values }
    let qtext: string;
    let qvalues: any[];
    if (typeof text === "string") {
      qtext = text;
      qvalues = values || [];
    } else if (text && typeof text === "object") {
      qtext = text.text ?? JSON.stringify(text);
      qvalues = text.values ?? [];
    } else {
      qtext = String(text);
      qvalues = values || [];
    }
    this.queries.push({ text: qtext, values: qvalues });
    // return a shape similar to pg
    return { rows: [] };
  }
}

async function testReplaceStatuteChunks() {
  const client = new MockClient() as unknown as PoolClient;

  const chunks = [{ content: "chunk a" }, { content: "chunk b" }] as any;
  const embeddings = [
    [0.1, 0.2],
    [0.2, 0.3],
  ] as any;

  await vectorDb.replaceStatuteChunks(client, "doc-1", chunks, embeddings);

  // ensure BEGIN, DELETE, INSERT, COMMIT were called (order may vary in mocks)
  const texts = client.queries.map((q) =>
    (q.text || "").toString().trim().toUpperCase(),
  );
  assert(
    texts.some((t) => t.includes("BEGIN")),
    `no BEGIN found in queries: ${JSON.stringify(texts)}`,
  );
  assert(
    texts.some((t) => t.includes("DELETE FROM STATUTE_CHUNKS")),
    `no DELETE found in queries: ${JSON.stringify(texts)}`,
  );
  assert(
    texts.some((t) => t.includes("INSERT INTO STATUTE_CHUNKS")),
    `no INSERT found in queries: ${JSON.stringify(texts)}`,
  );
  assert(
    texts.some((t) => t.includes("COMMIT")),
    `no COMMIT found in queries: ${JSON.stringify(texts)}`,
  );

  console.log("replaceStatuteChunks test passed");
}

async function testGetNearestChunks() {
  const client = new MockClient() as unknown as PoolClient;
  const embedding = [0.1, 0.2];

  await vectorDb.getNearestChunks(client, embedding, 5);

  const selectQuery = client.queries.find(
    (q) =>
      q.text.toUpperCase().includes("SELECT") &&
      q.text.toUpperCase().includes("STATUTE_CHUNKS"),
  );
  assert(selectQuery, "expected a SELECT against statute_chunks");
  assert(Array.isArray(selectQuery!.values), "expected parameter array");
  // ensure limit or at least one parameter is present
  assert(selectQuery!.values.length >= 1, "expected at least one parameter");
  console.log("getNearestChunks test passed");
}

async function run() {
  await testReplaceStatuteChunks();
  await testGetNearestChunks();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
