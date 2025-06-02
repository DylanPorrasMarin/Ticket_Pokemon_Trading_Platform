import { Request, Response } from 'express';
import { getTopTraders } from '../services/ranking.service';
import { logger } from '../utils/logger';

export const listRanking = async (_req: Request, res: Response) => {
  try {
    const ranking = await getTopTraders();
    res.json({ ranking });
  } catch (error) {
    logger.error('Failed to load ranking', error);
    res.status(500).json({ message: 'Failed to load ranking' });
  }
};
