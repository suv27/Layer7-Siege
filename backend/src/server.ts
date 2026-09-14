import { buildApp } from './app';

async function start() {
  const fastify = await buildApp();

  // Start server
  const port = parseInt(process.env.PORT || '3001', 10);
  const host = process.env.HOST || '0.0.0.0';

  await fastify.listen({ port, host });
  fastify.log.info(`Server listening on ${host}:${port}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
