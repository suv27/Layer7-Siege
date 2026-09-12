# Layer7 Siege Architecture

## System Overview

Layer7 Siege is a gamified web application that simulates Layer 7 security scenarios. The system consists of two main components:

1. **Frontend Dashboard:** Next.js application for user interaction, visualization, and game mechanics
2. **Backend Simulation Engine:** Node.js/Fastify server that generates simulated traffic, evaluates WAF rules, and manages game state

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                    (Next.js Frontend)                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/SSE
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Server                        │
│                      (Fastify/Node.js)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │   Engines    │  │  Scenarios   │      │
│  │              │  │              │  │              │      │
│  │ /scenarios   │  │ WAF Inspector│  │ OWASP        │      │
│  │ /simulation  │  │ Bot Challenge│  │ Bot Defense  │      │
│  │ /leaderboard │  │ Traffic Gen  │  │ DDoS         │      │
│  │              │  │ Rate Limiter │  │ AI Traffic   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript 5.0+
- **Styling:** TailwindCSS 3.4+
- **UI Components:** shadcn/ui (Radix UI primitives)
- **State Management:** React Context + Zustand
- **Real-time Updates:** Server-Sent Events (SSE)
- **Build Tool:** Turbopack (Next.js bundler)

### Component Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── scenarios/
│   │   ├── page.tsx            # Scenario selection
│   │   └── [id]/
│   │       └── page.tsx        # Individual scenario gameplay
│   ├── leaderboard/
│   │   └── page.tsx            # Leaderboard page
│   └── sandbox/
│       └── page.tsx            # Free-form sandbox mode
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── TrafficVisualizer.tsx   # Live traffic visualization
│   ├── WAFConfigPanel.tsx      # WAF rule configuration UI
│   ├── AttackSelector.tsx      # Attack type selection
│   ├── ScoreBoard.tsx          # Game score and progress
│   └── ScenarioCard.tsx       # Scenario selection cards
├── lib/
│   ├── api.ts                  # API client with SSE support
│   ├── types.ts                # Shared TypeScript types
│   └── utils.ts                # Utility functions
├── hooks/
│   ├── useSimulation.ts        # Simulation state hook
│   ├── useScenarios.ts         # Scenario data hook
│   └── useLeaderboard.ts       # Leaderboard data hook
└── contexts/
    ├── GameContext.tsx         # Global game state
    └── ThemeContext.tsx        # Theme configuration
```

### Key Frontend Patterns

#### 1. Server-Sent Events (SSE) for Real-time Updates

```typescript
// lib/api.ts
export class SimulationClient {
  private eventSource: EventSource | null = null;

  connectSimulation(scenarioId: string, config: WAFConfig) {
    this.eventSource = new EventSource(
      `${API_URL}/simulation/stream?scenario=${scenarioId}`
    );

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Handle real-time traffic updates
    };
  }
}
```

#### 2. State Management with Zustand

```typescript
// hooks/useSimulation.ts
interface SimulationState {
  traffic: TrafficEvent[];
  score: number;
  isRunning: boolean;
  updateTraffic: (event: TrafficEvent) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
}

export const useSimulation = create<SimulationState>((set) => ({
  traffic: [],
  score: 0,
  isRunning: false,
  updateTraffic: (event) => set((state) => ({
    traffic: [...state.traffic, event]
  })),
  startSimulation: () => set({ isRunning: true }),
  stopSimulation: () => set({ isRunning: false }),
}));
```

## Backend Architecture

### Technology Stack

- **Runtime:** Node.js 20+
- **Framework:** Fastify 4.x (high-performance, low overhead)
- **Language:** TypeScript 5.0+
- **Validation:** Zod (schema validation)
- **Testing:** Jest + Supertest
- **Logging:** Pino (structured logging)

### Core Engines

#### 1. WAF Inspector Engine

```typescript
// src/engines/waf-inspector.ts
export class WAFInspector {
  private rules: WAFRule[];

  constructor(rules: WAFRule[]) {
    this.rules = rules;
  }

  inspect(request: HTTPRequest): InspectionResult {
    for (const rule of this.rules) {
      if (this.matchesRule(request, rule)) {
        return {
          action: rule.action,
          ruleId: rule.id,
          reason: rule.description,
        };
      }
    }
    return { action: 'allow', ruleId: null, reason: 'No rule matched' };
  }

  private matchesRule(request: HTTPRequest, rule: WAFRule): boolean {
    // Pattern matching logic for headers, body, query params
    switch (rule.type) {
      case 'sql_injection':
        return this.detectSQLi(request);
      case 'xss':
        return this.detectXSS(request);
      case 'rate_limit':
        return this.checkRateLimit(request);
      // ... more rule types
    }
  }
}
```

#### 2. Traffic Generator Engine

```typescript
// src/engines/traffic-generator.ts
export class TrafficGenerator {
  private scenario: Scenario;
  private interval: NodeJS.Timeout | null = null;

  constructor(scenario: Scenario) {
    this.scenario = scenario;
  }

  start(callback: (event: TrafficEvent) => void): void {
    const { attackPatterns, benignPatterns } = this.scenario;

    this.interval = setInterval(() => {
      const isAttack = Math.random() < this.scenario.attackRatio;
      const pattern = isAttack 
        ? this.selectPattern(attackPatterns)
        : this.selectPattern(benignPatterns);

      const request = this.generateRequest(pattern, isAttack);
      callback({
        timestamp: Date.now(),
        request,
        isAttack,
        pattern: pattern.name,
      });
    }, this.scenario.requestInterval);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
```

#### 3. Bot Challenge Engine

```typescript
// src/engines/bot-challenge.ts
export class BotChallengeEngine {
  private challengeConfig: ChallengeConfig;

  evaluateRequest(request: HTTPRequest): ChallengeResult {
    const signals = this.collectSignals(request);
    const botScore = this.calculateBotScore(signals);

    if (botScore > this.challengeConfig.threshold) {
      return {
        shouldChallenge: true,
        challengeType: this.selectChallenge(botScore),
        confidence: botScore,
      };
    }

    return { shouldChallenge: false, challengeType: null, confidence: botScore };
  }

  private collectSignals(request: HTTPRequest): BotSignals {
    return {
      userAgent: this.analyzeUserAgent(request.headers['user-agent']),
      headers: this.checkHeaderConsistency(request.headers),
      timing: this.analyzeRequestTiming(request),
      fingerprint: this.generateFingerprint(request),
    };
  }
}
```

#### 4. Rate Limiter Engine

```typescript
// src/engines/rate-limiter.ts
export class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();

  checkLimit(identifier: string, config: RateLimitConfig): LimitResult {
    const bucket = this.getOrCreateBucket(identifier, config);

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      return { allowed: true, remaining: bucket.tokens };
    }

    return { allowed: false, remaining: 0, resetAfter: bucket.resetTime };
  }

  private getOrCreateBucket(
    identifier: string,
    config: RateLimitConfig
  ): TokenBucket {
    if (!this.buckets.has(identifier)) {
      this.buckets.set(identifier, {
        tokens: config.limit,
        lastRefill: Date.now(),
        resetTime: Date.now() + config.windowMs,
      });
    }
    return this.buckets.get(identifier)!;
  }
}
```

### API Routes

#### Scenario Management

```typescript
// src/routes/scenarios.ts
export async function scenarioRoutes(fastify: FastifyInstance) {
  // Get all scenarios
  fastify.get('/scenarios', async (request, reply) => {
    const scenarios = await ScenarioRepository.getAll();
    return scenarios;
  });

  // Get specific scenario
  fastify.get('/scenarios/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const scenario = await ScenarioRepository.getById(id);
    return scenario;
  });

  // Validate scenario configuration
  fastify.post('/scenarios/:id/validate', async (request, reply) => {
    const { id } = request.params as { id: string };
    const config = request.body as WAFConfig;
    const validation = await ScenarioValidator.validate(id, config);
    return validation;
  });
}
```

#### Simulation Control

```typescript
// src/routes/simulation.ts
export async function simulationRoutes(fastify: FastifyInstance) {
  // Start simulation
  fastify.post('/simulation/start', async (request, reply) => {
    const { scenarioId, config } = request.body as {
      scenarioId: string;
      config: WAFConfig;
    };

    const simulation = SimulationManager.start(scenarioId, config);
    return { simulationId: simulation.id, status: 'running' };
  });

  // Stop simulation
  fastify.post('/simulation/:id/stop', async (request, reply) => {
    const { id } = request.params as { id: string };
    SimulationManager.stop(id);
    return { status: 'stopped' };
  });

  // SSE stream for real-time updates
  fastify.get('/simulation/stream', async (request, reply) => {
    const { scenario } = request.query as { scenario: string };

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');

    const simulation = SimulationManager.get(scenario);
    simulation.on('traffic', (event) => {
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    request.raw.on('close', () => {
      simulation.off('traffic');
    });
  });
}
```

### Scenario Definitions

Scenarios are defined as TypeScript objects with structured configuration:

```typescript
// src/scenarios/owasp.ts
export const sqliScenario: Scenario = {
  id: 'owasp-sqli-001',
  name: 'SQL Injection Attack',
  category: 'OWASP',
  difficulty: 'beginner',
  description: 'Detect and block SQL injection attempts in login forms',
  learningObjectives: [
    'Identify SQL injection patterns',
    'Configure WAF rules for SQLi',
    'Understand parameterized queries',
  ],
  attackPatterns: [
    {
      name: 'Classic SQLi',
      requests: [
        {
          method: 'POST',
          path: '/login',
          headers: { 'Content-Type': 'application/json' },
          body: { username: "admin' OR '1'='1", password: 'anything' },
        },
      ],
    },
  ],
  benignPatterns: [
    {
      name: 'Normal Login',
      requests: [
        {
          method: 'POST',
          path: '/login',
          headers: { 'Content-Type': 'application/json' },
          body: { username: 'john@example.com', password: 'securePass123' },
        },
      ],
    },
  ],
  defaultWAFConfig: {
    rules: [
      {
        id: 'sqli-001',
        type: 'sql_injection',
        action: 'block',
        patterns: [/' OR '1'='1/, /UNION SELECT/, /--/],
      },
    ],
  },
  successCriteria: {
    blockRate: 0.95,
    falsePositiveRate: 0.05,
  },
};
```

## Data Flow

### 1. Scenario Selection Flow

```
User → Frontend → API: GET /scenarios
                ← API: Scenario List
User → Frontend: Display scenarios
User → Select Scenario
User → Frontend → API: GET /scenarios/:id
                ← API: Scenario Details
User → Frontend: Display scenario config
```

### 2. Simulation Execution Flow

```
User → Configure WAF Rules
User → Start Simulation
Frontend → API: POST /simulation/start {scenarioId, config}
         → SimulationManager.start()
         → TrafficGenerator.start()
         → WAFInspector.inspect() [for each request]
         → SSE: Stream traffic events
Frontend ← SSE: Traffic events
Frontend: Update visualizer in real-time
User → Stop Simulation
Frontend → API: POST /simulation/:id/stop
         → SimulationManager.stop()
```

### 3. Scoring Flow

```
TrafficGenerator → Generate Request
                → WAFInspector → Result (allow/block)
                → ScoreCalculator → Update score
                → SSE: Send score update
Frontend ← SSE: Score update
Frontend: Display score and progress
```

## Security Architecture

### Simulation Safety

1. **In-Memory Only:** All traffic generation happens in memory - no network requests
2. **No Real Attacks:** Attack patterns are simulated, not executed
3. **Sandboxed Environment:** Backend runs in isolated process
4. **Rate Limiting:** Built-in rate limiting prevents resource exhaustion
5. **Input Validation:** All user inputs validated with Zod schemas

### Data Privacy

1. **No User Data Storage:** No persistent storage of user configurations
2. **Session-Only State:** All game state is ephemeral
3. **No External APIs:** No calls to external services
4. **Local Execution:** Can run entirely offline

### Deployment Security

1. **Container Isolation:** Docker containers for isolation
2. **Minimal Permissions:** Containers run with non-root user
3. **Secure Headers:** Security headers configured in Fastify
4. **CORS Protection:** Strict CORS policies
5. **Dependency Scanning:** Automated dependency vulnerability scanning

## Performance Considerations

### Frontend Optimization

1. **Code Splitting:** Next.js automatic code splitting by route
2. **Image Optimization:** Next.js Image component for optimized images
3. **Lazy Loading:** Components loaded on demand
4. **Memoization:** React.memo for expensive components
5. **Virtual Scrolling:** For large traffic logs

### Backend Optimization

1. **Fastify:** 2x faster than Express for request handling
2. **Connection Pooling:** Reuse database connections (if needed)
3. **Caching:** In-memory caching for scenario definitions
4. **Stream Processing:** SSE for efficient real-time updates
5. **Worker Threads:** CPU-intensive operations in worker threads

## Scalability

### Horizontal Scaling

- **Frontend:** Stateless, can be deployed to multiple CDNs
- **Backend:** Stateless API, can scale horizontally
- **Session State:** Stored in memory or Redis for distributed deployments

### Vertical Scaling

- **Traffic Generation:** Configurable request rates
- **Memory Management:** Efficient data structures for traffic logs
- **CPU Optimization:** Worker threads for parallel processing

## Monitoring and Observability

### Logging

- **Structured Logging:** Pino with JSON output
- **Log Levels:** Error, warn, info, debug
- **Request Logging:** All API requests logged with metadata

### Metrics

- **Request Rate:** Requests per second
- **Latency:** Response time percentiles
- **Error Rate:** Failed requests percentage
- **Simulation Stats:** Active simulations, completed scenarios

### Health Checks

```typescript
// src/routes/health.ts
fastify.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    activeSimulations: SimulationManager.getActiveCount(),
  };
});
```

## Testing Strategy

### Frontend Testing

- **Unit Tests:** Jest + React Testing Library
- **Component Tests:** Storybook for component testing
- **E2E Tests:** Playwright for user flows

### Backend Testing

- **Unit Tests:** Jest for individual engines
- **Integration Tests:** Supertest for API endpoints
- **Scenario Tests:** Validate scenario logic

### Performance Testing

- **Load Testing:** Artillery for API load testing
- **Stress Testing:** High-volume traffic simulation
- **Memory Profiling:** Node.js profiler for memory leaks

## Deployment Architecture

### Development

```
Frontend (localhost:3000) ←→ Backend (localhost:3001)
```

### Production

```
                    CDN (CloudFront/Vercel)
                           │
                    Frontend (Next.js)
                           │
                    Load Balancer
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   Backend Instance 1  Backend Instance 2  Backend Instance N
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    In-Memory State
```

### Container Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - NODE_ENV=production
```

## Future Enhancements

### Planned Features

1. **Multiplayer Mode:** Real-time competition between users
2. **Custom Scenarios:** User-created scenario editor
3. **AI Opponent:** AI that adapts to defense strategies
4. **Analytics Dashboard:** Detailed performance analytics
5. **Certification:** Skill badges and certificates
6. **Mobile App:** React Native mobile application

### Technical Improvements

1. **GraphQL API:** Alternative to REST for complex queries
2. **WebSocket Support:** For real-time multiplayer
3. **Database Integration:** PostgreSQL for persistent data
4. **Redis:** For distributed caching and session management
5. **Message Queue:** RabbitMQ for async task processing

## Conclusion

Layer7 Siege's architecture prioritizes:
- **Educational Value:** Clear, understandable security concepts
- **Performance:** Fast, responsive user experience
- **Security:** Safe simulation environment
- **Scalability:** Ability to handle many concurrent users
- **Maintainability:** Clean, well-documented codebase

The modular design allows for easy extension and modification as the project evolves.
