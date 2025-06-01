import createApp from './app';
import { connectDB } from './config/db';
import { connectRedis, redisClient } from './config/redis';
import { connectRabbitMQ } from './config/rabbitmq';

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  await connectRedis();
  await connectRabbitMQ();

  const app = createApp(redisClient); // Aquí ya conectado
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
