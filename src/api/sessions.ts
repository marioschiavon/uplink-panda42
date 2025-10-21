import { api } from "@/lib/axios";

export interface SessionInfo {
  id?: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'qr-ready' | 'starting';
  qr?: string;
  created_at?: string;
}

export interface SessionsResponse {
  sessions: SessionInfo[];
}

export const sessionsApi = {
  // Lista todas as sessões da organização
  async list(): Promise<SessionsResponse> {
    const response = await api.get<SessionsResponse>('/sessions');
    return response.data;
  },

  // Cria/inicia uma nova sessão
  async create(name: string): Promise<{ ok: boolean; session?: SessionInfo; wpp?: any }> {
    const response = await api.post<{ ok: boolean; session?: SessionInfo; wpp?: any }>('/sessions', { name });
    return response.data;
  },

  // Pega status de uma sessão específica
  async getStatus(name: string): Promise<{ ok: boolean; status: any }> {
    const response = await api.get<{ ok: boolean; status: any }>(`/sessions/${name}/status`);
    return response.data;
  },
};
