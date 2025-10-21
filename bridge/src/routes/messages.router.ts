import { Router } from "express";
import { supaAdmin } from "../lib/supabaseClient.js";
import { sendMessage } from "../lib/wppconnectApi.js";

const router = Router();

/** GET /messages/:ticketId -> lista mensagens do ticket */
router.get("/:ticketId", async (req, res) => {
  try {
    const orgId = req.user!.organization_id;
    const { ticketId } = req.params;

    // valida ticket
    const { data: tk, error: e1 } = await supaAdmin
      .from("tickets").select("id,organization_id").eq("id", ticketId).single();
    if (e1 || !tk || tk.organization_id !== orgId) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const { data, error } = await supaAdmin
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ messages: data || [] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

/** POST /messages -> { ticketId, text } (somente dono ou admin) */
router.post("/", async (req, res) => {
  try {
    const orgId = req.user!.organization_id;
    const userId = req.user!.id;
    const role = req.user!.role;
    const { ticketId, text } = req.body || {};
    if (!ticketId || !text) return res.status(400).json({ error: "Missing fields" });

    // ticket
    const { data: tk, error: e1 } = await supaAdmin
      .from("tickets")
      .select("id,organization_id,assigned_to,customer_number")
      .eq("id", ticketId)
      .eq("organization_id", orgId)
      .single();
    if (e1 || !tk) return res.status(404).json({ error: "Ticket not found" });

    if (role !== "admin" && tk.assigned_to !== userId) {
      return res.status(403).json({ error: "Not owner of ticket" });
    }

    // pega config WPP da org
    const { data: org, error: e2 } = await supaAdmin
      .from("organizations")
      .select("settings")
      .eq("id", orgId)
      .single();
    if (e2 || !org) return res.status(400).json({ error: "Org not found" });

    const wpp = (org.settings || {})["wpp"] || {};
    const sessionName = wpp["session_name"];
    const wppToken = wpp["token"];
    if (!sessionName || !wppToken) {
      return res.status(400).json({ error: "WPP session/token not configured" });
    }

    // envia via WPP
    await sendMessage(sessionName, tk.customer_number, text, wppToken);

    // grava no histórico
    const { data: msg, error } = await supaAdmin
      .from("ticket_messages")
      .insert({
        ticket_id: ticketId,
        sender: "agent",
        text
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // socket: entrega para quem está no chat
    const io = req.app.get("io");
    io.to(`company:${orgId}`).emit("message:received", {
      ticketId,
      message: msg
    });

    return res.json({ message: msg });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
