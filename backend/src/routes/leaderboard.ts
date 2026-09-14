import { FastifyInstance } from 'fastify';

export async function leaderboardRoutes(fastify: FastifyInstance) {
  // Get leaderboard
  fastify.get('/leaderboard', async () => {
    return {
      leaderboard: [],
      message: 'Leaderboard - to be implemented',
    };
  });

  // Submit score
  fastify.post('/leaderboard', async (request) => {
    const body = request.body as { score: number; scenarioId: string };
    return {
      ...body,
      message: 'Score submission - to be implemented',
    };
  });
}
