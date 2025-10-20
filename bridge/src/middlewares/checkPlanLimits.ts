import type { Request, Response, NextFunction } from "express";
import { supaAdmin } from "../lib/supabaseClient.js";

export async function checkApiLimit(req: Request, res: Response, next: NextFunction) {
  const orgId = req.user?.organization_id;
  if (!orgId) return res.status(400).json({ error: "No organization" });

  const { data: org, error } = await supaAdmin
    .from("organizations")
    .select("id, api_message_limit, api_message_usage")
    .eq("id", orgId)
    .single();

  if (error || !org) return res.status(404).json({ error: "Organization not found" });
  if (org.api_message_limit != null && (org.api_message_usage ?? 0) >= org.api_message_limit) {
    return res.status(429).json({ error: "API message limit exceeded for this organization plan" });
  }
  return next();
}

export async function checkSessionLimit(req: Request, res: Response, next: NextFunction) {
  const orgId = req.user?.organization_id;
  if (!orgId) return res.status(400).json({ error: "No organization" });

  const [{ data: org, error: oErr }, { count, error: cErr }] = await Promise.all([
    supaAdmin.from("organizations").select("session_limit").eq("id", orgId).single(),
    supaAdmin.from("sessions").select("id", { count: "exact", head: true }).eq("organization_id", orgId)
  ]);

  if (oErr || !org) return res.status(404).json({ error: "Organization not found" });
  if (cErr) return res.status(500).json({ error: "Count error" });

  const used = count ?? 0;
  if (org.session_limit != null && used >= org.session_limit) {
    return res.status(403).json({ error: "Session limit reached for this organization" });
  }
  return next();
}
