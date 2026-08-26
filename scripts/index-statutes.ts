import fs from "fs";
import path from "path";
import { chunkStatuteText, contentHash, parseStatuteCsv, type StatuteRecord } from "../lib/statute-data";
import type { PoolClient } from "pg";

const INPUT_FILE = path.join(process.cwd(), "data", "statutes.csv");
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-004";
const EMBEDDING_DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS || 768);
const EMBEDDING_BATCH_SIZE = 50;

function readRecords() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Statute CSV not found: ${INPUT_FILE}`);
  }

  return parseStatuteCsv(fs.readFileSync(INPUT_FILE, "utf8"));
}

async function embedTexts(texts: string[]) {
  const { genai } = await import("../lib/genai");
  const embeddings: number[][] = [];

  for (let start = 0; start < texts.length; start += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(start, start + EMBEDDING_BATCH_SIZE);
    const response = await genai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: batch,
      config: { outputDimensionality: EMBEDDING_DIMENSIONS },
    });

    const values = response.embeddings?.map((embedding) => embedding.values || []) || [];
    if (values.length !== batch.length || values.some((value) => value.length !== EMBEDDING_DIMENSIONS)) {
      throw new Error(`Embedding response did not contain ${batch.length} vectors of length ${EMBEDDING_DIMENSIONS}`);
    }
    embeddings.push(...values);
  }

  return embeddings;
}

async function indexRecord(client: PoolClient, record: StatuteRecord) {
  const chunks = chunkStatuteText(record.text);
  if (!chunks.length) return false;

  const { replaceStatuteChunks, upsertStatute } = await import("../lib/vector-db");
  const documentId = await upsertStatute(client, record, contentHash(JSON.stringify(record)));
  const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));
  await replaceStatuteChunks(client, documentId, chunks, embeddings);
  return true;
}

async function main() {
  const records = readRecords();
  const dryRun = process.argv.includes("--dry-run");
  const uniqueRecords = Array.from(new Map(records.map((record) => [contentHash(JSON.stringify(record)), record])).values());

  if (dryRun) {
    const chunkCount = uniqueRecords.reduce((total, record) => total + chunkStatuteText(record.text).length, 0);
    console.log(`Parsed ${uniqueRecords.length} records and ${chunkCount} chunks from ${INPUT_FILE}`);
    return;
  }

  let indexed = 0;
  const { closeDatabase, withDatabase } = await import("../lib/vector-db");
  try {
    await withDatabase(async (client) => {
      await client.query("BEGIN");
      try {
        for (const record of uniqueRecords) {
          if (await indexRecord(client, record)) indexed += 1;
        }
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });
  } finally {
    await closeDatabase();
  }

  console.log(`Indexed ${indexed} statute records from ${INPUT_FILE}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });