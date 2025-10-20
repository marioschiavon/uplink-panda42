import type { Request, Response, NextFunction } from "express";
import { supaAdmin } from "../lib/supabaseClient.js";

function extractApiKey(req: Request): string | null {
  const h = req.headers["x-api-key"];
  if (typeof h === "string" && h) return h.trim();
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice("Bearer ".length).trim();
  return null;
}

export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const key = extractApiKey(req);
    if (!key) return res.status(401).json({ error: "Missing API key" });

    const { data: org, error } = await supaAdmin
      .from("organizations")
      .select("id, name, api_token, settings")
      .eq("api_token", key)
      .single();

    if (error || !org) return res.status(401).json({ error: "Invalid API key" });

    // “fingimos” um usuário técnico atrelado à org para reutilizar req.user
    req.user = { id: `api:${org.id}`, organization_id: org.id, role: "api" };
    // opcional: anexar settings pra economizar IO
    (req as any).org_settings = org.settings;
    next();
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "API key auth error" });
  }
}
