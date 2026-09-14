import { FastifyInstance } from 'fastify';
import { SimulationManager } from '../managers/simulation-manager';

export async function scenarioRoutes(fastify: FastifyInstance) {
  // Get all scenarios
  fastify.get('/scenarios', async () => {
    const scenarios = SimulationManager.getScenarios();
    return { scenarios };
  });

  // Get specific scenario
  fastify.get('/scenarios/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const scenario = SimulationManager.getScenario(id);
    
    if (!scenario) {
      reply.code(404).send({ error: 'Scenario not found' });
      return;
    }
    
    return { scenario };
  });
}
