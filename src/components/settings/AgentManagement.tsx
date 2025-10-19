import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAgents, updateUserStatus, User } from "@/api/users";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AgentManagementProps {
  companyId: string;
}

export const AgentManagement = ({ companyId }: AgentManagementProps) => {
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
  }, [companyId]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await getAgents(companyId);
      setAgents(data);
    } catch (error) {
      console.error("Error loading agents:", error);
      toast({
        title: "Erro ao carregar agentes",
        description: "Não foi possível carregar a lista de agentes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: "active" | "inactive") => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    try {
      await updateUserStatus(userId, newStatus);
      
      setAgents(prev =>
        prev.map(agent =>
          agent.id === userId ? { ...agent, status: newStatus } : agent
        )
      );

      toast({
        title: "Status atualizado",
        description: `Agente ${newStatus === "active" ? "ativado" : "desativado"} com sucesso.`,
      });
    } catch (error) {
      console.error("Error updating agent status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do agente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Agentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando agentes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gerenciar Agentes
        </CardTitle>
        <CardDescription>
          Ative ou desative agentes para controlar quem pode atender tickets
        </CardDescription>
      </CardHeader>
      <CardContent>
        {agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum agente encontrado nesta empresa.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">
                    {agent.name || "Sem nome"}
                  </TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell>
                    <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                      {agent.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(agent.created_at), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">
                        {agent.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                      <Switch
                        checked={agent.status === "active"}
                        onCheckedChange={() => handleStatusToggle(agent.id, agent.status)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
