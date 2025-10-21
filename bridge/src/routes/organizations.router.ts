import { Router } from "express";
import { supaAdmin } from "../lib/supabaseClient.js";

const router = Router();

/**
 * GET /organization/me
 * Retorna a organização vinculada ao usuário logado (ORG-ÚNICA)
 */
router.get("/me", async (req: any, res) => {
  try {
    const orgId = req.user?.organization_id;
    if (!orgId) return res.status(404).json({ error: "Usuário sem organização vinculada" });

    const { data: org, error } = await supaAdmin
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();

    if (error || !org) return res.status(404).json({ error: "Organização não encontrada" });

    return res.json({ organization: org });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /organization
 * Cria uma nova organização e vincula o usuário logado como ADMIN
 */
router.post("/", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const { name } = req.body || {};

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!name) return res.status(400).json({ error: "Name is required" });

    // Cria a organização
    const { data: org, error: e1 } = await supaAdmin
      .from("organizations")
      .insert({
        name,
        plan: "starter",
        routing_mode: "manual",
        session_limit: 1,
        agent_limit: 1,
        api_message_limit: 3000,
        api_message_usage: 0
      })
      .select()
      .single();

    if (e1) return res.status(500).json({ error: "Erro ao criar organização" });

    // Atualiza o usuário para vincular à nova org
    const { error: e2 } = await supaAdmin
      .from("users")
      .update({ organization_id: org.id, role: "admin" })
      .eq("id", userId);

    if (e2) return res.status(500).json({ error: "Erro ao vincular usuário à organização" });

    return res.json({ organization: org, role: "admin" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
