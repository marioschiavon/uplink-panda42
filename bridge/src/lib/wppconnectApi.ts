import { fetch } from "undici";

const WPP_BASE_URL = process.env.WPP_API_URL || "https://wpp.panda42.com.br";

export async function sendMessage(sessionName: string, phone: string, message: string, token: string) {
  const url = `${WPP_BASE_URL}/api/${sessionName}/send-message`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: token },
    body: JSON.stringify({ phone, message }),
  });

  const data: any = await response.json();
  if (!response.ok) throw new Error(data?.error || "WPP send error");

  return data;
}
