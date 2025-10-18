import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { logger } from '../utils/logger';
import {
  routeTicket,
  assignTicket,
  closeTicket,
  getWaitingTickets,
} from '../services/ticketRouter';
import { getSocketIO } from '../socket/manager';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/tickets/waiting
 * Get waiting tickets queue
 */
router.get('/tickets/waiting', async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({ error: 'companyId is required' });
    }

    logger.info({ companyId }, 'Getting waiting tickets');
    const tickets = await getWaitingTickets(companyId);

    res.json({ tickets });
  } catch (error: any) {
    logger.error(error, 'Error getting waiting tickets');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tickets/assign/:ticketId
 * Assign ticket to an agent
 */
router.post('/tickets/assign/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }

    logger.info({ ticketId, agentId }, 'Assigning ticket');
    const ticket = await assignTicket(ticketId, agentId);

    // Emit socket event
    const io = getSocketIO();
    if (io) {
      io.to(`company:${ticket.company_id}`).emit('ticket:assigned', {
        ticket,
        agentId,
      });
    }

    res.json({ ticket });
  } catch (error: any) {
    logger.error(error, 'Error assigning ticket');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tickets/auto-route
 * Auto-route new ticket based on company routing mode
 */
router.post('/tickets/auto-route', async (req, res) => {
  try {
    const { companyId, customerNumber, lastMessage } = req.body;

    if (!companyId || !customerNumber || !lastMessage) {
      return res.status(400).json({
        error: 'companyId, customerNumber, and lastMessage are required',
      });
    }

    logger.info({ companyId, customerNumber }, 'Auto-routing ticket');
    const { ticket, routed } = await routeTicket(
      companyId,
      customerNumber,
      lastMessage
    );

    // Emit socket events
    const io = getSocketIO();
    if (io) {
      // Always emit new ticket event
      io.to(`company:${companyId}`).emit('ticket:new', { ticket });

      if (routed) {
        // Ticket was assigned to an agent
        io.to(`company:${companyId}`).emit('ticket:assigned', {
          ticket,
          agentId: ticket.assigned_to,
        });
      } else {
        // Ticket went to waiting queue
        io.to(`company:${companyId}`).emit('ticket:waiting', { ticket });
      }
    }

    res.json({ ticket, routed });
  } catch (error: any) {
    logger.error(error, 'Error auto-routing ticket');
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tickets/close/:ticketId
 * Close a ticket
 */
router.post('/tickets/close/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    logger.info({ ticketId }, 'Closing ticket');
    const ticket = await closeTicket(ticketId);

    // Emit socket event
    const io = getSocketIO();
    if (io) {
      io.to(`company:${ticket.company_id}`).emit('ticket:closed', {
        ticket,
      });
    }

    res.json({ ticket });
  } catch (error: any) {
    logger.error(error, 'Error closing ticket');
    res.status(500).json({ error: error.message });
  }
});

export default router;
