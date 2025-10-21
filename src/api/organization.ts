import { api } from "@/lib/axios";
import { supabase } from "@/integrations/supabase/client";

export interface OrganizationApiToken {
  api_token: string;
}

export const organizationApi = {
  // Busca o api_token da organização atual via Supabase
  async getApiToken(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    if (!data?.company_id) throw new Error("Empresa não encontrada");

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("api_token")
      .eq("id", data.company_id)
      .single();

    if (companyError) throw companyError;
    return company.api_token || "";
  },

  // Rotaciona o token via backend
  async rotateApiToken(): Promise<{ api_token: string }> {
    const response = await api.post<{ api_token: string }>("/organization/rotate-api-token");
    return response.data;
  },
};
