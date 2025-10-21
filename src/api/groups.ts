import { api } from "@/lib/axios";

export interface Group {
  id: string;
  name: string;
  participants: string[];
  avatar?: string;
}

export interface CreateGroupPayload {
  session: string;
  name: string;
  participants: string[];
}

export interface GroupParticipantPayload {
  session: string;
  groupId: string;
  participantPhone: string;
}

export const groupsApi = {
  list: async (sessionName: string): Promise<Group[]> => {
    const { data } = await api.get<Group[]>(`/groups`, {
      params: { session: sessionName }
    });
    return data;
  },

  create: async (payload: CreateGroupPayload) => {
    const { data } = await api.post(`/groups/create`, payload);
    return data;
  },

  addParticipant: async (payload: GroupParticipantPayload) => {
    const { data } = await api.post(`/groups/add-participant`, payload);
    return data;
  },

  removeParticipant: async (payload: GroupParticipantPayload) => {
    const { data } = await api.post(`/groups/remove-participant`, payload);
    return data;
  }
};
