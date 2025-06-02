import { Notification } from '../models/notification.model';
import { redisClient } from '../config/redis';
import { sendEmail } from '../utils/email';

export const notifyTradeResult = async (
  userId: string,
  email: string,
  status: 'accepted' | 'rejected',
  message: string
) => {
  await Promise.all([
    Notification.create({
      userId,
      type: status === 'accepted' ? 'trade_accepted' : 'trade_rejected',
      message,
    }),
    sendEmail(email, `Trade ${status}`, message),
    redisClient.del(`received_trades:${userId}`),
  ]);
};
