export interface User {
  id?: string;
  username: string;
  isAuthenticated: boolean;
}

export interface WppConfig {
  baseURL: string;
  sessionName: string;
}

export interface Message {
  id: string;
  from: string;
  body: string;
  timestamp: number;
  isFromMe: boolean;
}

export interface SessionStatus {
  connected: boolean;
  qrCode?: string;
  message?: string;
}

export interface SendMessagePayload {
  phone: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: string;
  error?: string;
}
