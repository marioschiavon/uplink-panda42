import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { wppClient } from '../services/wppClient';
import { logger } from '../utils/logger';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * POST /api/sessions/start
 * Start a new WPPConnect session
 */
router.post('/sessions/start', async (req, res) => {
  try {
    const { sessionName } = req.body;

    if (!sessionName) {
      return res.status(400).json({ error: 'sessionName is required' });
    }

    logger.info({ sessionName }, 'Starting session');
    const result = await wppClient.startSession(sessionName);

    res.json(result);
  } catch (error: any) {
    logger.error(error, 'Error starting session');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sessions
 * List all active sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await wppClient.getSessions();
    res.json({ sessions });
  } catch (error: any) {
    logger.error(error, 'Error listing sessions');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sessions/:session/status
 * Get session status
 */
router.get('/sessions/:session/status', async (req, res) => {
  try {
    const { session } = req.params;
    const status = await wppClient.getSessionStatus(session);
    res.json(status);
  } catch (error: any) {
    logger.error(error, 'Error getting session status');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sessions/:session/close
 * Close a session
 */
router.post('/sessions/:session/close', async (req, res) => {
  try {
    const { session } = req.params;
    await wppClient.closeSession(session);
    res.json({ message: 'Session closed successfully' });
  } catch (error: any) {
    logger.error(error, 'Error closing session');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/messages/send-text
 * Send a text message
 */
router.post('/messages/send-text', async (req, res) => {
  try {
    const { session, phone, message } = req.body;

    if (!session || !phone || !message) {
      return res.status(400).json({
        error: 'session, phone, and message are required',
      });
    }

    logger.info({ session, phone }, 'Sending message');
    const result = await wppClient.sendMessage(session, phone, message);

    res.json(result);
  } catch (error: any) {
    logger.error(error, 'Error sending message');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/messages/:session
 * Get messages from a session
 */
router.get('/messages/:session', async (req, res) => {
  try {
    const { session } = req.params;
    const messages = await wppClient.getMessages(session);
    res.json({ messages });
  } catch (error: any) {
    logger.error(error, 'Error getting messages');
    res.status(500).json({ error: error.message });
  }
});

export default router;
