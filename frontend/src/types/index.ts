export interface EvaluationResult {
  requestId: string;
  timestamp: number;
  status: 'allowed' | 'blocked' | 'rateLimited' | 'challenged';
  matchedRule?: {
    id: string;
    name: string;
  };
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
  duration: number;
  attackRatio: number;
  defaultRules: Rule[];
  successCriteria: {
    blockRate: number;
    falsePositiveRate: number;
  };
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  action: 'allow' | 'block' | 'rateLimit' | 'challenge';
  enabled: boolean;
}

export interface RuleCondition {
  field: 'header' | 'uri' | 'query' | 'body' | 'ip' | 'userAgent' | 'method';
  fieldName?: string;
  condition: 'contains' | 'equals' | 'regex' | 'startsWith' | 'endsWith';
  value: string;
}

export interface SimulationScore {
  totalRequests: number;
  attacksBlocked: number;
  attacksMissed: number;
  benignAllowed: number;
  benignBlocked: number;
  accuracy: number;
}
