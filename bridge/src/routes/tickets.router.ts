import { Router } from "express";
import { supaAdmin } from "../lib/supabaseClient.js";

const router = Router();

/** GET /tickets?status=waiting|in_progress|closed&mine=true */
router.get("/", async (req, res) => {
  try {
    const orgId = req.user!.organization_id;
    const status = (req.query.status as string | undefined) || undefined;
    const onlyMine = String(req.query.mine || "false") === "true";
    const userId = req.user!.id;

    let q = supaAdmin
      .from("tickets")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (status) q = q.eq("status", status);
    if (onlyMine) q = q.eq("assigned_to", userId);

    const { data, error } = await q;
    if (error) return res.status(400).json({ error: error.message });

    return res.json({ tickets: data || [] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

/** POST /tickets/:id/assign -> assume atendimento */
router.post("/:id/assign", async (req, res) => {
  try {
    const orgId = req.user!.organization_id;
    const userId = req.user!.id;
    const { id } = req.params;

    // pega o ticket da mesma org e que esteja waiting
    const { data: tk, error: e1 } = await supaAdmin
      .from("tickets")
      .select("*")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();
    if (e1 || !tk) return res.status(404).json({ error: "Ticket not found" });
    if (tk.status !== "waiting" && req.user!.role !== "admin") {
      return res.status(400).json({ error: "Ticket not in waiting state" });
    }

    const { data, error } = await supaAdmin
      .from("tickets")
      .update({ status: "in_progress", assigned_to: userId })
      .eq("id", id)
      .eq("organization_id", orgId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // socket: notifica a org
    req.app.get("io").to(`company:${orgId}`).emit("ticket:updated", data);

    return res.json({ ticket: data });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

/** POST /tickets/:id/close -> encerra atendimento */
router.post("/:id/close", async (req, res) => {
  try {
    const orgId = req.user!.organization_id;
    const userId = req.user!.id;
    const { id } = req.params;

    // checa dono ou admin
    const { data: tk, error: e1 } = await supaAdmin
      .from("tickets")
      .select("id,assigned_to,organization_id")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();
    if (e1 || !tk) return res.status(404).json({ error: "Ticket not found" });

    if (req.user!.role !== "admin" && tk.assigned_to !== userId) {
      return res.status(403).json({ error: "Not owner of ticket" });
    }

    const { data, error } = await supaAdmin
      .from("tickets")
      .update({ status: "closed" })
      .eq("id", id)
      .eq("organization_id", orgId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    req.app.get("io").to(`company:${orgId}`).emit("ticket:updated", data);
    return res.json({ ticket: data });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
