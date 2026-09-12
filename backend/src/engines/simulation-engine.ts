import { EventEmitter } from 'events';
import { Scenario, Rule, SimulationState, EvaluationResult, HttpRequest } from '../types';
import { TrafficGenerator } from './traffic-generator';
import { evaluateRequest } from './rule-matcher';

/**
 * Simulation Engine - Orchestrates traffic generation and rule evaluation
 */
export class SimulationEngine extends EventEmitter {
  private scenario: Scenario;
  private rules: Rule[];
  private trafficGenerator: TrafficGenerator;
  private state: SimulationState;
  private intervalId: NodeJS.Timeout | null = null;
  private durationMs: number;
  private startTime: number = 0;

  constructor(scenario: Scenario, rules: Rule[] = []) {
    super();
    this.scenario = scenario;
    this.rules = rules.length > 0 ? rules : scenario.defaultRules;
    this.trafficGenerator = new TrafficGenerator(scenario);
    this.durationMs = scenario.duration * 1000;
    
    this.state = {
      scenarioId: scenario.id,
      status: 'idle',
      rules: this.rules,
      results: [],
      score: {
        totalRequests: 0,
        attacksBlocked: 0,
        attacksMissed: 0,
        benignAllowed: 0,
        benignBlocked: 0,
        accuracy: 0,
      },
    };
  }

  /**
   * Start the simulation
   */
  start(intervalMs: number = 100): void {
    if (this.state.status === 'running') {
      return;
    }

    this.state.status = 'running';
    this.state.startTime = Date.now();
    this.startTime = Date.now();
    this.trafficGenerator.reset();

    this.intervalId = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      
      if (elapsed >= this.durationMs) {
        this.stop();
        return;
      }

      const { request, isAttack } = this.trafficGenerator.generateRequest();
      const result = evaluateRequest(request, this.rules, isAttack);
      
      this.updateState(result);
      this.emit('traffic', result);
    }, intervalMs);

    this.emit('started', this.state);
  }

  /**
   * Stop the simulation
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.state.status = 'completed';
    this.state.endTime = Date.now();
    this.trafficGenerator.stop();
    
    this.emit('completed', this.state);
  }

  /**
   * Update simulation state with evaluation result
   */
  private updateState(result: EvaluationResult): void {
    this.state.results.push(result);
    this.state.score.totalRequests++;

    if (result.isAttack) {
      if (
        result.status === 'blocked' ||
        result.status === 'rateLimited' ||
        result.status === 'challenged'
      ) {
        this.state.score.attacksBlocked++;
      } else {
        this.state.score.attacksMissed++;
      }
    } else {
      if (result.status === 'allowed') {
        this.state.score.benignAllowed++;
      } else {
        this.state.score.benignBlocked++;
      }
    }

    // Calculate accuracy
    const totalCorrect =
      this.state.score.attacksBlocked + this.state.score.benignAllowed;
    this.state.score.accuracy =
      this.state.score.totalRequests > 0
        ? (totalCorrect / this.state.score.totalRequests) * 100
        : 0;
  }

  /**
   * Update rules during simulation
   */
  updateRules(rules: Rule[]): void {
    this.rules = rules;
    this.state.rules = rules;
  }

  /**
   * Get current simulation state
   */
  getState(): SimulationState {
    return { ...this.state };
  }

  /**
   * Check if simulation meets success criteria
   */
  meetsSuccessCriteria(): boolean {
    const { successCriteria } = this.scenario;
    const { score } = this.state;

    const totalAttacks = score.attacksBlocked + score.attacksMissed;
    const blockRate =
      totalAttacks > 0 ? score.attacksBlocked / totalAttacks : 0;

    const totalBenign = score.benignAllowed + score.benignBlocked;
    const falsePositiveRate =
      totalBenign > 0 ? score.benignBlocked / totalBenign : 0;

    return (
      blockRate >= successCriteria.blockRate &&
      falsePositiveRate <= successCriteria.falsePositiveRate
    );
  }

  /**
   * Reset simulation state
   */
  reset(): void {
    this.state = {
      scenarioId: this.scenario.id,
      status: 'idle',
      rules: this.rules,
      results: [],
      score: {
        totalRequests: 0,
        attacksBlocked: 0,
        attacksMissed: 0,
        benignAllowed: 0,
        benignBlocked: 0,
        accuracy: 0,
      },
    };
    this.trafficGenerator.reset();
  }
}
