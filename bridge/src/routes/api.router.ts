import { Router, Request, Response } from "express";
import { apiKeyAuth } from "../middlewares/apiKey.js";
import { sendMessage } from "../lib/wppconnectApi.js";
import { supaAdmin } from "../lib/supabaseClient.js";

const router = Router();

router.post("/send-message", apiKeyAuth, async (req: Request, res: Response) => {
  try {
    const org = (req as any).org;
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: "phone and message are required" });
    }

    const { data: orgData } = await supaAdmin
      .from("organizations")
      .select("settings")
      .eq("id", org.id)
      .single();

    const wpp = orgData?.settings?.wpp;
    if (!wpp?.session_name || !wpp?.token) {
      return res.status(400).json({ error: "WPP session not configured" });
    }

    const result = await sendMessage(wpp.session_name, phone, message, wpp.token);

    return res.json({ success: true, result });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
