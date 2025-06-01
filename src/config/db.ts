import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    logger.error('Missing MONGODB_URI in env variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
