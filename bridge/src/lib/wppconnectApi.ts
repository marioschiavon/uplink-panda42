import { request } from "undici";

const WPP_API_URL = process.env.WPP_API_URL!;

async function httpJSON(url: string, init?: RequestInit) {
  const { statusCode, body } = await request(url, init as any);
  const data = await body.json().catch(() => ({}));
  if (statusCode >= 400) {
 const msg = (typeof (data as any)?.message === "string")
  ? (data as any).message
  : "WPP error";
    throw new Error(`${url} (${statusCode}): ${msg}`);
  }
  return data;
}

export async function startSession(session: string) {
  const url = `${WPP_API_URL}/api/${encodeURIComponent(session)}/start-session`;
  return httpJSON(url, { method: "POST" });
}

export async function sendMessage(session: string, phone: string, message: string) {
  const url = `${WPP_API_URL}/api/${encodeURIComponent(session)}/send-message`;
  return httpJSON(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone, message })
  });
}

/** Se sua instalação tiver endpoint de status diferente, ajuste aqui */
export async function getSessionStatus(session: string) {
  const url = `${WPP_API_URL}/api/${encodeURIComponent(session)}/status-session`;
  // algumas versões usam GET, outras POST; se precisar troque para GET
  try {
    return await httpJSON(url, { method: "POST" });
  } catch {
    // fallback GET
    return await httpJSON(url, { method: "GET" as any });
  }
}
