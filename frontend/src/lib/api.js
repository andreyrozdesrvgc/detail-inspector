import axios from "axios";
import { buildLeadExtra } from "./utm";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export async function submitLead(payload) {
  // Always merge UTM/referrer metadata into `extra` so the backend
  // can show the original ad source in Telegram digest.
  const extra = buildLeadExtra(payload.extra || {});
  const enriched = { ...payload, extra };
  const res = await api.post("/leads", enriched);
  return res.data;
}

export async function calculate(payload) {
  const res = await api.post("/calculate", payload);
  return res.data;
}
