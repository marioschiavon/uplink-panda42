import { useEffect } from 'react';
import { useChatsStore } from '@/store/chats';

// Mock contacts for demo
const MOCK_CONTACTS = [
  {
    id: '5511999999999@c.us',
    name: 'João Silva',
    phone: '+55 11 99999-9999',
    lastMessage: 'Olá, tudo bem?',
    lastMessageTime: Date.now() - 1000 * 60 * 5, // 5 min ago
    unreadCount: 2,
  },
  {
    id: '5511888888888@c.us',
    name: 'Maria Santos',
    phone: '+55 11 88888-8888',
    lastMessage: 'Obrigado!',
    lastMessageTime: Date.now() - 1000 * 60 * 30, // 30 min ago
    unreadCount: 0,
  },
  {
    id: '5511777777777@c.us',
    name: 'Pedro Oliveira',
    phone: '+55 11 77777-7777',
    lastMessage: 'Até logo',
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    unreadCount: 0,
  },
];

export function useChatsInit() {
  const { contacts, setContacts } = useChatsStore();

  useEffect(() => {
    // Initialize with mock contacts if empty
    if (contacts.length === 0) {
      setContacts(MOCK_CONTACTS);
    }
  }, []);
}
