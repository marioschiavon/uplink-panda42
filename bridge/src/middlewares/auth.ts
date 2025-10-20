import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { supaAdmin } from "../lib/supabaseClient.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });
    const token = auth.slice("Bearer ".length);

    const supa = createClient(SUPABASE_URL, token, { auth: { persistSession: false } });
    const { data: { user }, error } = await supa.auth.getUser();
    if (error || !user) return res.status(401).json({ error: "Invalid token" });

    const { data: profile, error: pErr } = await supaAdmin
      .from("users")
      .select("id, organization_id, role, availability, name")
      .eq("id", user.id)
      .single();

    if (pErr || !profile) return res.status(403).json({ error: "Profile not found" });

    req.user = { id: user.id, organization_id: profile.organization_id, role: profile.role, name: profile.name };
    return next();
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Auth error" });
  }
}
