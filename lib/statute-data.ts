import crypto from "crypto";

export type StatuteRecord = {
  chapter: string;
  chapterName: string;
  act: string;
  actName: string;
  section: string;
  title: string;
  text: string;
  url: string;
};

export type StatuteChunk = {
  index: number;
  content: string;
};

export function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];

    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && content[index + 1] === "\n") {
        index += 1;
      }
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (value || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

export function parseStatuteCsv(content: string): StatuteRecord[] {
  const rows = parseCsv(content);
  if (rows.length < 2) return [];

  const indexes = Object.fromEntries(rows[0].map((name, index) => [name, index]));
  const fields: Array<keyof StatuteRecord> = ["chapter", "chapterName", "act", "actName", "section", "title", "text", "url"];

  return rows.slice(1).filter((row) => row.length > 1).map((row) => {
    return Object.fromEntries(fields.map((field) => [field, row[indexes[field]] || ""])) as StatuteRecord;
  });
}

export function chunkStatuteText(text: string, chunkSize = 1800, overlap = 200): StatuteChunk[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const chunks: StatuteChunk[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    chunks.push({ index: chunks.length, content: normalized.slice(start, end).trim() });
    if (end === normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

export function contentHash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}