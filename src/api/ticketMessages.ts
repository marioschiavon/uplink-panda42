import { api } from "@/lib/axios";

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: "agent" | "customer";
  message: string;
  created_at: string;
}

/**
 * Get messages for a ticket
 */
export const getTicketMessages = async (ticketId: string): Promise<TicketMessage[]> => {
  const response = await api.get(`/messages/${ticketId}`);
  return response.data.messages || [];
};

/**
 * Send message to ticket
 */
export const sendTicketMessage = async (
  ticketId: string,
  message: string
): Promise<TicketMessage> => {
  const response = await api.post("/messages", {
    ticketId,
    message,
  });
  return response.data.message;
};
