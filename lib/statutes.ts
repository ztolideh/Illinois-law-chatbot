type StatuteMatch = {
  title: string;
  citation: string;
  summary: string;
  keywords: string[];
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

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function searchIllinoisStatutes(query: string) {
  const normalized = normalizeText(query);

  if (!normalized) {
    return {
      matches: [],
      searchTerm: "",
    };
  }

  const matches = STATUTE_RULES.filter((rule) =>
    rule.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
  );

  return {
    matches,
    searchTerm: normalized,
  };
}
