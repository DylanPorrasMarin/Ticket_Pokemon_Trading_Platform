import express from 'express';
import dotenv from 'dotenv';
import { loadMiddlewares } from './middlewares';
import { createRouter } from './routes';
import { swaggerSpec } from './docs/swagger';
import swaggerUi from 'swagger-ui-express';
import { createApiRateLimiter } from './middlewares/rateLimit.middleware';

dotenv.config();

const createApp = (redisClient: any) => {
  const app = express();

  // Carga middlewares base
  loadMiddlewares(app);

  // Documentación Swagger
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Redirección automática desde /
  if (process.env.NODE_ENV !== 'production') {
    app.get('/', (req, res) => {
      res.redirect('/docs');
    });
  }

  // API Routes protegidas con rate limiter
  const apiRateLimiter = createApiRateLimiter(redisClient);
  const router = createRouter(apiRateLimiter);
  app.use('/api', router);

  return app;
};

export default createApp;
