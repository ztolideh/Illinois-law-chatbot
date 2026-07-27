import { openai } from "./openai";
import { CLASSIFICATION_PROMPT } from "./prompts";

export async function classifyQuestion(question: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: CLASSIFICATION_PROMPT,
      },
      {
        role: "user",
        content: question,
      },
    ],
    response_format: {
      type: "json_object",
    },
  });

  return JSON.parse(
    response.choices[0].message.content || "{}"
  );
}
