import { api } from "@/lib/axios";
import { Message } from "@/types";

export interface SendMessagePayload {
  session: string;
  phone: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface GetMessagesParams {
  session: string;
  contact?: string;
}

export const messagesApi = {
  async send(payload: SendMessagePayload): Promise<SendMessageResponse> {
    const response = await api.post<SendMessageResponse>('/messages/send-text', payload);
    return response.data;
  },

  async getHistory(params: GetMessagesParams): Promise<Message[]> {
    const response = await api.get<Message[]>('/messages', { params });
    return response.data;
  },
};
