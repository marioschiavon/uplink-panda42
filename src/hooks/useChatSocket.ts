import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useTicketsStore } from "@/store/tickets";
import { useChatsStore } from "@/store/chats";
import { TicketMessage } from "@/api/ticketMessages";

interface ChatSocketCallbacks {
  onMessageReceived?: (message: TicketMessage) => void;
  onTicketUpdated?: (ticketId: string, updates: any) => void;
}

export const useChatSocket = (callbacks?: ChatSocketCallbacks) => {
  const { updateTicket } = useTicketsStore();
  const { addMessage } = useChatsStore();

  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    // Listen for new messages
    socket.on("message:received", (data: TicketMessage) => {
      console.log("Message received:", data);
      
      // Add to chat store
      addMessage(data.ticket_id, {
        id: data.id,
        from: data.sender_name,
        body: data.message,
        timestamp: new Date(data.created_at).getTime(),
        isFromMe: data.sender_type === "agent",
      });

      // Update ticket last message
      updateTicket(data.ticket_id, {
        last_message: data.message,
        updated_at: data.created_at,
      });

      callbacks?.onMessageReceived?.(data);
    });

    // Listen for ticket updates
    socket.on("ticket:updated", (data: any) => {
      console.log("Ticket updated:", data);
      
      if (data.ticketId && data.updates) {
        updateTicket(data.ticketId, data.updates);
        callbacks?.onTicketUpdated?.(data.ticketId, data.updates);
      }
    });

    return () => {
      socket.off("message:received");
      socket.off("ticket:updated");
    };
  }, [addMessage, updateTicket, callbacks]);
};
