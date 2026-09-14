import { HttpRequest, Scenario, TrafficPattern } from '../types';

/**
 * Traffic Generator - Generates HTTP requests based on scenario patterns
 */
export class TrafficGenerator {
  private scenario: Scenario;
  private requestCounter: number = 0;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(scenario: Scenario) {
    this.scenario = scenario;
  }

  /**
   * Generate a single HTTP request based on weighted random selection
   */
  generateRequest(): { request: HttpRequest; isAttack: boolean } {
    const pattern = this.selectPattern();
    const template = this.selectRequestFromPattern(pattern);
    
    const request: HttpRequest = {
      id: `req-${++this.requestCounter}`,
      timestamp: Date.now(),
      method: template.method || 'GET',
      path: template.path || '/',
      headers: template.headers || {},
      query: template.query || {},
      body: template.body,
      ip: template.ip || this.generateRandomIP(),
      userAgent: template.userAgent || 'Mozilla/5.0',
    };

    return {
      request,
      isAttack: pattern.isAttack,
    };
  }

  /**
   * Select a traffic pattern based on weights
   */
  private selectPattern(): TrafficPattern {
    const totalWeight = this.scenario.trafficPatterns.reduce(
      (sum, pattern) => sum + pattern.weight,
      0
    );
    
    let random = Math.random() * totalWeight;
    
    for (const pattern of this.scenario.trafficPatterns) {
      random -= pattern.weight;
      if (random <= 0) {
        return pattern;
      }
    }
    
    return this.scenario.trafficPatterns[0];
  }

  /**
   * Select a specific request template from a pattern
   */
  private selectRequestFromPattern(pattern: TrafficPattern): Partial<HttpRequest> {
    if (pattern.requests.length === 0) {
      return {};
    }
    
    const randomIndex = Math.floor(Math.random() * pattern.requests.length);
    return pattern.requests[randomIndex];
  }

  /**
   * Generate a random IP address
   */
  private generateRandomIP(): string {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(
      Math.random() * 256
    )}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  /**
   * Start generating traffic at a specified interval
   */
  start(
    callback: (request: HttpRequest, isAttack: boolean) => void,
    intervalMs: number = 100
  ): void {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(() => {
      const { request, isAttack } = this.generateRequest();
      callback(request, isAttack);
    }, intervalMs);
  }

  /**
   * Stop generating traffic
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Generate a batch of requests for testing
   */
  generateBatch(count: number): { request: HttpRequest; isAttack: boolean }[] {
    const results: { request: HttpRequest; isAttack: boolean }[] = [];
    
    for (let i = 0; i < count; i++) {
      results.push(this.generateRequest());
    }
    
    return results;
  }

  /**
   * Reset the request counter
   */
  reset(): void {
    this.requestCounter = 0;
  }
}
