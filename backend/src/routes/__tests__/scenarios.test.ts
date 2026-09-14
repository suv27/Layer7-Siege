import { buildApp } from '../../app';

describe('Scenario API', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  test('returns the registered scenarios', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/scenarios' });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.scenarios).toHaveLength(2);
    expect(body.scenarios.map((scenario: { id: string }) => scenario.id)).toEqual([
      'owasp-sqli-xss-001',
      'bot-scraping-001',
    ]);
  });

  test('returns a scenario by id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/scenarios/owasp-sqli-xss-001',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().scenario.name).toBe('SQL Injection & XSS Attacks');
  });

  test('returns 404 for an unknown scenario', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/scenarios/does-not-exist',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'Scenario not found' });
  });
});