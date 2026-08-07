import fs from "fs";
import path from "path";

type StatuteMatch = {
  title: string;
  citation: string;
  summary: string;
  keywords: string[];
};

type StatuteCsvRow = {
  chapter: string;
  chapterName: string;
  act: string;
  actName: string;
  section: string;
  title: string;
  text: string;
  url: string;
};

const STATUTE_RULES: StatuteMatch[] = [
  {
    keywords: ["drinking and driving", "driving under the influence", "dui", "impaired driving"],
    title: "Illinois Vehicle Code",
    citation: "625 ILCS 5/11-501",
    summary:
      "Illinois generally prohibits driving under the influence and related impaired-driving conduct.",
  },
  {
    keywords: ["seat belt", "seatbelt", "seat belts"],
    title: "Illinois Vehicle Code",
    citation: "625 ILCS 5/12-603.1",
    summary: "Illinois requires seat belt use in many motor vehicles.",
  },
  {
    keywords: ["minimum wage", "wage", "employment law", "labor law"],
    title: "Illinois Minimum Wage Law",
    citation: "820 ILCS 105/4",
    summary: "Illinois has wage standards that apply to covered employees and employers.",
  },
  {
    keywords: ["privacy", "data privacy", "biometric privacy"],
    title: "Illinois Biometric Information Privacy Act",
    citation: "740 ILCS 14/1 et seq.",
    summary: "Illinois law regulates the collection and use of biometric identifiers in certain contexts.",
  },
  {
    keywords: ["gun", "firearm", "weapons"],
    title: "Illinois Firearm Laws",
    citation: "430 ILCS 65/1 et seq.",
    summary: "Illinois has statutory requirements governing firearms and related conduct.",
  },
];

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "for",
  "from",
  "in",
  "is",
  "law",
  "laws",
  "of",
  "on",
  "or",
  "the",
  "to",
  "what",
  "where",
  "who",
  "why",
]);
const STATUTE_DATA_FILE = path.join(process.cwd(), "data", "statutes.csv");

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitTerms(text: string) {
  return normalizeText(text)
    .split(" ")
    .filter(Boolean)
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function loadStatuteCatalog(): StatuteCsvRow[] {
  if (!fs.existsSync(STATUTE_DATA_FILE)) {
    return [];
  }

  try {
    const content = fs.readFileSync(STATUTE_DATA_FILE, "utf8");
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return [];
    }

    const header = parseCsvLine(lines[0]);
    const indexMap = Object.fromEntries(header.map((name, index) => [name, index]));

    return lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      return {
        chapter: values[indexMap.chapter] || "",
        chapterName: values[indexMap.chapterName] || "",
        act: values[indexMap.act] || "",
        actName: values[indexMap.actName] || "",
        section: values[indexMap.section] || "",
        title: values[indexMap.title] || "",
        text: values[indexMap.text] || "",
        url: values[indexMap.url] || "",
      };
    });
  } catch (error) {
    console.error("Unable to read statute catalog", error);
    return [];
  }
}

function summarizeText(text: string, maxLength = 220) {
  const normalized = normalizeText(text);
  if (!normalized) {
    return "No summary available.";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function scoreCatalogRecord(record: StatuteCsvRow, normalizedQuery: string) {
  const searchableText = normalizeText(`${record.chapterName} ${record.actName} ${record.title} ${record.section} ${record.text}`);
  const queryTerms = splitTerms(normalizedQuery);

  if (!queryTerms.length) {
    return { score: 0, matchedTerms: [] as string[] };
  }

  const matchedTerms = queryTerms.filter((term) => searchableText.includes(term));
  let score = matchedTerms.length * 3;

  if (searchableText.includes(normalizedQuery)) {
    score += 10;
  }

  if (searchableText.includes("driving under the influence") && normalizedQuery.includes("driving under the influence")) {
    score += 8;
  }

  return { score, matchedTerms };
}

export async function searchIllinoisStatutes(query: string) {
  const normalized = normalizeText(query);

  if (!normalized) {
    return {
      matches: [],
      searchTerm: "",
    };
  }

  const catalog = loadStatuteCatalog();
  const rankedRecords = catalog
    .map((record) => ({ record, ...scoreCatalogRecord(record, normalized) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);

  if (rankedRecords.length > 0) {
    const matches: StatuteMatch[] = rankedRecords.map(({ record, matchedTerms }) => ({
      title: record.actName || record.title || `${record.chapterName} statute`,
      citation: record.act || `${record.chapter} ILCS ${record.section}`,
      summary: summarizeText(record.text),
      keywords: matchedTerms.length ? matchedTerms : splitTerms(normalized),
    }));

    return {
      matches,
      searchTerm: normalized,
    };
  }

  const ruleMatches = STATUTE_RULES.filter((rule) =>
    rule.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
  );

  return {
    matches: ruleMatches,
    searchTerm: normalized,
  };
}
