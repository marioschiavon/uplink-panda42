import { useState, useEffect, useRef } from "react";
import { Send, Search, Check, CheckCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useChatsStore, Contact } from "@/store/chats";
import { useSessionsStore } from "@/store/sessions";
import { useWppSocket } from "@/hooks/useWppSocket";
import { useChatsInit } from "@/hooks/useChatsInit";
import { messagesApi } from "@/api/messages";
import { Message } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [playSound, setPlaySound] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize chats with mock data
  useChatsInit();

  const { sessionId } = useWppSocket({ sessionId: 'default', autoConnect: true });
  const session = useSessionsStore((state) => state.sessions[sessionId]);
  
  const {
    contacts,
    selectedContact,
    messages,
    selectContact,
    setMessages,
    addMessage,
    updateContactLastMessage,
    clearUnread,
  } = useChatsStore();

  const currentMessages = selectedContact ? messages[selectedContact] || [] : [];
  const currentContact = contacts.find((c) => c.id === selectedContact);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // Load messages when contact is selected
  useEffect(() => {
    if (selectedContact && session?.status === 'connected') {
      loadMessages(selectedContact);
      clearUnread(selectedContact);
    }
  }, [selectedContact, session?.status]);

  // Listen for new messages from socket
  useEffect(() => {
    if (!session?.messages) return;
    
    const latestMessage = session.messages[session.messages.length - 1];
    if (!latestMessage) return;

    // Play sound on new message (optional)
    if (playSound && !latestMessage.isFromMe) {
      playNotificationSound();
    }

    // Add message to chat store
    const contactId = latestMessage.from;
    addMessage(contactId, latestMessage);
    updateContactLastMessage(contactId, latestMessage.body, latestMessage.timestamp);
  }, [session?.messages]);

  const loadMessages = async (contactId: string) => {
    try {
      const history = await messagesApi.getHistory({
        session: sessionId,
        contact: contactId,
      });
      setMessages(contactId, history);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !selectedContact || !currentContact) {
      toast({
        title: "Erro",
        description: "Selecione um contato e digite uma mensagem.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await messagesApi.send({
        session: sessionId,
        phone: currentContact.phone,
        message: message.trim(),
      });

      if (response.success) {
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          from: 'me',
          body: message.trim(),
          timestamp: Date.now(),
          isFromMe: true,
        };

        addMessage(selectedContact, newMessage);
        updateContactLastMessage(selectedContact, message.trim(), Date.now());
        setMessage("");
      } else {
        throw new Error(response.error || "Erro ao enviar mensagem");
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAoTXrTp66hVFApGn+DyvmwhBjaR1/PMeSwFJHfH8N2RQAo=');
    audio.play().catch(() => {});
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Contacts Sidebar */}
      <Card className="w-80 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-3">Conversas</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contatos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma conversa encontrada
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredContacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  isSelected={selectedContact === contact.id}
                  onClick={() => selectContact(contact.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Chat Panel */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {currentContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {currentContact.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{currentContact.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentContact.phone}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={playSound}
                  onChange={(e) => setPlaySound(e.target.checked)}
                  className="rounded"
                />
                Som
              </label>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {currentMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Nenhuma mensagem ainda
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentMessages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-border flex gap-2"
            >
              <Textarea
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[60px] max-h-32 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={loading || !message.trim()}
                size="icon"
                className="h-[60px] w-[60px] flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground mb-2">
                Selecione uma conversa
              </p>
              <p className="text-sm text-muted-foreground">
                Escolha um contato para começar a conversar
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

interface ContactItemProps {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
}

function ContactItem({ contact, isSelected, onClick }: ContactItemProps) {
  const formattedTime = contact.lastMessageTime
    ? formatDistanceToNow(contact.lastMessageTime, {
        addSuffix: false,
        locale: ptBR,
      })
    : "";

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
        isSelected
          ? "bg-primary/10 border border-primary"
          : "hover:bg-muted/50"
      }`}
    >
      <Avatar>
        <AvatarFallback>
          {contact.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 text-left overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium truncate">{contact.name}</h4>
          {formattedTime && (
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {formattedTime}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {contact.lastMessage || "Sem mensagens"}
        </p>
      </div>
      {contact.unreadCount && contact.unreadCount > 0 && (
        <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium flex-shrink-0">
          {contact.unreadCount}
        </div>
      )}
    </button>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex ${message.isFromMe ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
          message.isFromMe
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none border border-border"
        }`}
      >
        {!message.isFromMe && (
          <p className="text-xs font-semibold text-muted-foreground mb-1">
            {message.from}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span
            className={`text-xs ${
              message.isFromMe ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {formattedTime}
          </span>
          {message.isFromMe && (
            <MessageStatus status="sent" />
          )}
        </div>
      </div>
    </div>
  );
}

function MessageStatus({ status }: { status: 'sending' | 'sent' | 'delivered' | 'read' }) {
  if (status === 'sending') {
    return <Clock className="h-3 w-3 text-primary-foreground/70" />;
  }
  if (status === 'sent' || status === 'delivered') {
    return <Check className="h-3 w-3 text-primary-foreground/70" />;
  }
  return <CheckCheck className="h-3 w-3 text-primary-foreground/70" />;
}
