import axios from "axios";

const client = axios.create({
  baseURL: "https://v3.openstates.org",
  headers: {
    "X-API-KEY": process.env.OPENSTATES_API_KEY,
  },
});

export async function searchBills(query: string) {
  try {
    const response = await client.get("/bills", {
      params: {
        q: query,
        jurisdiction: "Illinois",
        page: 1,
        per_page: 5,
      },
    });

    return response.data;
  } catch (error) {
    console.error("OpenStates error", error);
    return {
      results: [],
    };
  }
}