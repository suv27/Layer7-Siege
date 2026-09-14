import { FastifyInstance } from 'fastify';
import { SimulationManager } from '../managers/simulation-manager';

export async function simulationRoutes(fastify: FastifyInstance) {
  // Start simulation
  fastify.post('/simulation/start', async (request, reply) => {
    const { scenarioId, rules } = request.body as {
      scenarioId: string;
      rules?: any[];
    };

    const engine = SimulationManager.createSimulation(scenarioId, rules);
    
    if (!engine) {
      reply.code(404).send({ error: 'Scenario not found' });
      return;
    }

    engine.start(100); // 100ms interval

    return {
      simulationId: 'active',
      status: 'running',
      scenarioId,
    };
  });

  // Stop simulation
  fastify.post('/simulation/stop', async () => {
    const activeSimulations = SimulationManager.getActiveSimulations();
    
    activeSimulations.forEach(id => {
      SimulationManager.deleteSimulation(id);
    });

    return {
      status: 'stopped',
      simulationsStopped: activeSimulations.length,
    };
  });

  // SSE stream for real-time updates
  fastify.get('/simulation/stream', async (request, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');

    // Listen to traffic events from simulation manager
    const onTraffic = (data: any) => {
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    SimulationManager.on('traffic', onTraffic);

    // Clean up on connection close
    request.raw.on('close', () => {
      SimulationManager.off('traffic', onTraffic);
    });

    // Send initial connection message
    reply.raw.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    return reply;
  });
}
