import amqp from 'amqplib';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { processTrade } from '../services/trade.service';
import { connectRedis } from '../config/redis';

dotenv.config();

const QUEUE_NAME = 'trade_requests';

const startWorker = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      logger.error('Missing MONGODB_URI in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    logger.info('MongoDB connected (from worker)');

    await connectRedis(); // Initialize Redis connection

    const connection = await amqp.connect(process.env.RABBITMQ_URL!);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });
    logger.info(`Worker listening on queue: ${QUEUE_NAME}`);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg) {
          const content = msg.content.toString();
          const { tradeId } = JSON.parse(content);

          logger.info(`Processing trade request: ${tradeId}`);

          try {
            await processTrade(tradeId);
            channel.ack(msg);
            logger.info(`Trade ${tradeId} processed successfully`);
          } catch (err) {
            logger.error(`Failed to process trade ${tradeId}: ${err}`);
            channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    logger.error('Worker failed to start:', error);
    process.exit(1);
  }
};

startWorker();
