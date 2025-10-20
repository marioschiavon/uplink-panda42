import { useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useSessionsStore } from '@/store/sessions';
import { useToast } from '@/hooks/use-toast';

interface UseWppSocketOptions {
  sessionId?: string;
  autoConnect?: boolean;
}

export function useWppSocket(options: UseWppSocketOptions = {}) {
  const { sessionId = 'default', autoConnect = true } = options;
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const { toast } = useToast();
  
  const {
    initSession,
    updateSessionStatus,
    updateSessionQr,
    addMessage,
    setActiveSession,
  } = useSessionsStore();

  useEffect(() => {
    if (!autoConnect) return;

    // Initialize session in store
    initSession(sessionId);
    setActiveSession(sessionId);

    // Get socket instance
    const socket = getSocket();
    socketRef.current = socket;

    // Connect socket
    if (!socket.connected) {
      socket.connect();
    }

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      updateSessionStatus(sessionId, 'connecting');
      
      // Subscribe to session updates
      socket.emit('subscribe:session', sessionId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      updateSessionStatus(sessionId, 'disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível conectar ao servidor.',
        variant: 'destructive',
      });
      updateSessionStatus(sessionId, 'disconnected');
    });

    // Session event handlers
    socket.on('session:status', (data) => {
      console.log('📊 Session status:', data);
      
      // data pode ser: { status: 'connected'/'disconnected', qr?: string }
      if (data.status === 'connected') {
        updateSessionStatus(sessionId, 'connected');
        toast({
          title: 'WhatsApp Conectado',
          description: 'Sessão conectada com sucesso!',
        });
      } else if (data.qr) {
        updateSessionQr(sessionId, data.qr);
        updateSessionStatus(sessionId, 'qr-ready');
      } else {
        updateSessionStatus(sessionId, 'disconnected');
      }
    });

    socket.on('session:qrcode', (data) => {
      console.log('📱 QR Code received:', data);
      // data = { qr: string }
      updateSessionQr(sessionId, data.qr);
      updateSessionStatus(sessionId, 'qr-ready');
      
      toast({
        title: 'QR Code Gerado',
        description: 'Escaneie o QR code para conectar.',
      });
    });

    socket.on('message:received', (data) => {
      console.log('💬 Message received:', data);
      
      if (data.session === sessionId && data.message) {
        addMessage(sessionId, {
          id: data.message.id || `msg-${Date.now()}`,
          from: data.message.from || 'unknown',
          body: data.message.body || '',
          timestamp: data.message.timestamp || Date.now(),
          isFromMe: data.message.isFromMe || false,
        });
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket listeners');
      
      if (socketRef.current) {
        socketRef.current.emit('unsubscribe:session', sessionId);
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('session:status');
        socketRef.current.off('session:qrcode');
        socketRef.current.off('session:connected');
        socketRef.current.off('session:error');
        socketRef.current.off('message:received');
      }
      
      disconnectSocket();
    };
  }, [sessionId, autoConnect, initSession, setActiveSession, updateSessionStatus, updateSessionQr, addMessage, toast]);

  return {
    socket: socketRef.current,
    sessionId,
  };
}
