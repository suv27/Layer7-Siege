// Core data models for Layer7 Siege

export interface HttpRequest {
  id: string;
  timestamp: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: any;
  ip: string;
  userAgent: string;
}

export enum RuleFieldType {
  HEADER = 'header',
  URI = 'uri',
  QUERY = 'query',
  BODY = 'body',
  IP = 'ip',
  USER_AGENT = 'userAgent',
  METHOD = 'method',
}

export enum RuleConditionType {
  CONTAINS = 'contains',
  EQUALS = 'equals',
  REGEX = 'regex',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
}

export enum RuleActionType {
  ALLOW = 'allow',
  BLOCK = 'block',
  RATE_LIMIT = 'rateLimit',
  CHALLENGE = 'challenge',
}

export interface RuleCondition {
  field: RuleFieldType;
  fieldName?: string; // For headers, query params, etc.
  condition: RuleConditionType;
  value: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  action: RuleActionType;
  enabled: boolean;
}

export enum EvaluationStatus {
  ALLOWED = 'allowed',
  BLOCKED = 'blocked',
  RATE_LIMITED = 'rateLimited',
  CHALLENGED = 'challenged',
}

export interface EvaluationResult {
  requestId: string;
  timestamp: number;
  status: EvaluationStatus;
  matchedRule?: Rule;
  reason?: string;
  isAttack: boolean;
  score: number;
}

export interface Scenario {
  id: string;
  name: string;
  category: 'OWASP' | 'BOT' | 'DDOS' | 'AI';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in seconds
  attackRatio: number; // 0-1, percentage of attack traffic
  trafficPatterns: TrafficPattern[];
  defaultRules: Rule[];
  successCriteria: {
    blockRate: number; // minimum percentage of attacks to block
    falsePositiveRate: number; // maximum percentage of benign traffic to block
  };
}

export interface TrafficPattern {
  name: string;
  isAttack: boolean;
  requests: Partial<HttpRequest>[];
  weight: number; // probability weight for selection
}

export interface SimulationState {
  scenarioId: string;
  status: 'idle' | 'running' | 'completed';
  startTime?: number;
  endTime?: number;
  rules: Rule[];
  results: EvaluationResult[];
  score: {
    totalRequests: number;
    attacksBlocked: number;
    attacksMissed: number;
    benignAllowed: number;
    benignBlocked: number; // false positives
    accuracy: number;
  };
}
