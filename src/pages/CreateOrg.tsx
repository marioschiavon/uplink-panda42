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
        description: "Informe o nome da sua organização.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Pega o usuário logado
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error("Usuário não autenticado.");

      const user = userData.user;

      // 2️⃣ Cria a nova organização
      const { data: org, error: orgError } = await (supabase as any)
        .from("organizations")
        .insert([{ name: orgName.trim(), plan: "basic" }])
        .select()
        .single();

      if (orgError) throw orgError;

      // 3️⃣ Atualiza o usuário com o ID da organização
      const { error: updateError } = await supabase
        .from("users")
        .update({ organization_id: org.id, role: "admin" })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // 4️⃣ Feedback e redirecionamento
      toast({
        title: "Organização criada!",
        description: "Sua conta foi vinculada à nova organização.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Erro ao criar organização:", err);
      toast({
        title: "Erro ao criar organização",
        description: err.message || "Falha ao criar sua organização. Tente novamente.",
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
            <Input
              type="text"
              placeholder="Nome da organização"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              disabled={loading}
              required
              className="h-11"
            />
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar e continuar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
