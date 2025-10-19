import { supabase } from "@/integrations/supabase/client";
import { Company } from "./tickets";

/**
 * Update company routing mode
 */
export const updateCompanyRoutingMode = async (
  companyId: string,
  routingMode: "manual" | "auto" | "hybrid"
): Promise<Company> => {
  const { data, error } = await supabase
    .from("companies")
    .update({ routing_mode: routingMode })
    .eq("id", companyId)
    .select()
    .single();

  if (error) throw error;
  return data as Company;
};

/**
 * Get company by ID
 */
export const getCompany = async (companyId: string): Promise<Company> => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();

  if (error) throw error;
  return data as Company;
};
