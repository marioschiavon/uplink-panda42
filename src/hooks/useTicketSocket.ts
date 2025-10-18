import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useTicketsStore } from "@/store/tickets";
import { Ticket } from "@/api/tickets";
import { toast } from "@/hooks/use-toast";

interface TicketSocketEvents {
  onTicketNew?: (ticket: Ticket) => void;
  onTicketAssigned?: (ticket: Ticket, agentId: string) => void;
  onTicketWaiting?: (ticket: Ticket) => void;
  onTicketClosed?: (ticket: Ticket) => void;
}

export const useTicketSocket = (companyId: string, callbacks?: TicketSocketEvents) => {
  const { addTicket, updateTicket, removeTicket, company, setActiveTicket } = useTicketsStore();

  useEffect(() => {
    if (!companyId) return;

    const socket = getSocket();

    // Subscribe to company events
    socket.emit("subscribe:company", companyId);

    // Handle new ticket
    socket.on("ticket:new", (data: { ticket: Ticket }) => {
      console.log("🎫 New ticket:", data.ticket);
      addTicket(data.ticket);
      
      if (callbacks?.onTicketNew) {
        callbacks.onTicketNew(data.ticket);
      }
    });

    // Handle ticket assigned
    socket.on("ticket:assigned", (data: { ticket: Ticket; agentId: string }) => {
      console.log("✅ Ticket assigned:", data.ticket);
      updateTicket(data.ticket.id, {
        status: "in_progress",
        assigned_to: data.agentId,
      });

      // Auto-open chat if in auto mode and assigned to me
      const userId = sessionStorage.getItem("wpp_user");
      const currentUserId = userId ? JSON.parse(userId).id : null;

      if (company?.routing_mode === "auto" && data.agentId === currentUserId) {
        setActiveTicket(data.ticket.id);
        toast({
          title: "Novo atendimento",
          description: `Cliente ${data.ticket.customer_number}`,
        });
        
        if (callbacks?.onTicketAssigned) {
          callbacks.onTicketAssigned(data.ticket, data.agentId);
        }
      }
    });

    // Handle ticket waiting
    socket.on("ticket:waiting", (data: { ticket: Ticket }) => {
      console.log("⏳ Ticket waiting:", data.ticket);
      updateTicket(data.ticket.id, { status: "waiting" });
      
      toast({
        title: "Ticket na fila",
        description: `Cliente ${data.ticket.customer_number} aguardando`,
      });

      if (callbacks?.onTicketWaiting) {
        callbacks.onTicketWaiting(data.ticket);
      }
    });

    // Handle ticket closed
    socket.on("ticket:closed", (data: { ticket: Ticket }) => {
      console.log("🔒 Ticket closed:", data.ticket);
      updateTicket(data.ticket.id, { status: "closed" });
      
      toast({
        title: "Atendimento finalizado",
        description: `Ticket #${data.ticket.id.slice(0, 8)} encerrado`,
      });

      if (callbacks?.onTicketClosed) {
        callbacks.onTicketClosed(data.ticket);
      }
    });

    // Cleanup
    return () => {
      socket.emit("unsubscribe:company", companyId);
      socket.off("ticket:new");
      socket.off("ticket:assigned");
      socket.off("ticket:waiting");
      socket.off("ticket:closed");
    };
  }, [companyId, addTicket, updateTicket, removeTicket, company, setActiveTicket, callbacks]);
};
