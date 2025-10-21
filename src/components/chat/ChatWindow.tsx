import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "@/api/tickets";
import { TicketMessage, getTicketMessages, sendTicketMessage } from "@/api/ticketMessages";
import { useChatsStore } from "@/store/chats";
import { Loader2, Send, X, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { closeTicket } from "@/api/tickets";
import { useTicketsStore } from "@/store/tickets";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatWindowProps {
  ticket: Ticket;
  currentUserId: string;
  isAdmin: boolean;
  onClose: () => void;
}

export function ChatWindow({ ticket, currentUserId, isAdmin, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { updateTicket, removeTicket } = useTicketsStore();

  const isAssignedToMe = ticket.assigned_to === currentUserId;
  const canSendMessages = isAdmin || isAssignedToMe;

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const data = await getTicketMessages(ticket.id);
        setMessages(data);
      } catch (error: any) {
        console.error("Error loading messages:", error);
        toast({
          title: "Erro ao carregar mensagens",
          description: error.response?.data?.error || error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [ticket.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for new messages from chat store
  const chatMessages = useChatsStore((state) => state.messages[ticket.id] || []);
  useEffect(() => {
    if (chatMessages.length > 0) {
      // Convert chat messages to ticket messages format
      const newMessages = chatMessages.map((msg) => ({
        id: msg.id,
        ticket_id: ticket.id,
        sender_id: msg.isFromMe ? currentUserId : "customer",
        sender_name: msg.from,
        sender_type: msg.isFromMe ? "agent" : "customer",
        message: msg.body,
        created_at: new Date(msg.timestamp).toISOString(),
      })) as TicketMessage[];
      
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const filtered = newMessages.filter((m) => !existingIds.has(m.id));
        return [...prev, ...filtered];
      });
    }
  }, [chatMessages, ticket.id, currentUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !canSendMessages) return;

    try {
      setSending(true);
      const message = await sendTicketMessage(ticket.id, newMessage.trim());
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso",
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      setClosing(true);
      await closeTicket(ticket.id);
      
      updateTicket(ticket.id, { status: "closed" });
      removeTicket(ticket.id);
      
      toast({
        title: "Atendimento encerrado",
        description: "O atendimento foi encerrado com sucesso",
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error closing ticket:", error);
      toast({
        title: "Erro ao encerrar atendimento",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setClosing(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{ticket.customer_number}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={ticket.status === "in_progress" ? "default" : "secondary"}>
              {ticket.status === "in_progress" ? "Em andamento" : ticket.status}
            </Badge>
            {!canSendMessages && (
              <Badge variant="outline" className="text-xs">
                Somente leitura
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {canSendMessages && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCloseTicket}
              disabled={closing}
            >
              {closing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Encerrar
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Warning for non-assigned agents */}
      {!canSendMessages && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este atendimento está atribuído a outro agente. Você pode visualizar as mensagens mas não pode responder.
          </AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Nenhuma mensagem ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isFromMe = message.sender_type === "agent";
              const timeAgo = formatDistanceToNow(new Date(message.created_at), {
                addSuffix: true,
                locale: ptBR,
              });

              return (
                <div
                  key={message.id}
                  className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isFromMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {!isFromMe && (
                      <p className="text-xs font-semibold mb-1 opacity-70">
                        {message.sender_name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.message}
                    </p>
                    <p className={`text-xs mt-1 ${isFromMe ? "opacity-70" : "text-muted-foreground"}`}>
                      {timeAgo}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={canSendMessages ? "Digite sua mensagem..." : "Você não pode enviar mensagens neste atendimento"}
            disabled={!canSendMessages || sending}
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || !canSendMessages || sending}
            size="icon"
            className="h-[60px] w-[60px] shrink-0"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
