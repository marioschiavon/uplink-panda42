import { Request, Response, NextFunction } from "express";
import { supaAdmin } from "../lib/supabaseClient.js";

export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key" });
  }

  const { data, error } = await supaAdmin
    .from("organizations")
    .select("id, name, settings")
    .eq("api_token", apiKey)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  // Anexa org na request
  (req as any).org = data; // <- TS resolve assim
  next();
}
