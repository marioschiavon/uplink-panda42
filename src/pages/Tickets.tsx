import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { TicketQueue } from "@/components/tickets/TicketQueue";
import { MyTickets } from "@/components/tickets/MyTickets";
import { RoutingModeSelector } from "@/components/tickets/RoutingModeSelector";
import { TicketStats } from "@/components/tickets/TicketStats";
import { CreateTicketDemo } from "@/components/tickets/CreateTicketDemo";
import { useTicketsStore } from "@/store/tickets";
import { useTicketSocket } from "@/hooks/useTicketSocket";
import { getWaitingTickets } from "@/api/tickets";
import { toast } from "@/hooks/use-toast";

const Tickets = () => {
  const { setTickets, setCompany, company } = useTicketsStore();
  const [loading, setLoading] = useState(true);

  // Mock company data - in production this would come from auth/API
  useEffect(() => {
    const mockCompany = {
      id: "company-123",
      name: "Minha Empresa",
      routing_mode: "hybrid" as const, // Change to "manual" or "auto" to test
    };
    setCompany(mockCompany);
  }, [setCompany]);

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

  // Initialize socket connection for real-time updates
  useTicketSocket(company?.id || "", {
    onTicketAssigned: (ticket, agentId) => {
      console.log("Ticket assigned via socket:", ticket, agentId);
    },
    onTicketWaiting: (ticket) => {
      console.log("Ticket waiting via socket:", ticket);
    },
  });

  if (loading) {
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

      <div className="grid gap-6 md:grid-cols-2">
        <RoutingModeSelector />
        <CreateTicketDemo />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MyTickets />
        <TicketQueue />
      </div>
    </div>
  );
};

export default Tickets;
