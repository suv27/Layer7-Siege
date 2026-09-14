import { EventEmitter } from 'events';
import { SimulationEngine } from '../engines/simulation-engine';
import { Scenario, Rule } from '../types';
import { sqliXssScenario } from '../scenarios/owasp-scenarios';
import { botScrapingScenario } from '../scenarios/bot-scenarios';

/**
 * Simulation Manager - Manages active simulations
 */
class SimulationManagerClass extends EventEmitter {
  private simulations: Map<string, SimulationEngine> = new Map();
  private completedSimulations: Map<string, SimulationEngine> = new Map();
  private scenarios: Map<string, Scenario> = new Map();

  constructor() {
    super();
    // Register scenarios
    this.scenarios.set(sqliXssScenario.id, sqliXssScenario);
    this.scenarios.set(botScrapingScenario.id, botScrapingScenario);
  }

  /**
   * Get all available scenarios
   */
  getScenarios(): Scenario[] {
    return Array.from(this.scenarios.values());
  }

  /**
   * Get a specific scenario by ID
   */
  getScenario(id: string): Scenario | undefined {
    return this.scenarios.get(id);
  }

  /**
   * Create a new simulation
   */
  createSimulation(scenarioId: string, rules?: Rule[]): SimulationEngine | null {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      return null;
    }

    const engine = new SimulationEngine(scenario, rules);
    const simulationId = `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.simulations.set(simulationId, engine);
    
    // Forward engine events
    engine.on('traffic', (data) => {
      this.emit('log', `traffic ${data.requestId} ${data.status}`);
      this.emit('traffic', { simulationId, data });
    });
    
    engine.on('started', (state) => {
      this.emit('simulationStarted', { simulationId, state });
    });
    
    engine.on('completed', (state) => {
      this.emit('simulationCompleted', { simulationId, state });
    });

    return engine;
  }

  /**
   * Get a simulation by ID
   */
  getSimulation(id: string): SimulationEngine | undefined {
    return this.simulations.get(id) || this.completedSimulations.get(id);
  }

  /**
   * Delete a simulation
   */
  deleteSimulation(id: string): boolean {
    const engine = this.simulations.get(id);
    if (engine) {
      engine.stop();
      this.simulations.delete(id);
      this.completedSimulations.set(id, engine);
      return true;
    }
    return false;
  }

  /**
   * Get all active simulations
   */
  getActiveSimulations(): string[] {
    return Array.from(this.simulations.keys());
  }

  /**
   * Get count of active simulations
   */
  getActiveCount(): number {
    return this.simulations.size;
  }
}

// Export singleton instance
export const SimulationManager = new SimulationManagerClass();
