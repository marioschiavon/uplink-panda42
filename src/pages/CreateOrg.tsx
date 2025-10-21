import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function CreateOrg() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o nome da empresa.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Obter usuário atual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData?.user) {
        throw new Error("Usuário não autenticado");
      }

      const user = userData.user;

      // Chamar RPC para criar organização
      const { data: orgId, error: rpcError } = await supabase.rpc("create_org_and_user", {
        p_user_id: user.id,
        p_org_name: companyName.trim(),
        p_email: user.email || "",
      });

      if (rpcError) throw rpcError;

      // Atualizar metadata do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        data: { organization_id: orgId },
      });

      if (updateError) throw updateError;

      toast({
        title: "Empresa criada!",
        description: "Bem-vindo ao sistema.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating organization:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar empresa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
            <span className="text-2xl font-bold text-white">W</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Criar Organização
          </CardTitle>
          <CardDescription>
            Informe o nome da sua empresa para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Nome da Empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
                className="h-11"
                required
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar e continuar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
