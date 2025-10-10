import { create } from "zustand";
import { Campaign, CampaignItem } from "@/api/campaigns";

interface CampaignsState {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  campaignItems: CampaignItem[];
  setCampaigns: (campaigns: Campaign[]) => void;
  setActiveCampaign: (campaign: Campaign | null) => void;
  setCampaignItems: (items: CampaignItem[]) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  updateCampaignItem: (id: string, updates: Partial<CampaignItem>) => void;
}

export const useCampaignsStore = create<CampaignsState>((set) => ({
  campaigns: [],
  activeCampaign: null,
  campaignItems: [],
  setCampaigns: (campaigns) => set({ campaigns }),
  setActiveCampaign: (campaign) => set({ activeCampaign: campaign }),
  setCampaignItems: (items) => set({ campaignItems: items }),
  updateCampaign: (id, updates) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
      activeCampaign:
        state.activeCampaign?.id === id
          ? { ...state.activeCampaign, ...updates }
          : state.activeCampaign,
    })),
  updateCampaignItem: (id, updates) =>
    set((state) => ({
      campaignItems: state.campaignItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
}));
