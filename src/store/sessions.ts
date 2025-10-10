import { create } from 'zustand';

interface Message {
  id: string;
  from: string;
  body: string;
  timestamp: number;
  isFromMe: boolean;
}

interface Session {
  status: 'disconnected' | 'connecting' | 'connected' | 'qr-ready';
  qr?: string;
  messages: Message[];
  lastUpdate: number;
}

interface SessionsState {
  sessions: Record<string, Session>;
  activeSession: string | null;
  
  setActiveSession: (sessionId: string) => void;
  updateSessionStatus: (sessionId: string, status: Session['status']) => void;
  updateSessionQr: (sessionId: string, qr: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  clearSession: (sessionId: string) => void;
  initSession: (sessionId: string) => void;
}

export const useSessionsStore = create<SessionsState>((set) => ({
  sessions: {},
  activeSession: null,

  setActiveSession: (sessionId) => set({ activeSession: sessionId }),

  initSession: (sessionId) => set((state) => ({
    sessions: {
      ...state.sessions,
      [sessionId]: {
        status: 'disconnected',
        messages: [],
        lastUpdate: Date.now(),
      },
    },
  })),

  updateSessionStatus: (sessionId, status) => set((state) => ({
    sessions: {
      ...state.sessions,
      [sessionId]: {
        ...(state.sessions[sessionId] || { messages: [] }),
        status,
        lastUpdate: Date.now(),
      },
    },
  })),

  updateSessionQr: (sessionId, qr) => set((state) => ({
    sessions: {
      ...state.sessions,
      [sessionId]: {
        ...(state.sessions[sessionId] || { messages: [], status: 'qr-ready' }),
        qr,
        status: 'qr-ready',
        lastUpdate: Date.now(),
      },
    },
  })),

  addMessage: (sessionId, message) => set((state) => {
    const session = state.sessions[sessionId] || { messages: [], status: 'disconnected', lastUpdate: Date.now() };
    return {
      sessions: {
        ...state.sessions,
        [sessionId]: {
          ...session,
          messages: [...session.messages, message],
          lastUpdate: Date.now(),
        },
      },
    };
  }),

  clearSession: (sessionId) => set((state) => {
    const { [sessionId]: _, ...rest } = state.sessions;
    return {
      sessions: rest,
      activeSession: state.activeSession === sessionId ? null : state.activeSession,
    };
  }),
}));
