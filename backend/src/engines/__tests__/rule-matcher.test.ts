import {
  evaluateRequest,
  evaluateBatch,
} from '../rule-matcher';
import {
  HttpRequest,
  Rule,
  RuleFieldType,
  RuleConditionType,
  RuleActionType,
  EvaluationStatus,
} from '../../types';

describe('Rule Matcher', () => {
  describe('evaluateRequest', () => {
    const mockRequest: HttpRequest = {
      id: 'req-1',
      timestamp: Date.now(),
      method: 'POST',
      path: '/api/login',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0',
      },
      query: {},
      body: {
        username: "admin' OR '1'='1",
        password: 'test',
      },
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    };

    const sqliRule: Rule = {
      id: 'sqli-001',
      name: 'SQL Injection Block',
      description: 'Blocks SQL injection attempts',
      conditions: [
        {
          field: RuleFieldType.BODY,
          condition: RuleConditionType.CONTAINS,
          value: "' OR '1'='1",
        },
      ],
      action: RuleActionType.BLOCK,
      enabled: true,
    };

    test('should block request matching SQL injection pattern', () => {
      const result = evaluateRequest(mockRequest, [sqliRule], true);
      
      expect(result.status).toBe(EvaluationStatus.BLOCKED);
      expect(result.matchedRule).toBe(sqliRule);
      expect(result.isAttack).toBe(true);
      expect(result.score).toBe(10); // +10 for blocking attack
    });

    test('should allow request when no rules match', () => {
      const result = evaluateRequest(mockRequest, [], false);
      
      expect(result.status).toBe(EvaluationStatus.ALLOWED);
      expect(result.matchedRule).toBeUndefined();
      expect(result.reason).toBe('No rules matched');
      expect(result.score).toBe(5); // +5 for allowing benign traffic
    });

    test('should not match disabled rules', () => {
      const disabledRule: Rule = { ...sqliRule, enabled: false };
      const result = evaluateRequest(mockRequest, [disabledRule], true);
      
      expect(result.status).toBe(EvaluationStatus.ALLOWED);
      expect(result.matchedRule).toBeUndefined();
    });

    test('should match header field condition', () => {
      const headerRule: Rule = {
        id: 'header-001',
        name: 'Block specific user agent',
        description: 'Blocks requests with specific user agent',
        conditions: [
          {
            field: RuleFieldType.HEADER,
            fieldName: 'user-agent',
            condition: RuleConditionType.CONTAINS,
            value: 'Mozilla',
          },
        ],
        action: RuleActionType.BLOCK,
        enabled: true,
      };

      const result = evaluateRequest(mockRequest, [headerRule], true);
      
      expect(result.status).toBe(EvaluationStatus.BLOCKED);
      expect(result.matchedRule).toBe(headerRule);
    });

    test('should match URI field condition', () => {
      const uriRule: Rule = {
        id: 'uri-001',
        name: 'Block admin path',
        description: 'Blocks requests to admin paths',
        conditions: [
          {
            field: RuleFieldType.URI,
            condition: RuleConditionType.CONTAINS,
            value: '/api/login',
          },
        ],
        action: RuleActionType.BLOCK,
        enabled: true,
      };

      const result = evaluateRequest(mockRequest, [uriRule], true);
      
      expect(result.status).toBe(EvaluationStatus.BLOCKED);
      expect(result.matchedRule).toBe(uriRule);
    });

    test('should match query parameter condition', () => {
      const queryRequest: HttpRequest = {
        ...mockRequest,
        query: { id: "1' UNION SELECT * FROM users--" },
      };

      const queryRule: Rule = {
        id: 'query-001',
        name: 'Block SQLi in query',
        description: 'Blocks SQL injection in query parameters',
        conditions: [
          {
            field: RuleFieldType.QUERY,
            fieldName: 'id',
            condition: RuleConditionType.CONTAINS,
            value: 'UNION SELECT',
          },
        ],
        action: RuleActionType.BLOCK,
        enabled: true,
      };

      const result = evaluateRequest(queryRequest, [queryRule], true);
      
      expect(result.status).toBe(EvaluationStatus.BLOCKED);
      expect(result.matchedRule).toBe(queryRule);
    });

    test('should match regex condition', () => {
      const regexRule: Rule = {
        id: 'regex-001',
        name: 'Block script tags',
        description: 'Blocks requests with script tags',
        conditions: [
          {
            field: RuleFieldType.BODY,
            condition: RuleConditionType.REGEX,
            value: '<script',
          },
        ],
        action: RuleActionType.BLOCK,
        enabled: true,
      };

      const xssRequest: HttpRequest = {
        ...mockRequest,
        body: { comment: '<script>alert("XSS")</script>' },
      };

      const result = evaluateRequest(xssRequest, [regexRule], true);
      
      expect(result.status).toBe(EvaluationStatus.BLOCKED);
      expect(result.matchedRule).toBe(regexRule);
    });

    test('should match starts_with condition', () => {
      const startsWithRule: Rule = {
        id: 'starts-001',
        name: 'Block paths starting with /admin',
        description: 'Blocks requests to admin paths',
        conditions: [
          {
            field: RuleFieldType.URI,
            condition: RuleConditionType.STARTS_WITH,
            value: '/admin',
          },
        ],
        action: RuleActionType.BLOCK,
        enabled: true,
      };

      const adminRequest: HttpRequest = {
        ...mockRequest,
        path: '/admin/users',
      };

      const result = evaluateRequest(adminRequest, [startsWithRule], true);
      
      expect(result.status).toBe(EvaluationStatus.BLOCKED);
    });

    test('should match ends_with condition', () => {
      const endsWithRule: Rule = {
        id: 'ends-001',
        name: 'Block .php requests',
        description: 'Blocks requests to PHP files',
        conditions: [
          {
            field: RuleFieldType.URI,
            condition: RuleConditionType.ENDS_WITH,
            value: '.php',
          },
        ],
        action: RuleActionType.BLOCK,
        enabled: true,
      };

      const phpRequest: HttpRequest = {
        ...mockRequest,
        path: '/api/login.php',
      };

      const result = evaluateRequest(phpRequest, [endsWithRule], true);
      
      expect(result.status).toBe(EvaluationStatus.BLOCKED);
    });

    test('should calculate negative score for false positive', () => {
      const result = evaluateRequest(mockRequest, [sqliRule], false);
      
      expect(result.status).toBe(EvaluationStatus.BLOCKED);
      expect(result.score).toBe(-10); // -10 for false positive
    });

    test('should calculate negative score for missed attack', () => {
      const result = evaluateRequest(mockRequest, [], true);
      
      expect(result.status).toBe(EvaluationStatus.ALLOWED);
      expect(result.score).toBe(-5); // -5 for missed attack
    });

    test('should stop at first matching rule', () => {
      const firstRule: Rule = {
        id: 'first-001',
        name: 'First rule',
        description: 'First matching rule',
        conditions: [
          {
            field: RuleFieldType.URI,
            condition: RuleConditionType.CONTAINS,
            value: '/api',
          },
        ],
        action: RuleActionType.BLOCK,
        enabled: true,
      };

      const secondRule: Rule = {
        id: 'second-001',
        name: 'Second rule',
        description: 'Second matching rule',
        conditions: [
          {
            field: RuleFieldType.URI,
            condition: RuleConditionType.CONTAINS,
            value: 'login',
          },
        ],
        action: RuleActionType.CHALLENGE,
        enabled: true,
      };

      const result = evaluateRequest(mockRequest, [firstRule, secondRule], true);
      
      expect(result.status).toBe(EvaluationStatus.BLOCKED);
      expect(result.matchedRule).toBe(firstRule);
    });

    test('should handle all conditions in a rule (AND logic)', () => {
      const multiConditionRule: Rule = {
        id: 'multi-001',
        name: 'Multi-condition rule',
        description: 'Rule with multiple conditions',
        conditions: [
          {
            field: RuleFieldType.URI,
            condition: RuleConditionType.CONTAINS,
            value: '/api/login',
          },
          {
            field: RuleFieldType.HEADER,
            fieldName: 'content-type',
            condition: RuleConditionType.CONTAINS,
            value: 'application/json',
          },
        ],
        action: RuleActionType.BLOCK,
        enabled: true,
      };

      const result = evaluateRequest(mockRequest, [multiConditionRule], true);
      
      expect(result.status).toBe(EvaluationStatus.BLOCKED);
    });

    test('should not match when only some conditions match', () => {
      const multiConditionRule: Rule = {
        id: 'multi-002',
        name: 'Multi-condition rule',
        description: 'Rule with multiple conditions',
        conditions: [
          {
            field: RuleFieldType.URI,
            condition: RuleConditionType.CONTAINS,
            value: '/api/login',
          },
          {
            field: RuleFieldType.URI,
            condition: RuleConditionType.CONTAINS,
            value: '/admin',
          },
        ],
        action: RuleActionType.BLOCK,
        enabled: true,
      };

      const result = evaluateRequest(mockRequest, [multiConditionRule], true);
      
      expect(result.status).toBe(EvaluationStatus.ALLOWED);
    });
  });

  describe('evaluateBatch', () => {
    const mockRequests: HttpRequest[] = [
      {
        id: 'req-1',
        timestamp: Date.now(),
        method: 'POST',
        path: '/api/login',
        headers: {},
        query: {},
        body: { username: "admin' OR '1'='1" },
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        id: 'req-2',
        timestamp: Date.now(),
        method: 'POST',
        path: '/api/login',
        headers: {},
        query: {},
        body: { username: 'john@example.com' },
        ip: '192.168.1.2',
        userAgent: 'Mozilla/5.0',
      },
    ];

    const sqliRule: Rule = {
      id: 'sqli-001',
      name: 'SQL Injection Block',
      description: 'Blocks SQL injection attempts',
      conditions: [
        {
          field: RuleFieldType.BODY,
          condition: RuleConditionType.CONTAINS,
          value: "' OR '1'='1",
        },
      ],
      action: RuleActionType.BLOCK,
      enabled: true,
    };

    test('should evaluate multiple requests', () => {
      const attackFlags = [true, false];
      const results = evaluateBatch(mockRequests, [sqliRule], attackFlags);
      
      expect(results).toHaveLength(2);
      expect(results[0].status).toBe(EvaluationStatus.BLOCKED);
      expect(results[1].status).toBe(EvaluationStatus.ALLOWED);
    });

    test('should handle empty request array', () => {
      const results = evaluateBatch([], [sqliRule], []);
      
      expect(results).toHaveLength(0);
    });
  });
});
