import { api } from "@/lib/axios";

export interface SessionInfo {
  name: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'qr-ready';
  qrCode?: string;
}

export const sessionsApi = {
  async list(): Promise<SessionInfo[]> {
    const response = await api.get('/sessions');
    return response.data;
  },

  async start(sessionName: string): Promise<SessionInfo> {
    const response = await api.post('/sessions/start', { session: sessionName });
    return response.data;
  },

  async getStatus(sessionName: string): Promise<SessionInfo> {
    const response = await api.get(`/sessions/${sessionName}/status`);
    return response.data;
  },

  async close(sessionName: string): Promise<void> {
    await api.post(`/sessions/${sessionName}/close`);
  },
};
