import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { autoRouteTicket } from "@/api/tickets";
import { toast } from "@/hooks/use-toast";
import { useTicketsStore } from "@/store/tickets";

export const CreateTicketDemo = () => {
  const { company } = useTicketsStore();
  const [loading, setLoading] = useState(false);
  const [customerNumber, setCustomerNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!company) {
      toast({
        title: "Erro",
        description: "Empresa não configurada",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { ticket, routed } = await autoRouteTicket(
        company.id,
        customerNumber,
        message
      );

      toast({
        title: routed ? "Ticket atribuído" : "Ticket criado",
        description: routed
          ? `Atribuído automaticamente`
          : `Adicionado à fila de espera`,
      });

      // Clear form
      setCustomerNumber("");
      setMessage("");
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Erro ao criar ticket",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Criar Ticket (Demo)
        </CardTitle>
        <CardDescription>
          Simule a criação de um novo ticket para testes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerNumber">Número do Cliente</Label>
            <Input
              id="customerNumber"
              placeholder="5511999999999"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Olá, preciso de ajuda com..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Criando..." : "Criar Ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
