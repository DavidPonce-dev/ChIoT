import mongoose from 'mongoose';
import { logger } from './logger';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    logger.info('MongoDB conectado');
  } catch (err) {
    logger.error({ err }, 'Error conectando MongoDB');
    process.exit(1);
  }
};
