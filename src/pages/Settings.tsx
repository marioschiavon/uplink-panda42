import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoutingModeSelector } from "@/components/tickets/RoutingModeSelector";
import { AgentManagement } from "@/components/settings/AgentManagement";
import { getCurrentUser } from "@/api/users";
import { getCompany } from "@/api/company";
import { useTicketsStore } from "@/store/tickets";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "agent" | null>(null);
  const { company, setCompany } = useTicketsStore();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      
      if (user) {
        setUserRole(user.role);
        
        // Load company data if not already loaded
        if (!company) {
          const companyData = await getCompany(user.company_id);
          setCompany(companyData);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem acessar as configurações da empresa.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Empresa não encontrada</CardTitle>
            <CardDescription>
              Não foi possível carregar as informações da empresa.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua empresa
        </p>
      </div>

      <Tabs defaultValue="routing" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="routing">Roteamento</TabsTrigger>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
        </TabsList>

        <TabsContent value="routing" className="space-y-4">
          <RoutingModeSelector />
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <AgentManagement companyId={company.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
