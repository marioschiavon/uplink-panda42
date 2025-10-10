import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn({ ip: req.ip, url: req.url }, 'Missing authorization header');
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    logger.warn({ ip: req.ip, url: req.url }, 'Invalid authorization format');
    return res.status(401).json({ error: 'Invalid authorization format' });
  }

  const validToken = process.env.PANEL_TOKEN;

  if (!validToken) {
    logger.error('PANEL_TOKEN not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (token !== validToken) {
    logger.warn({ ip: req.ip, url: req.url }, 'Invalid token');
    return res.status(401).json({ error: 'Invalid token' });
  }

  logger.debug({ ip: req.ip, url: req.url }, 'Authenticated request');
  next();
}
