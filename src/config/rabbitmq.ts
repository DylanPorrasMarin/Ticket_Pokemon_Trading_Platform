// src/config/rabbitmq.ts
import amqplib from 'amqplib';
import { logger } from '../utils/logger';

let channel: amqplib.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL!);
    channel = await connection.createChannel();
    await channel.assertQueue('trade_requests');
    logger.info('RabbitMQ connected and queue asserted');
  } catch (err) {
    logger.error('RabbitMQ connection error', err);
  }
};

export const getRabbitMQChannel = () => channel;
