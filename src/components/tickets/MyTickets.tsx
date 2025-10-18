import { MessageSquare, Clock, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTicketsStore } from "@/store/tickets";
import { closeTicket } from "@/api/tickets";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export const MyTickets = () => {
  const { myTickets, updateTicket, setActiveTicket, activeTicketId } = useTicketsStore();
  const [closingTicketId, setClosingTicketId] = useState<string | null>(null);

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

  const activeTickets = myTickets.filter((t) => t.status === "in_progress");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Meus Atendimentos
        </CardTitle>
        <CardDescription>
          {activeTickets.length === 0
            ? "Você não tem atendimentos ativos"
            : `${activeTickets.length} atendimento(s) ativo(s)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {activeTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-center">Nenhum atendimento ativo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className={`cursor-pointer border-l-4 transition-colors ${
                    activeTicketId === ticket.id 
                      ? "border-l-primary bg-accent" 
                      : "border-l-success hover:bg-accent/50"
                  }`}
                  onClick={() => setActiveTicket(ticket.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ticket.customer_number}</span>
                          <Badge variant="default" className="ml-auto">
                            Em atendimento
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(ticket.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ticket.last_message}
                        </p>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseTicket(ticket.id);
                        }}
                        disabled={closingTicketId === ticket.id}
                      >
                        <X className="h-4 w-4" />
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
