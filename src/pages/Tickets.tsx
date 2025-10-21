import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { TicketQueue } from "@/components/tickets/TicketQueue";
import { MyTickets } from "@/components/tickets/MyTickets";
import { RoutingModeSelector } from "@/components/tickets/RoutingModeSelector";
import { TicketStats } from "@/components/tickets/TicketStats";
import { CreateTicketDemo } from "@/components/tickets/CreateTicketDemo";
import { useTicketsStore } from "@/store/tickets";
import { useTicketSocket } from "@/hooks/useTicketSocket";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useUserRole } from "@/hooks/useUserRole";
import { getWaitingTickets } from "@/api/tickets";
import { getCurrentUser } from "@/api/users";
import { toast } from "@/hooks/use-toast";

const Tickets = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading, isAdmin } = useUserRole();
  const { setTickets, setCompany, company } = useTicketsStore();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Load current user and company
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setCurrentUserId(userData.id);
          setCompany({
            id: userData.company_id,
            name: "Minha Empresa",
            routing_mode: "hybrid",
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    if (!userLoading) {
      loadUserData();
    }
  }, [userLoading, setCompany]);

  // Load initial tickets
  useEffect(() => {
    const loadTickets = async () => {
      if (!company) return;

      try {
        setLoading(true);
        const tickets = await getWaitingTickets(company.id);
        setTickets(tickets);
      } catch (error: any) {
        console.error("Error loading tickets:", error);
        toast({
          title: "Erro ao carregar tickets",
          description: error.response?.data?.error || error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [company, setTickets]);

  // Initialize socket connections for real-time updates
  useTicketSocket(company?.id || "", {
    onTicketAssigned: (ticket, agentId) => {
      console.log("Ticket assigned via socket:", ticket, agentId);
      toast({
        title: "Ticket atribuído",
        description: `Ticket ${ticket.customer_number} foi atribuído`,
      });
    },
    onTicketWaiting: (ticket) => {
      console.log("Ticket waiting via socket:", ticket);
    },
  });

  // Initialize chat socket for realtime messages
  useChatSocket();

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Atendimentos</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seus tickets e atendimentos em tempo real
        </p>
      </div>

      <TicketStats />

      {/* Admin-only sections */}
      {isAdmin && (
        <div className="grid gap-6 md:grid-cols-2">
          <RoutingModeSelector />
          <CreateTicketDemo />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <MyTickets currentUserId={currentUserId} isAdmin={isAdmin} />
        <TicketQueue currentUserId={currentUserId} isAdmin={isAdmin} />
      </div>
    </div>
  );
};

export default Tickets;
