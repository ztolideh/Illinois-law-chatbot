import axios from "axios";

const client = axios.create({
  baseURL: "https://v3.openstates.org",
  headers: {
    "X-API-KEY": process.env.OPENSTATES_API_KEY,
  },
});

const TOPIC_EXPANSIONS: Record<string, string[]> = {
  "drinking and driving": ["driving under the influence", "dui", "impaired driving"],
  "driving under the influence": ["dui", "impaired driving"],
  "dui": ["driving under the influence", "impaired driving"],
  "impaired driving": ["driving under the influence", "dui"],
  "seat belt": ["seatbelt", "child restraint", "traffic safety"],
  "seatbelt": ["seat belt", "child restraint", "traffic safety"],
  "ai": ["artificial intelligence", "machine learning"],
  "artificial intelligence": ["ai", "machine learning"],
  "privacy": ["data privacy", "consumer privacy", "biometric privacy"],
  "gun": ["firearms", "weapon", "firearm regulation"],
  "minimum wage": ["wage", "labor", "employment law"],
  "vaccines": ["public health", "immunization", "health policy"],
  "rent": ["housing", "tenant rights", "eviction"],
};

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchTerms(query: string) {
  const baseQuery = query.trim();
  if (!baseQuery) return [];

  const candidates = new Set<string>();
  const normalized = normalizeText(baseQuery);

  if (normalized) {
    candidates.add(normalized);
  }

  const withoutStopWords = normalized
    .replace(/\b(is|there|a|an|the|law|laws|bill|bills|on|about|for|of|to|and|or)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (withoutStopWords) {
    candidates.add(withoutStopWords);
  }

  if (/\blaw(?:s)?\s+on\b/i.test(baseQuery)) {
    const topic = baseQuery.replace(/\blaw(?:s)?\s+on\b/i, "").trim();
    if (topic) candidates.add(topic);
  }

  const topicMatches = Object.keys(TOPIC_EXPANSIONS).filter((key) => normalized.includes(key));
  topicMatches.forEach((key) => {
    TOPIC_EXPANSIONS[key].forEach((expansion) => candidates.add(expansion));
  });

  return Array.from(candidates).slice(0, 8);
}

export async function searchBills(query: string) {
  const searchTerms = buildSearchTerms(query);

  if (searchTerms.length === 0) {
    return {
      results: [],
      searchTerms: [],
    };
  }

  for (const term of searchTerms) {
    try {
      const response = await client.get("/bills", {
        params: {
          q: term,
          jurisdiction: "Illinois",
          page: 1,
          per_page: 5,
        },
      });

      const results = response.data?.results ?? [];
      if (results.length > 0) {
        return {
          ...response.data,
          searchTerms,
          usedSearchTerm: term,
        };
      }
    } catch (error) {
      console.error("OpenStates error", error);
    }
  }

  return {
    results: [],
    searchTerms,
  };
}