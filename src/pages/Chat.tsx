import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketList } from "@/components/chat/TicketList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useTicketsStore } from "@/store/tickets";
import { useUserRole } from "@/hooks/useUserRole";
import { useChatSocket } from "@/hooks/useChatSocket";
import { getWaitingTickets } from "@/api/tickets";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/api/users";

const Chat = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading, isAdmin } = useUserRole();
  const { tickets, setTickets, activeTicketId, setActiveTicket } = useTicketsStore();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Initialize chat socket for realtime updates
  useChatSocket();

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadCurrentUser();
  }, []);

  // Load tickets
  useEffect(() => {
    const loadTickets = async () => {
      if (!user?.company_id) return;

      try {
        setLoading(true);
        const allTickets = await getWaitingTickets(user.company_id);
        setTickets(allTickets);
      } catch (error: any) {
        console.error("Error loading tickets:", error);
        toast({
          title: "Erro ao carregar atendimentos",
          description: error.response?.data?.error || error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      loadTickets();
    }
  }, [user, userLoading, setTickets]);

  // Filter tickets based on user role
  const inProgressTickets = tickets.filter((t) => {
    if (t.status !== "in_progress") return false;
    // Admin sees all in_progress tickets
    if (isAdmin) return true;
    // Agent sees only their tickets
    return t.assigned_to === currentUserId;
  });

  const selectedTicket = activeTicketId
    ? tickets.find((t) => t.id === activeTicketId)
    : null;

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/tickets")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
          <p className="text-muted-foreground mt-1">
            Converse com seus clientes em tempo real
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-6rem)]">
        {/* Ticket List */}
        <div className="lg:col-span-1">
          <TicketList
            tickets={inProgressTickets}
            selectedTicketId={activeTicketId}
            onSelectTicket={setActiveTicket}
          />
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <ChatWindow
              ticket={selectedTicket}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onClose={() => setActiveTicket(null)}
            />
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Selecione um atendimento para começar a conversar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
