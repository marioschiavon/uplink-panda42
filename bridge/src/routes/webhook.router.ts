import { Router } from "express";
import { supaAdmin } from "../lib/supabaseClient.js";
import { createOrFindOpenTicket } from "../services/ticketService.js";
import { createCustomerMessage } from "../services/messageService.js";

const router = Router();

router.post("/webhook", async (req, res) => {
  try {
    const PANEL_TOKEN = process.env.PANEL_TOKEN!;
    const token = req.headers["x-panel-token"];

    if (token !== PANEL_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { organization_id, customer_number, text } = req.body;
    if (!organization_id || !customer_number || !text) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // 1) cria ou obtém ticket
    const ticket = await createOrFindOpenTicket({
      organization_id,
      customer_number,
      last_message: text,
    });

    // 2) cria mensagem vinculada ao ticket
    const message = await createCustomerMessage({
      ticket_id: ticket.id,
      organization_id,
      text,
    });

    // 3) emite sockets
    const io = req.app.get("io");
    io.emit("ticket:updated", ticket);
    io.emit("message:received", { ...message, ticket_id: ticket.id });

    return res.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
