import { Request, Response } from 'express';
import { getTopTraders } from '../services/ranking.service';
import { Trade } from '../models/trade.model';
import { getRabbitMQChannel } from '../config/rabbitmq';
import { logger } from '../utils/logger';
import { UserTokenPayload } from '../types/global';

export const listRanking = async (_req: Request, res: Response) => {
  try {
    const ranking = await getTopTraders();
    res.json({ ranking });
  } catch (error) {
    logger.error('Failed to load ranking', error);
    res.status(500).json({ message: 'Failed to load ranking' });
  }
};

export const requestTrade = async (req: Request, res: Response) => {
  try {
    const { receiver, senderPokemon, receiverPokemon } = req.body;
    const sender = req.user as UserTokenPayload;

    if (!receiver || !senderPokemon || !receiverPokemon) {
      return res.status(400).json({ message: 'Missing trade details' });
    }

    if (sender.id === receiver) {
      return res.status(400).json({ message: 'Cannot trade with yourself' });
    }

    const trade = await Trade.create({
      sender: sender.id,
      receiver,
      senderPokemon,
      receiverPokemon
    });

    const channel = getRabbitMQChannel();
    channel.sendToQueue('trade_requests', Buffer.from(JSON.stringify(trade)));

    res.status(201).json({ message: 'Trade request sent', trade });
  } catch (error) {
    logger.error('Trade request failed', error);
    res.status(500).json({ message: 'Failed to send trade request' });
  }
};
