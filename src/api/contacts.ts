import { api } from "@/lib/axios";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isGroup?: boolean;
}

export const contactsApi = {
  list: async (sessionName: string): Promise<Contact[]> => {
    const { data } = await api.get(`/contacts`, {
      params: { session: sessionName }
    });
    return data;
  },

  sendMessage: async (sessionName: string, phone: string, message: string) => {
    const { data } = await api.post(`/messages/send-text`, {
      session: sessionName,
      phone,
      message
    });
    return data;
  }
};
