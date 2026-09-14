import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { scenarioRoutes } from './routes/scenarios';
import { simulationRoutes } from './routes/simulation';
import { leaderboardRoutes } from './routes/leaderboard';

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({ logger: false });

  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  await fastify.register(scenarioRoutes, { prefix: '/api' });
  await fastify.register(simulationRoutes, { prefix: '/api' });
  await fastify.register(leaderboardRoutes, { prefix: '/api' });

  fastify.get('/health', async () => ({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now(),
  }));

  return fastify;
}