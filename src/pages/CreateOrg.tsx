import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function CreateOrg() {
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o nome da organização.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Obtém o usuário logado
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error("Usuário não autenticado.");

      const user = userData.user;

      // Cria nova organização
      const { data: orgData, error: orgError } = await (supabase as any)
  .from("organizations")
        .insert([
          {
            name: orgName.trim(),
            plan: "free",
            routing_mode: "manual",
            session_limit: 1,
            agent_limit: 2,
            api_message_limit: 1000,
            api_message_usage: 0,
          },
        ])
        .select()
        .single();

      if (orgError) throw orgError;

      // Atualiza o usuário com o ID da organização
      const { error: updateError } = await (supabase as any)
  .from("users")
  .update({ organization_id: orgData.id })
  .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Organização criada com sucesso!",
        description: "Você será redirecionado ao painel.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro ao criar organização:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar organização. Tente novamente.",
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
          <CardDescription>Informe o nome da sua empresa para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Nome da Organização"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
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
