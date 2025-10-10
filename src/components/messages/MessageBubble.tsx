import { Message } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const formattedTime = formatDistanceToNow(message.timestamp, {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div
      className={`flex ${message.isFromMe ? "justify-end" : "justify-start"} mb-4 animate-fade-in`}
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
        <p
          className={`text-xs mt-1 ${
            message.isFromMe ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {formattedTime}
        </p>
      </div>
    </div>
  );
}
