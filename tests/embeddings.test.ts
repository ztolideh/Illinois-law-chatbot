import assert from "assert";
import { embedQuery, embedTexts } from "../lib/embeddings";

function dotProduct(left: number[], right: number[]) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

async function run() {
  const texts = [
    "Illinois statute applies to public records",
    "Illinois statute applies to public records",
  ];
  const [first, second] = await embedTexts(texts, {
    provider: "mock",
    dimensions: 128,
    batchSize: 1,
  });

  assert.strictEqual(first.length, 128);
  assert.deepStrictEqual(
    first,
    second,
    "same text should produce the same vector",
  );
  assert(
    Math.abs(dotProduct(first, first) - 1) < 1e-9,
    "non-empty vectors should be normalized",
  );

  const queryVector = await embedQuery(
    "Illinois statute applies to public records",
    {
      provider: "mock",
      dimensions: 128,
    },
  );
  assert.deepStrictEqual(
    queryVector,
    first,
    "query and document embeddings must use the same mock mapping",
  );

  const different = await embedTexts(["ocean weather forecast"], {
    provider: "mock",
    dimensions: 128,
  });
  assert(
    dotProduct(first, different[0]) < 1,
    "different text should not have an identical vector",
  );

  assert.deepStrictEqual(await embedTexts([], { provider: "mock" }), []);
  await assert.rejects(
    embedTexts(["text"], { provider: "mock", dimensions: 0 }),
    /positive integer/,
  );
  await assert.rejects(
    embedTexts(["text"], { provider: "mock", batchSize: 0 }),
    /positive integer/,
  );

  console.log("mock embeddings tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
