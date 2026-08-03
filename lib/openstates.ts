import axios from "axios";

const client = axios.create({
  baseURL: "https://v3.openstates.org",
  headers: {
    "X-API-KEY": process.env.OPENSTATES_API_KEY,
  },
});

const STATUTE_FALLBACKS = [
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
];

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

  if (/drinking|driving/i.test(normalized)) {
    candidates.add("driving under the influence");
    candidates.add("dui");
    candidates.add("impaired driving");
  }

  return Array.from(candidates).slice(0, 5);
}

function findStatuteFallback(query: string) {
  const normalized = normalizeText(query);

  for (const fallback of STATUTE_FALLBACKS) {
    const matched = fallback.keywords.some((keyword) => normalized.includes(keyword));
    if (matched) {
      return fallback;
    }
  }

  return null;
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

  const statuteFallback = findStatuteFallback(query);
  if (statuteFallback) {
    return {
      results: [],
      searchTerms,
      statuteMatches: [statuteFallback],
    };
  }

  return {
    results: [],
    searchTerms,
  };
}