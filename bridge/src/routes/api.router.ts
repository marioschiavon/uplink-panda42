import { Router } from "express";
import { apiKeyAuth } from "../middlewares/apiKey.js";
import { supaAdmin } from "../lib/supabaseClient.js";
import { sendMessage } from "../lib/wppconnectApi.js";

const router = Router();

/** Cliente da Panda42 usa:
 * POST /v1/send-message
 * Headers: X-API-Key: <P42_API_TOKEN>  (ou Authorization: Bearer <...>)
 * Body: { phone: string, message: string }
 */
router.post("/send-message", apiKeyAuth, async (req, res) => {
  try {
    const orgId = req.user!.organization_id;
    const { phone, message } = req.body || {};
    if (!phone || !message) return res.status(400).json({ error: "Missing phone/message" });

    // buscar settings.wpp da organização
    const { data: org, error } = await supaAdmin
      .from("organizations")
      .select("settings, api_message_limit, api_message_usage")
      .eq("id", orgId)
      .single();

    if (error || !org) return res.status(404).json({ error: "Organization not found" });

    // limites de API
    const used = org.api_message_usage ?? 0;
    const limit = org.api_message_limit ?? null;
    if (limit !== null && used >= limit) {
      return res.status(429).json({ error: "API message limit exceeded" });
    }

    const wpp = (org.settings || {})["wpp"] || {};
    const sessionName = wpp["session_name"];
    const wppToken = wpp["token"];

    if (!sessionName || !wppToken) {
      return res.status(400).json({ error: "Organization WPP session or token not configured" });
    }

    // envia via WPP
    const result = await sendMessage(sessionName, phone, message, wppToken);

    // incrementa uso e loga
    try {
  await supaAdmin.rpc("increment_api_usage", { org: orgId });
  await supaAdmin.from("api_logs").insert({
    organization_id: orgId,
    session_name: sessionName,
    phone,
    message,
    status: "sent"
  });
} catch (_) {
  // log opcional se quiser
}

    return res.json({ ok: true, result });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "send failure" });
  }
});

export default router;
