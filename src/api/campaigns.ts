import { supabase } from "@/integrations/supabase/custom-client";

export interface Campaign {
  id: string;
  name: string;
  session_name: string;
  template_id?: string;
  status: "draft" | "running" | "paused" | "completed" | "failed";
  rate_limit: number;
  total_items: number;
  sent_items: number;
  failed_items: number;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface CampaignItem {
  id: string;
  campaign_id: string;
  phone: string;
  message: string;
  status: "pending" | "sent" | "failed";
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

export const getCampaigns = async () => {
  const { data, error } = await (supabase as any)
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Campaign[];
};

export const createCampaign = async (campaign: {
  name: string;
  session_name: string;
  template_id?: string;
  rate_limit: number;
}) => {
  const { data, error } = await (supabase as any)
    .from("campaigns")
    .insert([{ ...campaign, user_id: (await supabase.auth.getUser()).data.user?.id }])
    .select()
    .single();

  if (error) throw error;
  return data as Campaign;
};

export const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
  const { data, error } = await (supabase as any)
    .from("campaigns")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Campaign;
};

export const deleteCampaign = async (id: string) => {
  const { error } = await (supabase as any)
    .from("campaigns")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const getCampaignItems = async (campaignId: string) => {
  const { data, error } = await (supabase as any)
    .from("campaign_items")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as CampaignItem[];
};

export const createCampaignItems = async (items: Array<{ campaign_id: string; phone: string; message: string }>) => {
  const { data, error } = await (supabase as any)
    .from("campaign_items")
    .insert(items)
    .select();

  if (error) throw error;
  return data as CampaignItem[];
};

export const updateCampaignItem = async (id: string, updates: Partial<CampaignItem>) => {
  const { data, error } = await (supabase as any)
    .from("campaign_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as CampaignItem;
};
