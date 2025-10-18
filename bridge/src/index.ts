import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import wppRoutes from './routes/wpp';
import ticketRoutes from './routes/tickets';
import { initSocketManager } from './socket/manager';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.PANEL_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
  }, 'Incoming request');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', wppRoutes);
app.use('/api', ticketRoutes);

// Initialize Socket.IO
initSocketManager(io);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err, 'Unhandled error');
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Bridge server running on port ${PORT}`);
  logger.info(`📡 WPPConnect URL: ${process.env.WPP_API_URL}`);
});
