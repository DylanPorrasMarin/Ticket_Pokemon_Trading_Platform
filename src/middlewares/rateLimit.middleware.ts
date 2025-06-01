import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis';

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 mnute
  max: 10, // 10 requests por IP
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
});
