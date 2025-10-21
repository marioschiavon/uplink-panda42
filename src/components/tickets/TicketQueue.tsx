import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTicketsStore } from "@/store/tickets";
import { assignTicket } from "@/api/tickets";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, UserPlus } from "lucide-react";

interface TicketQueueProps {
  currentUserId: string;
  isAdmin: boolean;
}

export function TicketQueue({ currentUserId, isAdmin }: TicketQueueProps) {
  const navigate = useNavigate();
  const { waitingTickets, updateTicket, setActiveTicket, company } = useTicketsStore();
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);

  const handleAssignTicket = async (ticketId: string) => {
    try {
      setAssigningTicketId(ticketId);
      
      const updatedTicket = await assignTicket(ticketId, currentUserId);
      
      updateTicket(ticketId, {
        status: "in_progress",
        assigned_to: currentUserId,
        updated_at: updatedTicket.updated_at,
      });

      toast({
        title: "Atendimento assumido",
        description: "Você assumiu este atendimento com sucesso",
      });

      // Redirect to chat
      setActiveTicket(ticketId);
      navigate("/chat");
    } catch (error: any) {
      console.error("Error assigning ticket:", error);
      toast({
        title: "Erro ao assumir atendimento",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setAssigningTicketId(null);
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
        <CardTitle>Fila de Espera</CardTitle>
        <CardDescription>
          {waitingTickets.length} ticket(s) aguardando atendimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {waitingTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum ticket aguardando</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingTickets.map((ticket) => {
                const timeAgo = formatDistanceToNow(new Date(ticket.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                });

                return (
                  <Card key={ticket.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">
                              {ticket.customer_number}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Aguardando
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{timeAgo}</p>
                          {ticket.last_message && (
                            <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
                              {ticket.last_message}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAssignTicket(ticket.id)}
                          disabled={assigningTicketId === ticket.id}
                        >
                          {assigningTicketId === ticket.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Assumindo...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assumir
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
