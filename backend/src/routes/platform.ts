import { FastifyInstance } from 'fastify';
import { PlatformManager } from '../managers/platform-manager';
import { SimulationManager } from '../managers/simulation-manager';

export async function platformRoutes(fastify: FastifyInstance) {
  fastify.get('/profile', async (request) => {
    const { id } = request.query as { id?: string };
    return { profile: PlatformManager.getProfile(id) };
  });

  fastify.post('/profile', async (request) => {
    return { profile: PlatformManager.saveProfile(request.body as Parameters<typeof PlatformManager.saveProfile>[0]) };
  });

  fastify.post('/scenario-tests', async (request, reply) => {
    const { scenarioId, rules } = request.body as { scenarioId: string; rules: any[] };
    const scenario = SimulationManager.getScenario(scenarioId);
    if (!scenario) return reply.code(404).send({ error: 'Scenario not found' });
    return { result: PlatformManager.testScenario(scenario, rules) };
  });

  fastify.get('/reports/:simulationId', async (request, reply) => {
    const { simulationId } = request.params as { simulationId: string };
    const simulation = SimulationManager.getSimulation(simulationId);
    if (!simulation) return reply.code(404).send({ error: 'Simulation not found' });
    return { report: PlatformManager.createReport(simulation.getState()) };
  });

  fastify.post('/custom-scenarios', async (request) => {
    return { scenario: PlatformManager.createScenario(request.body as any) };
  });

  fastify.get('/custom-scenarios', async () => ({ scenarios: PlatformManager.listCustomScenarios() }));

  fastify.post('/ai/evaluate', async (request) => {
    const { prompt, sensitivity = 0.5 } = request.body as { prompt: string; sensitivity?: number };
    return { evaluation: PlatformManager.evaluatePrompt(prompt, sensitivity) };
  });

  fastify.post('/teams', async (request) => {
    const { name, member } = request.body as { name: string; member?: string };
    return { team: PlatformManager.createTeam(name, member) };
  });

  fastify.get('/teams', async () => ({ teams: PlatformManager.listTeams() }));

  fastify.get('/hints/:scenarioId', async (request) => {
    const { scenarioId } = request.params as { scenarioId: string };
    const { failures = '0' } = request.query as { failures?: string };
    return { hint: PlatformManager.getHint(scenarioId, Number(failures)) };
  });

  fastify.get('/logs', async () => ({ logs: PlatformManager.getLogs() }));
}