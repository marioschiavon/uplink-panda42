import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { supaAdmin } from "../lib/supabaseClient.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing token" });
    }

    const token = auth.slice("Bearer ".length);

    // ✅ client com ANON KEY
    const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });

    // ✅ valida JWT corretamente
    const { data: { user }, error } = await supa.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // ✅ busca perfil no banco
    const { data: profile, error: pErr } = await supaAdmin
      .from("users")
      .select("id, organization_id, role, availability, name")
      .eq("id", user.id)
      .single();

    if (pErr || !profile) {
      return res.status(403).json({ error: "Profile not found" });
    }

    req.user = {
      id: user.id,
      organization_id: profile.organization_id,
      role: profile.role,
      name: profile.name
    };

    return next();
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Auth error" });
  }
}
