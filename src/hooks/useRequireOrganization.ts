import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { supabase } from "@/integrations/supabase/client";

interface Organization {
  id: string;
  name: string;
  api_token?: string;
}

export const useRequireOrganization = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkOrganization = async () => {
      try {
        // Verificar se está autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/");
          return;
        }

        // Verificar se tem organização
        const response = await api.get("/organization/me");
        const org = response.data.organization;

        if (!org) {
          navigate("/create-org");
          return;
        }

        setOrganization(org);
      } catch (error) {
        console.error("Error checking organization:", error);
        navigate("/create-org");
      } finally {
        setLoading(false);
      }
    };

    checkOrganization();
  }, [navigate]);

  return { organization, loading };
};
