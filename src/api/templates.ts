import { supabase } from "@/integrations/supabase/client";

export interface Template {
  id: string;
  name: string;
  message: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export const getTemplates = async () => {
  const { data, error } = await (supabase as any)
    .from("templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Template[];
};

export const createTemplate = async (template: { name: string; message: string; variables: string[] }) => {
  const { data, error } = await (supabase as any)
    .from("templates")
    .insert([{ ...template, user_id: (await supabase.auth.getUser()).data.user?.id }])
    .select()
    .single();

  if (error) throw error;
  return data as Template;
};

export const updateTemplate = async (id: string, template: { name: string; message: string; variables: string[] }) => {
  const { data, error } = await (supabase as any)
    .from("templates")
    .update(template)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Template;
};

export const deleteTemplate = async (id: string) => {
  const { error } = await (supabase as any)
    .from("templates")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const extractVariables = (message: string): string[] => {
  const regex = /\{\{(\w+)\}\}/g;
  const matches = message.matchAll(regex);
  return [...new Set(Array.from(matches, m => m[1]))];
};
