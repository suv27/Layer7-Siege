import { Scenario, Rule, RuleFieldType, RuleConditionType, RuleActionType } from '../types';

/**
 * SQL Injection & XSS Scenario
 * Category: OWASP Top 10
 * Difficulty: Beginner
 */
export const sqliXssScenario: Scenario = {
  id: 'owasp-sqli-xss-001',
  name: 'SQL Injection & XSS Attacks',
  category: 'OWASP',
  description: 'Detect and block SQL injection and cross-site scripting attacks in web forms and API endpoints',
  difficulty: 'beginner',
  duration: 60,
  attackRatio: 0.3, // 30% attack traffic
  trafficPatterns: [
    // Benign traffic patterns
    {
      name: 'Normal Login',
      isAttack: false,
      weight: 20,
      requests: [
        {
          method: 'POST',
          path: '/api/login',
          headers: {
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          query: {},
          body: {
            username: 'john@example.com',
            password: 'securePass123',
          },
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      ],
    },
    {
      name: 'Search Query',
      isAttack: false,
      weight: 15,
      requests: [
        {
          method: 'GET',
          path: '/api/search',
          headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
          query: {
            q: 'javascript tutorial',
            page: '1',
          },
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      ],
    },
    {
      name: 'User Profile',
      isAttack: false,
      weight: 15,
      requests: [
        {
          method: 'GET',
          path: '/api/users/123',
          headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
          },
          query: {},
          ip: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        },
      ],
    },
    // Attack patterns - SQL Injection
    {
      name: 'SQL Injection - OR Bypass',
      isAttack: true,
      weight: 10,
      requests: [
        {
          method: 'POST',
          path: '/api/login',
          headers: {
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          query: {},
          body: {
            username: "admin' OR '1'='1",
            password: 'anything',
          },
          ip: '10.0.0.50',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      ],
    },
    {
      name: 'SQL Injection - UNION SELECT',
      isAttack: true,
      weight: 8,
      requests: [
        {
          method: 'GET',
          path: '/api/products',
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          query: {
            id: "1' UNION SELECT username, password FROM users--",
          },
          ip: '10.0.0.51',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      ],
    },
    {
      name: 'SQL Injection - Comment',
      isAttack: true,
      weight: 7,
      requests: [
        {
          method: 'POST',
          path: '/api/search',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          query: {},
          body: 'search=test%27%20--%20',
          ip: '10.0.0.52',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      ],
    },
    // Attack patterns - XSS
    {
      name: 'XSS - Script Tag',
      isAttack: true,
      weight: 10,
      requests: [
        {
          method: 'POST',
          path: '/api/comments',
          headers: {
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          query: {},
          body: {
            comment: '<script>alert("XSS")</script>',
            postId: '123',
          },
          ip: '10.0.0.53',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      ],
    },
    {
      name: 'XSS - OnClick',
      isAttack: true,
      weight: 8,
      requests: [
        {
          method: 'GET',
          path: '/api/search',
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          query: {
            q: 'test"><img src=x onerror=alert(1)>',
          },
          ip: '10.0.0.54',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      ],
    },
    {
      name: 'XSS - JavaScript URI',
      isAttack: true,
      weight: 7,
      requests: [
        {
          method: 'POST',
          path: '/api/redirect',
          headers: {
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          query: {},
          body: {
            url: 'javascript:alert(document.cookie)',
          },
          ip: '10.0.0.55',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      ],
    },
  ],
  defaultRules: [
    {
      id: 'sqli-001',
      name: 'Block SQL Injection Patterns',
      description: 'Detects common SQL injection patterns in query parameters and body',
      conditions: [
        {
          field: RuleFieldType.QUERY,
          condition: RuleConditionType.REGEX,
          value: "(?i)(\\bor\\b|\\band\\b|\\bunion\\b|\\bselect\\b|\\binsert\\b|\\bupdate\\b|\\bdelete\\b|\\bdrop\\b|\\b--\\b|\\/\\*|\\*\\/|;|')",
        },
        {
          field: RuleFieldType.BODY,
          condition: RuleConditionType.REGEX,
          value: "(?i)(\\bor\\b|\\band\\b|\\bunion\\b|\\bselect\\b|\\binsert\\b|\\bupdate\\b|\\bdelete\\b|\\bdrop\\b|\\b--\\b|\\/\\*|\\*\\/|;|')",
        },
      ],
      action: RuleActionType.BLOCK,
      enabled: true,
    },
    {
      id: 'xss-001',
      name: 'Block XSS Patterns',
      description: 'Detects cross-site scripting patterns in query parameters and body',
      conditions: [
        {
          field: RuleFieldType.QUERY,
          condition: RuleConditionType.REGEX,
          value: '(?i)(<script|<iframe|javascript:|onerror=|onclick=|onload=|onmouseover=|alert\\()',
        },
        {
          field: RuleFieldType.BODY,
          condition: RuleConditionType.REGEX,
          value: '(?i)(<script|<iframe|javascript:|onerror=|onclick=|onload=|onmouseover=|alert\\()',
        },
      ],
      action: RuleActionType.BLOCK,
      enabled: true,
    },
  ],
  successCriteria: {
    blockRate: 0.9, // Block 90% of attacks
    falsePositiveRate: 0.05, // Max 5% false positives
  },
};
