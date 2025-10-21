import { Router } from "express";
import { supaAdmin } from "../lib/supabaseClient.js";

const router = Router();

/** POST /internal/wpp/message
 * Headers: x-panel-token: <PANEL_TOKEN>
 * Body: { organization_id, customer_number, text }
 */
router.post("/wpp/message", async (req, res) => {
  try {
    const key = req.headers["x-panel-token"];
    if (key !== process.env.PANEL_TOKEN) return res.status(401).json({ error: "Unauthorized" });

    const { organization_id, customer_number, text } = req.body || {};
    if (!organization_id || !customer_number) return res.status(400).json({ error: "Missing fields" });

    // tenta achar ticket aberto para esse cliente
    const { data: openTk } = await supaAdmin
      .from("tickets")
      .select("id,status")
      .eq("organization_id", organization_id)
      .eq("customer_number", customer_number)
      .in("status", ["waiting","in_progress"])
      .limit(1)
      .maybeSingle();

    let ticketId = openTk?.id;

    // se não tiver, cria novo ticket em waiting
    if (!ticketId) {
      const { data: tk, error: e2 } = await supaAdmin
        .from("tickets")
        .insert({
          organization_id,
          customer_number,
          status: "waiting",
          last_message: text || null
        })
        .select()
        .single();
      if (e2) return res.status(400).json({ error: e2.message });
      ticketId = tk.id;

      // socket: novo ticket na fila
      req.app.get("io").to(`company:${organization_id}`).emit("ticket:updated", tk);
    }

    // grava mensagem (customer)
    const { data: msg, error } = await supaAdmin
      .from("ticket_messages")
      .insert({ ticket_id: ticketId, sender: "customer", text })
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });

    // socket: entrega no chat
    req.app.get("io").to(`company:${organization_id}`).emit("message:received", {
      ticketId,
      message: msg
    });

    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
