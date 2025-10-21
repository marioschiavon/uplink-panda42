import { Router } from "express";
import { supaAdmin } from "../lib/supabaseClient.js";

const router = Router();

/**
 * GET /organization/me
 * Retorna a organização vinculada ao usuário logado (ORG-ÚNICA)
 */
router.get("/me", async (req: any, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { data: pivot, error: e1 } = await supaAdmin
    .from("user_organization")
    .select("organization_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (e1) return res.status(500).json({ error: "DB error" });
  if (!pivot) return res.json({ organization: null });

  const { data: org, error: e2 } = await supaAdmin
    .from("organizations")
    .select("*")
    .eq("id", pivot.organization_id)
    .single();

  if (e2) return res.status(500).json({ error: "DB error" });

  return res.json({ organization: org, role: pivot.role });
});

/**
 * POST /organization
 * Cria organização e vincula o usuário como ADMIN
 * body: { name: string }
 */
router.post("/", async (req: any, res) => {
  const userId = req.user?.id;
  const { name } = req.body || {};
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!name) return res.status(400).json({ error: "Name is required" });

  // Já tem org?
  const { data: existing } = await supaAdmin
    .from("user_organization")
    .select("organization_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({ error: "User already has an organization" });
  }

  // Cria org
  const { data: org, error: e1 } = await supaAdmin
    .from("organizations")
    .insert({ name })
    .select()
    .single();

  if (e1) return res.status(500).json({ error: "Error creating organization" });

  // Vincula user como ADMIN
  const { error: e2 } = await supaAdmin
    .from("user_organization")
    .insert({ user_id: userId, organization_id: org.id, role: "admin" });

  if (e2) return res.status(500).json({ error: "Error linking user to org" });

  return res.json({ organization: org, role: "admin" });
});

export default router;
