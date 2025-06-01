import { Trade } from '../models/trade.model';
import { User } from '../models/user.model';
import { redisClient } from '../config/redis';

export const validateTrade = (levelA: number, levelB: number): boolean => {
  return Math.abs(levelA - levelB) <= 30;
};

export const processTrade = async (tradeId: string): Promise<'accepted' | 'rejected'> => {
  const trade = await Trade.findById(tradeId);
  if (!trade) throw new Error('Trade not found');

  if (trade.status !== 'pending') {
    throw new Error('Trade has already been processed');
  }

  if (trade.sender.toString() === trade.receiver.toString()) {
    trade.status = 'rejected';
    await trade.save();
    throw new Error('Cannot trade with yourself');
  }

  const sender = await User.findById(trade.sender);
  const receiver = await User.findById(trade.receiver);

  if (!sender || !receiver) throw new Error('Sender or receiver not found');

  const senderPoke = sender.pokemons.find(p => p.id === trade.senderPokemon);
  const receiverPoke = receiver.pokemons.find(p => p.id === trade.receiverPokemon);

  if (!senderPoke) {
    trade.status = 'rejected';
    await trade.save();
    throw new Error('Sender does not own the specified Pokémon');
  }

  if (!receiverPoke) {
    trade.status = 'rejected';
    await trade.save();
    throw new Error('Receiver does not own the specified Pokémon');
  }

  if (validateTrade(senderPoke.level, receiverPoke.level)) {
    // interchange Pokémon
    sender.pokemons = sender.pokemons.filter(p => p.id !== senderPoke.id);
    receiver.pokemons = receiver.pokemons.filter(p => p.id !== receiverPoke.id);

    sender.pokemons.push(receiverPoke);
    receiver.pokemons.push(senderPoke);

    sender.successfulTrades += 1;
    receiver.successfulTrades += 1;

    trade.status = 'accepted';

    await sender.save();
    await receiver.save();
  } else {
    trade.status = 'rejected';
  }

  await trade.save();

  // invalidate cache
  await redisClient.del(`received_trades:${trade.receiver.toString()}`);

  return trade.status;
};
