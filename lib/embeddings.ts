const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS || 768);
const EMBEDDING_BATCH_SIZE = Number(process.env.EMBEDDING_BATCH_SIZE || 50);
export type EmbeddingProvider = "gemini" | "mock";
export type EmbeddingOptions = {
  model?: string;
  dimensions?: number;
  batchSize?: number;
  provider?: EmbeddingProvider;
};

function mockEmbedding(text: string, dimensions: number) {
  const vector = Array.from({ length: dimensions }, () => 0);
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) || [];

  for (const token of tokens) {
    let hash = 2166136261;
    for (let index = 0; index < token.length; index += 1) {
      hash ^= token.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    const dimension = (hash >>> 0) % dimensions;
    const sign = hash & 1 ? 1 : -1;
    vector[dimension] += sign;
  }

  const magnitude = Math.sqrt(
    vector.reduce((sum, value) => sum + value * value, 0),
  );
  return magnitude ? vector.map((value) => value / magnitude) : vector;
}

export async function embedTexts(texts: string[], options?: EmbeddingOptions) {
  const model = options?.model || EMBEDDING_MODEL;
  const dimensions = options?.dimensions ?? EMBEDDING_DIMENSIONS;
  const batchSize = options?.batchSize ?? EMBEDDING_BATCH_SIZE;
  const provider =
    options?.provider || process.env.EMBEDDING_PROVIDER || "gemini";

  if (!Number.isInteger(dimensions) || dimensions <= 0) {
    throw new Error("Embedding dimensions must be a positive integer");
  }
  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new Error("Embedding batch size must be a positive integer");
  }

  if (provider === "mock") {
    return texts.map((text) => mockEmbedding(text, dimensions));
  }
  if (provider !== "gemini") {
    throw new Error(`Unsupported embedding provider: ${provider}`);
  }

  const embeddings: number[][] = [];
  const { genai } = await import("./genai");

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

export async function embedText(text: string, options?: EmbeddingOptions) {
  const [vec] = await embedTexts([text], options);
  return vec;
}

export async function embedQuery(query: string, options?: EmbeddingOptions) {
  return embedText(query, options);
}

export default embedTexts;
