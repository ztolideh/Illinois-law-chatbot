import { genai } from "./genai";

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-004";
const EMBEDDING_DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS || 768);
const EMBEDDING_BATCH_SIZE = Number(process.env.EMBEDDING_BATCH_SIZE || 50);

export async function embedTexts(
  texts: string[],
  options?: { model?: string; dimensions?: number; batchSize?: number },
) {
  const model = options?.model || EMBEDDING_MODEL;
  const dimensions = options?.dimensions ?? EMBEDDING_DIMENSIONS;
  const batchSize = options?.batchSize ?? EMBEDDING_BATCH_SIZE;

  const embeddings: number[][] = [];

  for (let start = 0; start < texts.length; start += batchSize) {
    const batch = texts.slice(start, start + batchSize);
    const response = await genai.models.embedContent({
      model,
      contents: batch,
      config: { outputDimensionality: dimensions },
    });

    const values = response.embeddings?.map((e: any) => e.values || []) || [];
    if (
      values.length !== batch.length ||
      values.some((v: any) => v.length !== dimensions)
    ) {
      throw new Error(
        `Embedding response did not contain ${batch.length} vectors of length ${dimensions}`,
      );
    }

    embeddings.push(...values);
  }

  return embeddings;
}

export async function embedText(
  text: string,
  options?: { model?: string; dimensions?: number },
) {
  const [vec] = await embedTexts([text], options);
  return vec;
}

export async function embedQuery(
  query: string,
  options?: { model?: string; dimensions?: number },
) {
  return embedText(query, options);
}

export default embedTexts;
