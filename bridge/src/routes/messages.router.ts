import { Router } from "express";
import { checkApiLimit } from "../middlewares/checkPlanLimits.js";
import { sendMessage } from "../lib/wppconnectApi.js";
import { supaAdmin } from "../lib/supabaseClient.js";

const router = Router();

/** POST /messages/send  body: { session: string, phone: string, text: string } */
router.post("/send", checkApiLimit, async (req, res) => {
  try {
    const { session, phone, text } = req.body || {};
    if (!session || !phone || !text) return res.status(400).json({ error: "Missing session/phone/text" });

    const result = await sendMessage(session, phone, text);

    // incrementa uso da API
    const orgId = req.user?.organization_id!;
    await supaAdmin.rpc("increment_api_usage", { org: orgId });

    // log
    await supaAdmin.from("api_logs").insert({
      organization_id: orgId, session_name: session, phone, message: text, status: "sent"
    });

    return res.json({ ok: true, result });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "send failure" });
  }
});

export default router;
