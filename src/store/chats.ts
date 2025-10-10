import { create } from 'zustand';
import { Message } from '@/types';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount?: number;
  avatar?: string;
}

interface ChatsState {
  contacts: Contact[];
  selectedContact: string | null;
  messages: Record<string, Message[]>;
  
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  selectContact: (contactId: string) => void;
  setMessages: (contactId: string, messages: Message[]) => void;
  addMessage: (contactId: string, message: Message) => void;
  updateContactLastMessage: (contactId: string, message: string, timestamp: number) => void;
  clearUnread: (contactId: string) => void;
}

export const useChatsStore = create<ChatsState>((set) => ({
  contacts: [],
  selectedContact: null,
  messages: {},

  setContacts: (contacts) => set({ contacts }),

  addContact: (contact) => set((state) => ({
    contacts: [contact, ...state.contacts],
  })),

  selectContact: (contactId) => set({ selectedContact: contactId }),

  setMessages: (contactId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [contactId]: messages,
    },
  })),

  addMessage: (contactId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [contactId]: [...(state.messages[contactId] || []), message],
    },
  })),

  updateContactLastMessage: (contactId, message, timestamp) => set((state) => ({
    contacts: state.contacts.map((c) =>
      c.id === contactId
        ? { ...c, lastMessage: message, lastMessageTime: timestamp }
        : c
    ),
  })),

  clearUnread: (contactId) => set((state) => ({
    contacts: state.contacts.map((c) =>
      c.id === contactId ? { ...c, unreadCount: 0 } : c
    ),
  })),
}));
