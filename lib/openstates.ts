import axios from "axios";

export const openstates = axios.create({
  baseURL: "https://v3.openstates.org",
  headers: {
    "X-API-KEY": process.env.OPENSTATES_API_KEY,
  },
});