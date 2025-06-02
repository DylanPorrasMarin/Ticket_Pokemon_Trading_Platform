import { getRabbitMQChannel } from '../config/rabbitmq';
import { redisClient } from '../config/redis';
import { Trade } from '../models/trade.model';
import { User } from '../models/user.model';
import { notifyTradeResult } from './notification.service';

export const validateTrade = (levelA: number, levelB: number): boolean => {
  return Math.abs(levelA - levelB) <= 30;
};

export const createTradeRequest = async (
  senderId: string,
  receiver: string,
  senderPokemon: number,
  receiverPokemon: number
) => {
  if (!receiver || !senderPokemon || !receiverPokemon) {
    throw new Error('Missing required fields');
  }

  if (receiver === senderId) {
    throw new Error('Cannot trade with yourself');
  }

  if (senderPokemon === receiverPokemon) {
    throw new Error('You already have the pokemon to trade');
  }

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
    throw new Error('Sender not found');
  }

  const ownsPokemon = senderUser.pokemons.some(
    (pokemon: any) => pokemon.id === senderPokemon
  );

  if (!ownsPokemon) {
    throw new Error('You do not own this Pokémon');
  }

  if (existingTrade) {
    throw new Error('Trade already exists');
  }

  const trade = await Trade.create({
    sender: senderId,
    receiver,
    senderPokemon,
    receiverPokemon,
  });

  await Promise.all([
    User.findByIdAndUpdate(senderId, { $push: { trades: trade._id } }),
    User.findByIdAndUpdate(receiver, { $push: { trades: trade._id } }),
  ]);

  return trade;
};

export const processTrade = async (tradeId: string): Promise<'accepted' | 'rejected'> => {
  const { trade, sender, receiver } = await getTradeAndUsers(tradeId);

  let status: 'accepted' | 'rejected' = 'rejected';
  let message = '';

  const senderPoke = sender.pokemons.find((p: { id: number }) => p.id === trade.senderPokemon);
  const receiverPoke = receiver.pokemons.find((p: { id: number }) => p.id === trade.receiverPokemon);

    console.log(receiver.id?.toString(), receiver.email, status, message);

  if (trade.sender.toString() === trade.receiver.toString()) {
    message = 'Cannot trade with yourself';
  } else if (!senderPoke) {
    message = 'Sender does not own the specified Pokémon.';
  } else if (!receiverPoke) {
    message = 'Receiver does not own the specified Pokémon.';
  } else if (!validateTrade(senderPoke.level, receiverPoke.level)) {
    message = 'Trade rejected due to Pokémon level difference.';
  } else {
    await executeTrade(sender, receiver, senderPoke, receiverPoke);
    status = 'accepted';
    message = 'Your trade request has been accepted!';
  }

  trade.status = status;
  await trade.save();

  console.log(receiver.id?.toString(), receiver.email, status, message);

  await notifyTradeResult(receiver.id, receiver.email, status, message);

  return status;
};

export const acceptTradeByUser = async (tradeId: string, userId: string) => {
  const trade = await Trade.findById(tradeId);
  if (!trade) throw new Error('Trade not found');
  if (trade.status !== 'pending') throw new Error('Trade already processed');
  if (trade.receiver.toString() !== userId.toString()) throw new Error('Not authorized to accept this trade');

  const channel = getRabbitMQChannel();
  channel.sendToQueue('trade_requests', Buffer.from(JSON.stringify({ tradeId })));

  return trade;
};

export const rejectTradeByUser = async (tradeId: string, userId: string) => {
  const trade = await Trade.findById(tradeId);
  if (!trade) throw new Error('Trade not found');
  if (trade.status !== 'pending') throw new Error('Trade already processed');
  if (trade.receiver.toString() !== userId.toString()) throw new Error('Unauthorized');

  trade.status = 'rejected';
  await trade.save();

  const receiver = await User.findById(trade.receiver);
  if (receiver) {
    await notifyTradeResult(receiver.id, receiver.email, 'rejected', 'Your trade request has been rejected.');
  }

  return trade;
};

export const getPendingReceivedTrades = async (userId: string) => {
  const cacheKey = `received_trades:${userId}`;
  
  // 1. review Check if trades are cached
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return { fromCache: true, trades: JSON.parse(cached) };
  }

  // 2. fetch from database
  const trades = await Trade.find({ receiver: userId, status: 'pending' });

  // 3. save in cache
  await redisClient.setEx(cacheKey, 60, JSON.stringify(trades));

  return { fromCache: false, trades };
};

export const getTradeAndUsers = async (tradeId: string) => {
  const trade = await Trade.findById(tradeId);
  if (!trade) throw new Error('Trade not found');
  if (trade.status !== 'pending') throw new Error('Trade has already been processed');

  const [sender, receiver] = await Promise.all([
    User.findById(trade.sender),
    User.findById(trade.receiver),
  ]);

  if (!sender || !receiver) throw new Error('Sender or receiver not found');

  return { trade, sender, receiver };
};

export const executeTrade = async (sender: any, receiver: any, senderPoke: any, receiverPoke: any) => {
  sender.pokemons = sender.pokemons.filter((p: any) => p.id !== senderPoke.id);
  receiver.pokemons = receiver.pokemons.filter((p: any) => p.id !== receiverPoke.id);

  sender.pokemons.push(receiverPoke);
  receiver.pokemons.push(senderPoke);

  sender.successfulTrades += 1;
  receiver.successfulTrades += 1;

  await Promise.all([sender.save(), receiver.save()]);
};