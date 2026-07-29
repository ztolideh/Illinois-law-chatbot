import { genai } from "./genai";
import { CLASSIFICATION_PROMPT } from "./prompts";

export async function classifyQuestion(question: string) {
  const response = await genai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: question,
    config: {
      systemInstruction: CLASSIFICATION_PROMPT,
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}
