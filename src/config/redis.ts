import { createClient } from 'redis';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
  },
});

export const connectRedis = async () => {
  console.log('Redis URL:', process.env.REDIS_URL); // <- línea para debug

  if (!process.env.REDIS_URL) {
    logger.error('Missing REDIS_URL in env variables.');
    process.exit(1);
  }

  try {
    await redisClient.connect();
    logger.info('Redis connected');
  } catch (err: any) {
    logger.error('Redis connection error:', err?.message || err);
    console.error(err);
    process.exit(1);
  }
};
