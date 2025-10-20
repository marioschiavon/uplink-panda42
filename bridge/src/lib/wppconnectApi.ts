import { request } from "undici";

const WPP_API_URL = process.env.WPP_API_URL!;
const WPP_API_TOKEN_GLOBAL = process.env.WPP_API_TOKEN || ""; // fallback opcional

function buildSessionPath(session: string, wppToken?: string) {
  const token = wppToken || WPP_API_TOKEN_GLOBAL || "";
  if (token) {
    // usa formato <session>:<token> no path
    return encodeURIComponent(`${session}:${token}`);
  }
  return encodeURIComponent(session);
}

async function httpJSON(url: string, init?: RequestInit) {
  const { statusCode, body } = await request(url, init as any);
  const data = await body.json().catch(() => ({}));
  if (statusCode >= 400) {
    const msg = (typeof (data as any)?.message === "string") ? (data as any).message : "WPP error";
    throw new Error(`${url} (${statusCode}): ${msg}`);
  }
  return data;
}

export async function startSession(session: string, wppToken?: string) {
  const s = buildSessionPath(session, wppToken);
  const url = `${WPP_API_URL}/api/${s}/start-session`;
  return httpJSON(url, { method: "POST" });
}

export async function sendMessage(session: string, phone: string, message: string, wppToken?: string) {
  const s = buildSessionPath(session, wppToken);
  const url = `${WPP_API_URL}/api/${s}/send-message`;
  return httpJSON(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone, message })
  });
}

export async function getSessionStatus(session: string, wppToken?: string) {
  const s = buildSessionPath(session, wppToken);
  const url = `${WPP_API_URL}/api/${s}/status-session`;
  try {
    return await httpJSON(url, { method: "POST" });
  } catch {
    return await httpJSON(url, { method: "GET" as any });
  }
}
