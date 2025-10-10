import { useWppSocket } from "@/hooks/useWppSocket";
import { useSessionsStore } from "@/store/sessions";
import { MessageList } from "@/components/messages/MessageList";
import { MessageForm } from "@/components/messages/MessageForm";
import { Card } from "@/components/ui/card";

export default function Messages() {
  // Initialize socket connection and get messages from Zustand
  const { sessionId } = useWppSocket({ sessionId: 'default', autoConnect: true });
  const session = useSessionsStore((state) => state.sessions[sessionId]);
  
  const messages = session?.messages || [];
  const loading = !session;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mensagens</h1>
        <p className="text-muted-foreground mt-2">
          Envie e visualize mensagens do WhatsApp
        </p>
      </div>

      <Card className="flex h-[calc(100vh-16rem)] flex-col overflow-hidden">
        <MessageList messages={messages} loading={loading} />
        <MessageForm />
      </Card>
    </div>
  );
}
