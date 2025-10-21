import { Router } from "express";
import { supaAdmin } from "../lib/supabaseClient.js";

const router = Router();

/**
 * POST /users
 * body: { id: uuid, name: string, email: string }
 * Cria o usuário no banco como ADMIN (signup)
 */
router.post("/", async (req: any, res) => {
  const { id, name, email } = req.body;

  if (!id || !name || !email) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const { error } = await supaAdmin
    .from("users")
    .insert({
      id,
      name,
      email,
      role: "admin",          // SIGNUP = admin
      availability: "offline",
      organization_id: null   // será apontado depois ao criar a org
    });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ ok: true });
});

export default router;
