import { NextRequest } from "next/server";
import { classifyQuestion } from "@/lib/classify";
import { searchBills } from "@/lib/openstates";
import { genai } from "@/lib/genai";
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

    const response = await genai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `
User question:

${question}

Government data:

${JSON.stringify(data, null, 2)}

Explain this.
`,
      config: {
        systemInstruction: ANSWER_PROMPT,
      },
    });

    // Safely extract the response text using the text() getter
    const answerText = response.text ? response.text : "No answer generated.";

    return Response.json({
      answer: answerText,
      sources: data,
    });
  } catch (error) {
    console.error(error);
    return Response.json({
      answer: "Sorry, there was an error processing your question.",
    });
  }
}
