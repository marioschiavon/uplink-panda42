import { Server, Socket } from 'socket.io';
import { wppClient } from '../services/wppClient';
import { logger } from '../utils/logger';

export function initSocketManager(io: Server) {
  io.on('connection', (socket: Socket) => {
    logger.info({ socketId: socket.id }, 'Client connected');

    // Subscribe to WPPConnect events
    socket.on('subscribe:session', async (sessionName: string) => {
      logger.info({ sessionName, socketId: socket.id }, 'Subscribing to session');
      socket.join(`session:${sessionName}`);

      try {
        // Get current status
        const status = await wppClient.getSessionStatus(sessionName);
        socket.emit('session:status', status);
      } catch (error: any) {
        logger.error(error, 'Error getting session status');
        socket.emit('session:error', { error: error.message });
      }
    });

    socket.on('unsubscribe:session', (sessionName: string) => {
      logger.info({ sessionName, socketId: socket.id }, 'Unsubscribing from session');
      socket.leave(`session:${sessionName}`);
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Client disconnected');
    });
  });

  // Set up WPPConnect event listeners
  setupWppEventListeners(io);
}

function setupWppEventListeners(io: Server) {
  // This function should be called to broadcast WPPConnect events
  // You'll need to implement polling or webhooks from WPPConnect
  
  // Example: Poll for QR code updates
  setInterval(async () => {
    try {
      const sessions = await wppClient.getSessions();
      
      for (const session of sessions) {
        const status = await wppClient.getSessionStatus(session);
        
        // Broadcast to all clients subscribed to this session
        io.to(`session:${session}`).emit('session:status', {
          session,
          ...status,
        });

        // If there's a QR code, emit it
        if (status.qrCode) {
          io.to(`session:${session}`).emit('session:qrcode', {
            session,
            qrCode: status.qrCode,
          });
        }

        // If connected, notify
        if (status.connected) {
          io.to(`session:${session}`).emit('session:connected', {
            session,
          });
        }
      }
    } catch (error: any) {
      logger.error(error, 'Error polling WPPConnect status');
    }
  }, 5000); // Poll every 5 seconds

  logger.info('WPPConnect event listeners initialized');
}

export function broadcastMessage(io: Server, session: string, message: any) {
  io.to(`session:${session}`).emit('message:received', {
    session,
    message,
  });
}
