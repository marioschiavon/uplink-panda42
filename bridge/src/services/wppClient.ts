import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

interface SessionStatus {
  connected: boolean;
  qrCode?: string;
  message?: string;
}

interface SendMessageResult {
  success: boolean;
  message?: string;
  data?: any;
}

class WppClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.WPP_API_URL;
    
    if (!baseURL) {
      throw new Error('WPP_API_URL not configured');
    }

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug({ url: config.url, method: config.method }, 'WPPConnect request');
        return config;
      },
      (error) => {
        logger.error(error, 'WPPConnect request error');
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug({ status: response.status }, 'WPPConnect response');
        return response;
      },
      (error) => {
        logger.error(error, 'WPPConnect response error');
        return Promise.reject(error);
      }
    );
  }

  async startSession(sessionName: string): Promise<SessionStatus> {
    try {
      const response = await this.client.post(`/${sessionName}/start-session`);
      return {
        connected: false,
        qrCode: response.data.qrcode || response.data.qr,
        message: 'Session started, scan QR code',
      };
    } catch (error: any) {
      logger.error(error, 'Error starting session');
      throw new Error(`Failed to start session: ${error.message}`);
    }
  }

  async getSessions(): Promise<string[]> {
    try {
      const response = await this.client.get('/sessions');
      return response.data || [];
    } catch (error: any) {
      logger.error(error, 'Error getting sessions');
      return [];
    }
  }

  async getSessionStatus(sessionName: string): Promise<SessionStatus> {
    try {
      const response = await this.client.get(`/${sessionName}/status-session`);
      return {
        connected: response.data.status === 'CONNECTED',
        message: response.data.status,
      };
    } catch (error: any) {
      logger.error(error, 'Error getting session status');
      return {
        connected: false,
        message: 'Error getting status',
      };
    }
  }

  async closeSession(sessionName: string): Promise<void> {
    try {
      await this.client.post(`/${sessionName}/close-session`);
      logger.info({ sessionName }, 'Session closed');
    } catch (error: any) {
      logger.error(error, 'Error closing session');
      throw new Error(`Failed to close session: ${error.message}`);
    }
  }

  async sendMessage(
    sessionName: string,
    phone: string,
    message: string
  ): Promise<SendMessageResult> {
    try {
      const response = await this.client.post(`/${sessionName}/send-message`, {
        phone: phone.replace(/\D/g, ''), // Remove non-digits
        message,
        isGroup: false,
      });

      return {
        success: true,
        message: 'Message sent successfully',
        data: response.data,
      };
    } catch (error: any) {
      logger.error(error, 'Error sending message');
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async getMessages(sessionName: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/${sessionName}/all-chats`);
      return response.data || [];
    } catch (error: any) {
      logger.error(error, 'Error getting messages');
      return [];
    }
  }
}

export const wppClient = new WppClient();
