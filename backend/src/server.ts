import Fastify from 'fastify';
import cors from '@fastify/cors';
import pino from 'pino';
import { scenarioRoutes } from './routes/scenarios';
import { simulationRoutes } from './routes/simulation';
import { leaderboardRoutes } from './routes/leaderboard';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

const fastify = Fastify({
  logger,
});

async function start() {
  // Register CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Register routes
  await fastify.register(scenarioRoutes, { prefix: '/api' });
  await fastify.register(simulationRoutes, { prefix: '/api' });
  await fastify.register(leaderboardRoutes, { prefix: '/api' });

  // Health check endpoint
  fastify.get('/health', async () => {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: Date.now(),
    };
  });

  // Start server
  const port = parseInt(process.env.PORT || '3001', 10);
  const host = process.env.HOST || '0.0.0.0';

  await fastify.listen({ port, host });
  logger.info(`Server listening on ${host}:${port}`);
}

start().catch((err) => {
  logger.error(err);
  process.exit(1);
});
