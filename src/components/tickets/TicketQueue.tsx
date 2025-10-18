import { useState } from "react";
import { Clock, User, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useTicketsStore } from "@/store/tickets";
import { assignTicket } from "@/api/tickets";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const TicketQueue = () => {
  const { waitingTickets, company, updateTicket } = useTicketsStore();
  const [loadingTicketId, setLoadingTicketId] = useState<string | null>(null);

  const handleAssignTicket = async (ticketId: string) => {
    try {
      setLoadingTicketId(ticketId);
      
      // Get current user ID
      const userStr = sessionStorage.getItem("wpp_user");
      if (!userStr) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }
      
      const user = JSON.parse(userStr);
      const agentId = user.id;

      // Assign ticket
      const updatedTicket = await assignTicket(ticketId, agentId);
      
      updateTicket(ticketId, {
        status: "in_progress",
        assigned_to: agentId,
      });

      toast({
        title: "Atendimento assumido",
        description: "Você agora está atendendo este cliente",
      });
    } catch (error: any) {
      console.error("Error assigning ticket:", error);
      toast({
        title: "Erro ao assumir atendimento",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingTicketId(null);
    }
  };

  // Don't show queue in auto mode
  if (company?.routing_mode === "auto") {
    return null;
  }

  // Show queue in manual mode always, in hybrid mode only if there are waiting tickets
  const shouldShowQueue = 
    company?.routing_mode === "manual" || 
    (company?.routing_mode === "hybrid" && waitingTickets.length > 0);

  if (!shouldShowQueue) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Fila de Espera
        </CardTitle>
        <CardDescription>
          {waitingTickets.length === 0
            ? "Nenhum cliente aguardando"
            : `${waitingTickets.length} cliente(s) aguardando atendimento`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {waitingTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-center">A fila está vazia no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {waitingTickets.map((ticket) => (
                <Card key={ticket.id} className="border-l-4 border-l-warning">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{ticket.customer_number}</span>
                          <Badge variant="outline" className="ml-auto">
                            {formatDistanceToNow(new Date(ticket.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </Badge>
                        </div>
                        
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <p className="line-clamp-2">{ticket.last_message}</p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleAssignTicket(ticket.id)}
                        disabled={loadingTicketId === ticket.id}
                      >
                        {loadingTicketId === ticket.id ? (
                          <>
                            <Skeleton className="h-4 w-4 mr-2" />
                            Assumindo...
                          </>
                        ) : (
                          "Assumir"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
