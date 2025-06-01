import { Router } from 'express';
import authRoutes from './auth.routes';
import tradeRoutes from './trade.routes';
import rankingRoutes from './ranking.routes';

export const createRouter = (rateLimiter: any) => {
  const router = Router();

  router.use('/auth', rateLimiter, authRoutes);
  router.use('/trades', rateLimiter, tradeRoutes);
  router.use('/ranking', rateLimiter, rankingRoutes);

  return router;
};
