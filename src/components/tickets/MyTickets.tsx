import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTicketsStore } from "@/store/tickets";
import { closeTicket } from "@/api/tickets";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, X, MessageSquare } from "lucide-react";

interface MyTicketsProps {
  currentUserId: string;
  isAdmin: boolean;
}

export function MyTickets({ currentUserId, isAdmin }: MyTicketsProps) {
  const navigate = useNavigate();
  const { tickets, updateTicket, setActiveTicket, activeTicketId } = useTicketsStore();
  const [closingTicketId, setClosingTicketId] = useState<string | null>(null);

  // Filter tickets based on role
  const myTickets = tickets.filter((t) => {
    if (t.status !== "in_progress") return false;
    // Admin sees all in_progress tickets
    if (isAdmin) return true;
    // Agent sees only their tickets
    return t.assigned_to === currentUserId;
  });

  const handleCloseTicket = async (ticketId: string) => {
    try {
      setClosingTicketId(ticketId);
      await closeTicket(ticketId);
      
      updateTicket(ticketId, { status: "closed" });
      
      if (activeTicketId === ticketId) {
        setActiveTicket(null);
      }

      toast({
        title: "Atendimento finalizado",
        description: "O ticket foi encerrado com sucesso",
      });
    } catch (error: any) {
      console.error("Error closing ticket:", error);
      toast({
        title: "Erro ao finalizar",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setClosingTicketId(null);
    }
  };

  const handleOpenChat = (ticketId: string) => {
    setActiveTicket(ticketId);
    navigate("/chat");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meus Atendimentos</CardTitle>
        <CardDescription>
          {myTickets.length} atendimento(s) ativo(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {myTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum atendimento ativo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTickets.map((ticket) => {
                return (
                  <Card key={ticket.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">
                              {ticket.customer_number}
                            </span>
                            <Badge variant="default" className="text-xs">
                              Em andamento
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(ticket.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                          {ticket.last_message && (
                            <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
                              {ticket.last_message}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenChat(ticket.id)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCloseTicket(ticket.id)}
                            disabled={closingTicketId === ticket.id}
                          >
                            {closingTicketId === ticket.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
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
