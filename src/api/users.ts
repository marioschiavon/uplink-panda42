import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: "admin" | "agent";
  status: "active" | "inactive";
  company_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all agents from the user's company
 */
export const getAgents = async (companyId: string): Promise<User[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("company_id", companyId)
    .eq("role", "agent")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as User[];
};

/**
 * Update user status (active/inactive)
 */
export const updateUserStatus = async (
  userId: string,
  status: "active" | "inactive"
): Promise<User> => {
  const { data, error } = await supabase
    .from("users")
    .update({ status })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as User;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data as User;
};
