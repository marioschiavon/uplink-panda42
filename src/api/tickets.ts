import { api } from "@/lib/axios";

export interface Ticket {
  id: string;
  company_id: string;
  customer_number: string;
  last_message: string;
  status: "waiting" | "in_progress" | "closed";
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  routing_mode: "manual" | "auto" | "hybrid";
}

/**
 * Get waiting tickets for a company
 */
export const getWaitingTickets = async (companyId: string): Promise<Ticket[]> => {
  const response = await api.get(`/tickets/waiting`, {
    params: { companyId },
  });
  return response.data.tickets;
};

/**
 * Assign ticket to an agent
 */
export const assignTicket = async (ticketId: string, agentId: string): Promise<Ticket> => {
  const response = await api.post(`/tickets/assign/${ticketId}`, {
    agentId,
  });
  return response.data.ticket;
};

/**
 * Auto-route a new ticket
 */
export const autoRouteTicket = async (
  companyId: string,
  customerNumber: string,
  lastMessage: string
): Promise<{ ticket: Ticket; routed: boolean }> => {
  const response = await api.post(`/tickets/auto-route`, {
    companyId,
    customerNumber,
    lastMessage,
  });
  return response.data;
};

/**
 * Close a ticket
 */
export const closeTicket = async (ticketId: string): Promise<Ticket> => {
  const response = await api.post(`/tickets/close/${ticketId}`);
  return response.data.ticket;
};
