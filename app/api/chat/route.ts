import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildChatPrompt } from "../../../lib/prompts";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const body = await request.json();
  const question = body?.question?.trim();

  if (!question) {
    return NextResponse.json({ error: "Missing question in request body." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured in environment variables." },
      { status: 500 }
    );
  }

  const prompt = buildChatPrompt(question);

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    max_output_tokens: 600,
  });

  const text = response.output[0]?.content?.[0]?.text ?? ""

  return NextResponse.json({ answer: text });
}
