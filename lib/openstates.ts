export interface OpenStatesBillResponse {
  id: string;
  title: string;
  abstract?: string;
  session: string;
  state: string;
  url?: string;
}

export async function fetchBillSummary(billId: string) {
  const apiKey = process.env.OPENSTATES_API_KEY;

  if (!apiKey) {
    throw new Error("OPENSTATES_API_KEY is missing in environment variables.");
  }

  const response = await fetch(`https://v3.openstates.org/bills/${billId}`, {
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bill summary from OpenStates.");
  }

  return response.json() as Promise<OpenStatesBillResponse>;
}
