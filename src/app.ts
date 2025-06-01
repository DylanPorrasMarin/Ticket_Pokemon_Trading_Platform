import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
// import dotenv from 'dotenv';

// External Services
import { createClient } from 'redis';
import { connectRabbitMQ } from './config/rabbitmq';

// Middlewares and Utils
import { apiRateLimiter } from './middlewares/rateLimit.middleware';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import tradeRoutes from './routes/trade.routes';
import rankingRoutes from './routes/ranking.routes';

// Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';



const app = express();

// ─── Middleware Setup ───────────────────────────────────────
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// ─── Swagger Documentation ─────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pokémon Trading API',
      version: '1.0.0',
      description: 'API documentation for the Pokémon Trading platform',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes (With Rate Limiting) ───────────────────────────
app.use('/api/auth', apiRateLimiter, authRoutes);
app.use('/api/trades', apiRateLimiter, tradeRoutes);
app.use('/api/ranking', apiRateLimiter, rankingRoutes);

// ─── MongoDB Connection ─────────────────────────────────────
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  logger.error('Missing MONGODB_URI in environment variables.');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error:', err));

// ─── Redis Connection ───────────────────────────────────────
const redisURL = process.env.REDIS_URL;
if (!redisURL) {
  logger.error('Missing REDIS_URL in environment variables.');
  process.exit(1);
}

const redisClient = createClient({ url: redisURL });
redisClient.connect()
  .then(() => logger.info('Redis connected'))
  .catch(err => logger.error('Redis connection error:', err));

// ─── RabbitMQ Connection ────────────────────────────────────
connectRabbitMQ();

export default app;
