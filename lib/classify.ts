export type Classification = "bill" | "statute" | "process" | "general";

export function classifyQuestion(text: string): Classification {
  const normalized = text.toLowerCase();

  if (/bill|house bill|senate bill|hb|sb|legislation/.test(normalized)) {
    return "bill";
  }

  if (/statute|law|code|section|article/.test(normalized)) {
    return "statute";
  }

  if (/process|committee|hearing|vote|session/.test(normalized)) {
    return "process";
  }

  return "general";
}
