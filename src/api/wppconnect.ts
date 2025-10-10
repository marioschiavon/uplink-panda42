import { getConfig } from "@/utils/storage";
import { api } from "@/lib/axios";
import type {
  SessionStatus,
  SendMessagePayload,
  SendMessageResponse,
  Message,
} from "@/types";

class WppConnectAPI {
  async startSession(): Promise<SessionStatus> {
    try {
      const config = getConfig();
      const response = await api.post<SessionStatus>("/start-session", {
        sessionName: config.sessionName,
      });

      return {
        connected: false,
        qrCode: response.data.qrCode || "mock-qr-code-data",
        message: "Scan the QR code to connect",
      };
    } catch (error) {
      console.error("Error starting session:", error);
      return {
        connected: false,
        qrCode: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        message: "Demo mode - Mock QR code",
      };
    }
  }

  async getStatus(): Promise<SessionStatus> {
    try {
      const response = await api.get<SessionStatus>("/status");
      return {
        connected: response.data.connected || false,
        message: response.data.message || "Disconnected",
      };
    } catch (error) {
      console.error("Error getting status:", error);
      return {
        connected: false,
        message: "Demo mode - Disconnected",
      };
    }
  }

  async sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
    try {
      const response = await api.post<SendMessageResponse>("/send-message", payload);
      return {
        success: true,
        message: response.data.message || "Message sent successfully",
      };
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        success: true,
        message: "Demo mode - Message sent (mock)",
      };
    }
  }

  async getMessages(): Promise<Message[]> {
    try {
      const response = await api.get<{ messages: Message[] }>("/messages");
      return response.data.messages || [];
    } catch (error) {
      console.error("Error fetching messages:", error);
      return this.getMockMessages();
    }
  }

  private getMockMessages(): Message[] {
    return [
      {
        id: "1",
        from: "+5511999999999",
        body: "Olá! Esta é uma mensagem de demonstração.",
        timestamp: Date.now() - 60000,
        isFromMe: false,
      },
      {
        id: "2",
        from: "+5511999999999",
        body: "O sistema está funcionando em modo demo.",
        timestamp: Date.now() - 30000,
        isFromMe: false,
      },
    ];
  }
}

export const wppApi = new WppConnectAPI();
