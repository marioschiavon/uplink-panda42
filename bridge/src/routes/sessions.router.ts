import { Router } from "express";
import { checkSessionLimit } from "../middlewares/checkPlanLimits.js";
import { startSession, getSessionStatus } from "../lib/wppconnectApi.js";
import { supaAdmin } from "../lib/supabaseClient.js";

const router = Router();

/** POST /sessions  body: { name: string }
 * SINGLE: não recria se já existe; só garante que está rodando.
 */
router.post("/", checkSessionLimit, async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: "Missing session name" });

    const orgId = req.user?.organization_id!;

    // já existe sessão com esse nome para a org?
    const { data: existing } = await supaAdmin
      .from("sessions")
      .select("id,name,status,qr")
      .eq("organization_id", orgId)
      .eq("name", name)
      .maybeSingle();

    // idempotência: se existir, apenas tenta garantir que está ativa
    if (existing) {
      try { await startSession(name); } catch {}
      return res.json({ ok: true, wpp: { ensured: true }, session: existing });
    }

    // cria sessão nova no WPP
    const wpp = await startSession(name);

    // persiste no banco
    await supaAdmin.from("sessions").insert({ name, organization_id: orgId, status: "starting", qr: null });

    return res.json({ ok: true, wpp });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "session failure" });
  }
});

/** GET /sessions → lista (SINGLE ou futuras MULTI) */
router.get("/", async (req, res) => {
  const orgId = req.user?.organization_id!;
  const { data, error } = await supaAdmin
    .from("sessions")
    .select("id,name,status,qr,created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ sessions: data ?? [] });
});

/** GET /sessions/:name/status → status direto do WPP */
router.get("/:name/status", async (req, res) => {
  try {
    const { name } = req.params;
    const data = await getSessionStatus(name);
    return res.json({ ok: true, status: data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "status failure" });
  }
});

export default router;
