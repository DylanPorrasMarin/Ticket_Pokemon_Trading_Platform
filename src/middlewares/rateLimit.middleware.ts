import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { RedisClientType } from 'redis';

export const createApiRateLimiter = (redisClient: RedisClientType) => {
  return rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),
  });
};
