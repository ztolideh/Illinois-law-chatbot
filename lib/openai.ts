import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function createCompletion(prompt: string) {
  return openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    max_output_tokens: 600,
  });
}
