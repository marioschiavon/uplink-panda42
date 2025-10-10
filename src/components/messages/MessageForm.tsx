import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { wppApi } from "@/api/wppconnect";

export function MessageForm() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || !message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o número e a mensagem.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await wppApi.sendMessage({ phone, message });

      if (response.success) {
        toast({
          title: "Mensagem enviada",
          description: response.message || "Mensagem enviada com sucesso!",
        });
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

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border bg-card p-4 space-y-3"
    >
      <Input
        type="tel"
        placeholder="+55 11 99999-9999"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="bg-background"
      />
      <div className="flex gap-2">
        <Textarea
          placeholder="Digite sua mensagem..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[80px] resize-none bg-background"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={loading}
          className="h-full px-6"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
