import {
  HttpRequest,
  Rule,
  RuleCondition,
  RuleFieldType,
  RuleConditionType,
  EvaluationStatus,
  EvaluationResult,
} from '../types';

/**
 * Pure function to extract field value from HTTP request based on field type
 */
function extractFieldValue(request: HttpRequest, condition: RuleCondition): string {
  const { field, fieldName } = condition;

  switch (field) {
    case RuleFieldType.HEADER:
      return fieldName ? (request.headers[fieldName.toLowerCase()] || '') : '';
    
    case RuleFieldType.URI:
      return request.path;
    
    case RuleFieldType.QUERY:
      return fieldName ? (request.query[fieldName] || '') : '';
    
    case RuleFieldType.BODY:
      return typeof request.body === 'string' ? request.body : JSON.stringify(request.body || '');
    
    case RuleFieldType.IP:
      return request.ip;
    
    case RuleFieldType.USER_AGENT:
      return request.userAgent;
    
    case RuleFieldType.METHOD:
      return request.method;
    
    default:
      return '';
  }
}

/**
 * Pure function to check if a condition matches
 */
function matchesCondition(fieldValue: string, condition: RuleCondition): boolean {
  const { condition: condType, value } = condition;

  switch (condType) {
    case RuleConditionType.CONTAINS:
      return fieldValue.toLowerCase().includes(value.toLowerCase());
    
    case RuleConditionType.EQUALS:
      return fieldValue.toLowerCase() === value.toLowerCase();
    
    case RuleConditionType.REGEX:
      try {
        const regex = new RegExp(value, 'i');
        return regex.test(fieldValue);
      } catch {
        return false;
      }
    
    case RuleConditionType.STARTS_WITH:
      return fieldValue.toLowerCase().startsWith(value.toLowerCase());
    
    case RuleConditionType.ENDS_WITH:
      return fieldValue.toLowerCase().endsWith(value.toLowerCase());
    
    default:
      return false;
  }
}

/**
 * Pure function to check if all conditions in a rule match
 */
function matchesRule(request: HttpRequest, rule: Rule): boolean {
  if (!rule.enabled) {
    return false;
  }

  return rule.conditions.every((condition) => {
    const fieldValue = extractFieldValue(request, condition);
    return matchesCondition(fieldValue, condition);
  });
}

/**
 * Pure function to evaluate a request against rules
 * Returns the first matching rule's action, or ALLOW if no rules match
 */
export function evaluateRequest(
  request: HttpRequest,
  rules: Rule[],
  isAttack: boolean
): EvaluationResult {
  // Find the first matching rule
  for (const rule of rules) {
    if (matchesRule(request, rule)) {
      const status = mapActionToStatus(rule.action);
      
      return {
        requestId: request.id,
        timestamp: request.timestamp,
        status,
        matchedRule: rule,
        reason: `Matched rule: ${rule.name}`,
        isAttack,
        score: calculateScore(status, isAttack),
      };
    }
  }

  // No rules matched - allow by default
  return {
    requestId: request.id,
    timestamp: request.timestamp,
    status: EvaluationStatus.ALLOWED,
    reason: 'No rules matched',
    isAttack,
    score: calculateScore(EvaluationStatus.ALLOWED, isAttack),
  };
}

/**
 * Map rule action to evaluation status
 */
function mapActionToStatus(action: string): EvaluationStatus {
  switch (action) {
    case 'block':
      return EvaluationStatus.BLOCKED;
    case 'rateLimit':
      return EvaluationStatus.RATE_LIMITED;
    case 'challenge':
      return EvaluationStatus.CHALLENGED;
    default:
      return EvaluationStatus.ALLOWED;
  }
}

/**
 * Calculate score based on status and whether it's an attack
 * - Blocking an attack: +10 points
 * - Allowing benign traffic: +5 points
 * - Blocking benign traffic (false positive): -10 points
 * - Allowing an attack (missed): -5 points
 */
function calculateScore(status: EvaluationStatus, isAttack: boolean): number {
  if (isAttack) {
    if (status === EvaluationStatus.BLOCKED || 
        status === EvaluationStatus.RATE_LIMITED || 
        status === EvaluationStatus.CHALLENGED) {
      return 10; // Good: blocked attack
    }
    return -5; // Bad: missed attack
  } else {
    if (status === EvaluationStatus.ALLOWED) {
      return 5; // Good: allowed benign traffic
    }
    return -10; // Bad: false positive
  }
}

/**
 * Pure function to evaluate multiple requests and return results
 */
export function evaluateBatch(
  requests: HttpRequest[],
  rules: Rule[],
  attackFlags: boolean[]
): EvaluationResult[] {
  return requests.map((request, index) => 
    evaluateRequest(request, rules, attackFlags[index] || false)
  );
}
