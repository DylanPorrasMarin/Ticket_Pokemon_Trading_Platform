// src/controllers/trade.controller.ts
import { Request, Response } from 'express';
import { Trade } from '../models/trade.model';
import { getRabbitMQChannel } from '../config/rabbitmq';
import { logger } from '../utils/logger';
import { redisClient } from '../config/redis';

import { User } from '../models/user.model'; // Make sure you have this model imported

export const requestTrade = async (req: Request, res: Response) => {
  try {
    const { receiver, senderPokemon, receiverPokemon } = req.body;
    const senderId = (req as any).user.id;

    // Validaciones básicas
    if (!receiver || !senderPokemon || !receiverPokemon) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (receiver === senderId) {
      return res.status(400).json({ message: 'Cannot trade with yourself' });
    }

    // consult if the sender exists and if the trade already exists
    const [senderUser, existingTrade] = await Promise.all([
      User.findById(senderId),
      Trade.findOne({
        sender: senderId,
        receiver,
        senderPokemon,
        receiverPokemon,
        status: 'pending',
      }),
    ]);

    if (!senderUser) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    if (existingTrade) {
      return res.status(400).json({ message: 'Trade already exists' });
    }

    const ownsPokemon = senderUser.pokemons.some(
      (pokemon: any) => pokemon.id === senderPokemon
    );

    if (!ownsPokemon) {
      return res.status(403).json({ message: 'You do not own this Pokémon' });
    }

    const trade = await Trade.create({ sender: senderId, receiver, senderPokemon, receiverPokemon });

    await Promise.all([
      User.findByIdAndUpdate(senderId, { $push: { trades: trade._id } }),
      User.findByIdAndUpdate(receiver, { $push: { trades: trade._id } }),
    ]);

    return res.status(201).json({ message: 'Trade request sent', trade });
  } catch (error) {
    logger.error('Trade request failed', error);
    return res.status(500).json({ message: 'Failed to send trade request' });
  }
};

export const getReceivedTrades = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const cacheKey = `received_trades:${userId}`;

    // 1. verified Check if trades are cached
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.info(`[CACHE HIT] received trades for user ${userId}`);
      return res.json(JSON.parse(cached));
    }

    // 2. if not cached, fetch from database
    const trades = await Trade.find({ receiver: userId, status: 'pending' });

      if (!trades || trades.length === 0) {
        logger.info(`No pending trade requests found for user ${userId}`);
        return res.status(200).json([]); 
      }

    // 3. store in cache for 60 seconds
    await redisClient.setEx(cacheKey, 60, JSON.stringify(trades));
    logger.info(`[CACHE MISS] setting cache for user ${userId}`);

    res.json(trades);
    
  } catch (error) {
    logger.error('Failed to fetch received trades', error);
    res.status(500).json({ message: 'Failed to fetch trades' });
  }
};

export const acceptTrade = async (req: Request, res: Response) => {
  try {
    const tradeId = req.params.id;
    const trade = await Trade.findById(tradeId);

    if (!trade) return res.status(404).json({ message: 'Trade not found' });
    if (trade.status !== 'pending') return res.status(400).json({ message: 'Trade already processed' });

    const userId = (req as any).user.id;
    if (trade.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this trade' });
    }

    const channel = getRabbitMQChannel();
    channel.sendToQueue('trade_requests', Buffer.from(JSON.stringify({ tradeId })));

    res.json({ message: 'Trade accepted and sent for processing' });
  } catch (error) {
    logger.error('Failed to accept trade', error);
    res.status(500).json({ message: 'Failed to accept trade' });
  }
};

export const rejectTrade = async (req: Request, res: Response) => {
  try {
    const tradeId = req.params.id;
    const trade = await Trade.findById(tradeId);

    if (!trade) return res.status(404).json({ message: 'Trade not found' });
    if (trade.status !== 'pending') return res.status(400).json({ message: 'Trade already processed' });

    const userId = (req as any).user.id;
    if (trade.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this trade' });
    }

    trade.status = 'rejected';
    await trade.save();

    res.json({ message: 'Trade rejected' });
  } catch (error) {
    logger.error('Failed to reject trade', error);
    res.status(500).json({ message: 'Failed to reject trade' });
  }
};
