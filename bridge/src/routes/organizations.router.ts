import { Router } from "express";
import { supaAdmin } from "../lib/supabaseClient.js";

const router = Router();

router.get("/", async (req, res) => {
  const orgId = req.user?.organization_id!;
  const { data, error } = await supaAdmin
    .from("organizations")
    .select("id,name,plan,routing_mode,session_limit,agent_limit,api_message_limit,api_message_usage")
    .eq("id", orgId)
    .single();
  if (error || !data) return res.status(404).json({ error: "Organization not found" });
  return res.json(data);
});

export default router;
