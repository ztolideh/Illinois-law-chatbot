import { NextRequest } from "next/server";
import { classifyQuestion } from "@/lib/classify";
import { searchBills } from "@/lib/openstates";
import { openai } from "@/lib/openai";
import { ANSWER_PROMPT } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body.message;

    const intent = await classifyQuestion(question);

    let data: any = {};

    if (intent.category === "bills") {
      data = await searchBills(intent.searchTerm);
    }

    const answer = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: ANSWER_PROMPT,
        },
        {
          role: "user",
          content: `
User question:

${question}

Government data:

${JSON.stringify(data, null, 2)}

Explain this.
`,
        },
      ],
    });

    return Response.json({
      answer: answer.choices[0].message.content,
      sources: data,
    });
  } catch (error) {
    console.error(error);
    return Response.json({
      answer: "Sorry, there was an error processing your question.",
    });
  }
}
