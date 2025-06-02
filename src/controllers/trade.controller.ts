import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { acceptTradeByUser, createTradeRequest, getPendingReceivedTrades, rejectTradeByUser } from '../services/trade.service';

export const requestTrade = async (req: Request, res: Response) => {
  try {
    const { receiver, senderPokemon, receiverPokemon } = req.body;
    const senderId = (req as any).user.id;

    const trade = await createTradeRequest(senderId, receiver, senderPokemon, receiverPokemon);

    return res.status(201).json({ message: 'Trade request sent', trade });
  } catch (error) {
    logger.error('Trade request failed', error);
    const errorMessage = (error instanceof Error) ? error.message : 'Failed to send trade request';
    return res.status(400).json({ message: errorMessage });
  }
};

export const getReceivedTrades = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { fromCache, trades } = await getPendingReceivedTrades(userId);

    if (fromCache) {
      logger.info(`[CACHE HIT] received trades for user ${userId}`);
    } else {
      logger.info(`[CACHE MISS] setting cache for user ${userId}`);
    }

    return res.status(200).json(trades);
  } catch (error) {
    logger.error('Failed to fetch received trades', error);
    return res.status(500).json({ message: 'Failed to fetch trades' });
  }
};

export const acceptTrade = async (req: Request, res: Response) => {
  try {
    const tradeId = req.params.id;
    const userId = (req as any).user.id;

    const trade = await acceptTradeByUser(tradeId, userId);
    res.json({ message: 'Trade accepted and sent for processing', trade });
  } catch (error) {
    logger.error('Failed to accept trade', error);
    const errorMessage = (error instanceof Error) ? error.message : 'Failed to accept trade';
    res.status(400).json({ message: errorMessage });
  }
};

export const rejectTrade = async (req: Request, res: Response) => {
  try {
    const tradeId = req.params.id;
    const userId = (req as any).user.id;

    const trade = await rejectTradeByUser(tradeId, userId);
    res.json({ message: 'Trade rejected', trade });
  } catch (error) {
    logger.error('Failed to reject trade', error);
    const errorMessage = (error instanceof Error) ? error.message : 'Failed to reject trade';
    res.status(400).json({ message: errorMessage });
  }
};
