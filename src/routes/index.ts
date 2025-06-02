import { Router } from 'express';
import authRoutes from './auth.routes';
import tradeRoutes from './trade.routes';
import rankingRoutes from './ranking.routes';
import pokemonRoutes from './pokemon.routes';

export const createRouter = (rateLimiter: any) => {
  const router = Router();

  router.use('/auth', rateLimiter, authRoutes);
  router.use('/trades', rateLimiter, tradeRoutes);
  router.use('/ranking', rateLimiter, rankingRoutes);
  router.use('/pokemon', rateLimiter, pokemonRoutes);
  return router;
};
