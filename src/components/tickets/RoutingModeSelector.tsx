import { Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTicketsStore } from "@/store/tickets";
import { updateCompanyRoutingMode } from "@/api/company";
import { useToast } from "@/hooks/use-toast";

export const RoutingModeSelector = () => {
  const { company, setCompany } = useTicketsStore();
  const { toast } = useToast();

  const handleRoutingModeChange = async (mode: "manual" | "auto" | "hybrid") => {
    if (!company) return;

    try {
      const updatedCompany = await updateCompanyRoutingMode(company.id, mode);
      setCompany(updatedCompany);
      
      toast({
        title: "Modo de roteamento atualizado",
        description: `Modo alterado para ${mode === "manual" ? "Manual" : mode === "auto" ? "Automático" : "Híbrido"}.`,
      });
    } catch (error) {
      console.error("Error updating routing mode:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o modo de roteamento.",
        variant: "destructive",
      });
    }
  };

  if (!company) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Modo de Roteamento
        </CardTitle>
        <CardDescription>
          Configure como os tickets são distribuídos para os agentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={company.routing_mode}
          onValueChange={handleRoutingModeChange}
          className="space-y-4"
        >
          <div className="flex items-start space-x-3 space-y-0">
            <RadioGroupItem value="manual" id="manual" />
            <div className="space-y-1">
              <Label htmlFor="manual" className="font-medium cursor-pointer">
                Manual
              </Label>
              <p className="text-sm text-muted-foreground">
                Todos os tickets vão para fila. Agentes escolhem qual atender.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-y-0">
            <RadioGroupItem value="auto" id="auto" />
            <div className="space-y-1">
              <Label htmlFor="auto" className="font-medium cursor-pointer">
                Automático
              </Label>
              <p className="text-sm text-muted-foreground">
                Distribui automaticamente para o agente menos ocupado (round-robin).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-y-0">
            <RadioGroupItem value="hybrid" id="hybrid" />
            <div className="space-y-1">
              <Label htmlFor="hybrid" className="font-medium cursor-pointer">
                Híbrido
              </Label>
              <p className="text-sm text-muted-foreground">
                Auto se houver agente livre, senão vai para fila.
              </p>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
