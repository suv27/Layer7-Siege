import { randomUUID } from 'crypto';
import { Rule, Scenario, SimulationState } from '../types';

export interface PlayerProfile {
  id: string;
  displayName: string;
  xp: number;
  rank: string;
  completedScenarios: string[];
  savedRules: Rule[];
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  score: number;
}

export interface ScenarioTestResult {
  passed: boolean;
  totalVectors: number;
  blockedAttacks: number;
  falsePositives: number;
  message: string;
}

export interface ForensicReport {
  id: string;
  scenarioId: string;
  generatedAt: number;
  score: SimulationState['score'];
  findings: Array<{
    requestId: string;
    status: string;
    reason?: string;
    matchedRule?: string;
  }>;
}

class PlatformManagerService {
  private profiles = new Map<string, PlayerProfile>();
  private teams = new Map<string, Team>();
  private customScenarios = new Map<string, Scenario>();
  private logs: string[] = [];

  getProfile(id = 'demo-player'): PlayerProfile {
    const existing = this.profiles.get(id);
    if (existing) return existing;
    const profile: PlayerProfile = {
      id,
      displayName: id === 'demo-player' ? 'Demo Defender' : id,
      xp: 0,
      rank: 'Recruit',
      completedScenarios: [],
      savedRules: [],
    };
    this.profiles.set(id, profile);
    return profile;
  }

  saveProfile(profile: PlayerProfile): PlayerProfile {
    const rank = profile.xp >= 1000 ? 'Sentinel' : profile.xp >= 500 ? 'Analyst' : 'Recruit';
    const updated = { ...profile, rank };
    this.profiles.set(profile.id, updated);
    return updated;
  }

  testScenario(scenario: Scenario, rules: Rule[]): ScenarioTestResult {
    const attackVectors = scenario.trafficPatterns.filter((pattern) => pattern.isAttack);
    const benignVectors = scenario.trafficPatterns.filter((pattern) => !pattern.isAttack);
    const blockedAttacks = attackVectors.filter((pattern) =>
      rules.some((rule) => rule.enabled && rule.conditions.some((condition) =>
        JSON.stringify(pattern.requests).toLowerCase().includes(condition.value.toLowerCase())
      ))
    ).length;
    const falsePositives = benignVectors.filter((pattern) =>
      rules.some((rule) => rule.enabled && rule.conditions.some((condition) =>
        JSON.stringify(pattern.requests).toLowerCase().includes(condition.value.toLowerCase())
      ))
    ).length;
    const totalVectors = attackVectors.length + benignVectors.length;
    const passed = blockedAttacks >= Math.ceil(attackVectors.length * scenario.successCriteria.blockRate)
      && falsePositives <= Math.floor(benignVectors.length * scenario.successCriteria.falsePositiveRate);
    return {
      passed,
      totalVectors,
      blockedAttacks,
      falsePositives,
      message: passed ? 'Test vectors meet the scenario success criteria.' : 'Add or refine rules before running the simulation.',
    };
  }

  createReport(state: SimulationState): ForensicReport {
    return {
      id: randomUUID(),
      scenarioId: state.scenarioId,
      generatedAt: Date.now(),
      score: state.score,
      findings: state.results.map((result) => ({
        requestId: result.requestId,
        status: result.status,
        reason: result.reason,
        matchedRule: result.matchedRule?.name,
      })),
    };
  }

  createScenario(scenario: Scenario): Scenario {
    const created = { ...scenario, id: scenario.id || `custom-${randomUUID()}` };
    this.customScenarios.set(created.id, created);
    this.log(`scenario-created ${created.id}`);
    return created;
  }

  listCustomScenarios(): Scenario[] {
    return Array.from(this.customScenarios.values());
  }

  evaluatePrompt(prompt: string, sensitivity: number): { blocked: boolean; risk: number; reason: string } {
    const markers = ['ignore previous', 'system prompt', 'jailbreak', 'token budget', 'reveal instructions'];
    const matches = markers.filter((marker) => prompt.toLowerCase().includes(marker));
    const risk = Math.min(100, matches.length * 25 + Math.round(sensitivity * 50));
    return {
      blocked: risk >= 60,
      risk,
      reason: matches.length > 0 ? `Matched ${matches.length} prompt-injection marker(s).` : 'No known injection markers matched.',
    };
  }

  createTeam(name: string, member = 'demo-player'): Team {
    const team = { id: `team-${randomUUID()}`, name, members: [member], score: 0 };
    this.teams.set(team.id, team);
    return team;
  }

  listTeams(): Team[] {
    return Array.from(this.teams.values()).sort((left, right) => right.score - left.score);
  }

  getHint(scenarioId: string, failures: number): { show: boolean; hint: string } {
    return {
      show: failures >= 3,
      hint: `Review the ${scenarioId} attack indicators and match the request field before selecting a blocking action.`,
    };
  }

  log(message: string): void {
    this.logs = [...this.logs, `${new Date().toISOString()} ${message}`].slice(-100);
  }

  getLogs(): string[] {
    return [...this.logs];
  }
}

export const PlatformManager = new PlatformManagerService();