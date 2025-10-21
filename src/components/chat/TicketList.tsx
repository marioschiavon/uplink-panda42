import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "@/api/tickets";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare } from "lucide-react";

interface TicketListProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
}

export function TicketList({ tickets, selectedTicketId, onSelectTicket }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center p-6">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nenhum atendimento em andamento</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Conversas Ativas</h3>
        <p className="text-sm text-muted-foreground">{tickets.length} atendimento(s)</p>
      </div>
      <ScrollArea className="h-[calc(100%-5rem)]">
        <div className="space-y-1 p-2">
          {tickets.map((ticket) => {
            const isSelected = ticket.id === selectedTicketId;
            const timeAgo = formatDistanceToNow(new Date(ticket.created_at), {
              addSuffix: true,
              locale: ptBR,
            });

            return (
              <button
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  isSelected
                    ? "bg-primary/10 border-2 border-primary"
                    : "hover:bg-muted border-2 border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-medium text-sm truncate">
                    {ticket.customer_number}
                  </span>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {ticket.status === "in_progress" ? "Em andamento" : ticket.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate mb-1">
                  {ticket.last_message || "Sem mensagens"}
                </p>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
