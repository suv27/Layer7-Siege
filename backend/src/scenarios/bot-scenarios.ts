import { Scenario, RuleFieldType, RuleConditionType, RuleActionType } from '../types';

/**
 * Bad Bot Scraping / Rate Limiting Scenario
 * Category: Bot Mitigation
 * Difficulty: Beginner
 */
export const botScrapingScenario: Scenario = {
  id: 'bot-scraping-001',
  name: 'Bad Bot Scraping & Rate Limiting',
  category: 'BOT',
  description: 'Detect and block automated bot scraping while allowing legitimate user traffic',
  difficulty: 'beginner',
  duration: 60,
  attackRatio: 0.3, // 30% attack traffic
  trafficPatterns: [
    // Benign traffic patterns
    {
      name: 'Normal Browsing',
      isAttack: false,
      weight: 25,
      requests: [
        {
          method: 'GET',
          path: '/api/products',
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'accept-language': 'en-US,en;q=0.9',
          },
          query: {
            page: '1',
            limit: '20',
          },
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      ],
    },
    {
      name: 'Mobile User',
      isAttack: false,
      weight: 20,
      requests: [
        {
          method: 'GET',
          path: '/api/products/123',
          headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'accept': 'application/json',
          },
          query: {},
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        },
      ],
    },
    {
      name: 'API Client',
      isAttack: false,
      weight: 15,
      requests: [
        {
          method: 'GET',
          path: '/api/v1/products',
          headers: {
            'user-agent': 'MyApp/1.0 (iOS)',
            'authorization': 'Bearer valid-token-123',
          },
          query: {
            category: 'electronics',
          },
          ip: '192.168.1.102',
          userAgent: 'MyApp/1.0 (iOS)',
        },
      ],
    },
    // Attack patterns - Bot Scraping
    {
      name: 'Headless Chrome Bot',
      isAttack: true,
      weight: 12,
      requests: [
        {
          method: 'GET',
          path: '/api/products',
          headers: {
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36',
            'accept': '*/*',
          },
          query: {
            page: '1',
          },
          ip: '10.0.0.50',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36',
        },
      ],
    },
    {
      name: 'Python Requests Bot',
      isAttack: true,
      weight: 10,
      requests: [
        {
          method: 'GET',
          path: '/api/products',
          headers: {
            'user-agent': 'python-requests/2.31.0',
            'accept': '*/*',
          },
          query: {},
          ip: '10.0.0.51',
          userAgent: 'python-requests/2.31.0',
        },
      ],
    },
    {
      name: 'Curl Bot',
      isAttack: true,
      weight: 8,
      requests: [
        {
          method: 'GET',
          path: '/api/products',
          headers: {
            'user-agent': 'curl/7.68.0',
          },
          query: {},
          ip: '10.0.0.52',
          userAgent: 'curl/7.68.0',
        },
      ],
    },
    {
      name: 'High-Frequency Scraping',
      isAttack: true,
      weight: 10,
      requests: [
        {
          method: 'GET',
          path: '/api/products',
          headers: {
            'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          },
          query: {
            page: '1',
          },
          ip: '10.0.0.53',
          userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
      ],
    },
  ],
  defaultRules: [
    {
      id: 'bot-001',
      name: 'Block Headless Browsers',
      description: 'Detects and blocks headless browser user agents',
      conditions: [
        {
          field: RuleFieldType.USER_AGENT,
          condition: RuleConditionType.CONTAINS,
          value: 'HeadlessChrome',
        },
      ],
      action: RuleActionType.BLOCK,
      enabled: true,
    },
    {
      id: 'bot-002',
      name: 'Block Common Bot Tools',
      description: 'Detects and blocks common bot/scraping tools',
      conditions: [
        {
          field: RuleFieldType.USER_AGENT,
          condition: RuleConditionType.CONTAINS,
          value: 'python-requests',
        },
        {
          field: RuleFieldType.USER_AGENT,
          condition: RuleConditionType.CONTAINS,
          value: 'curl/',
        },
        {
          field: RuleFieldType.USER_AGENT,
          condition: RuleConditionType.CONTAINS,
          value: 'wget',
        },
      ],
      action: RuleActionType.BLOCK,
      enabled: true,
    },
    {
      id: 'bot-003',
      name: 'Challenge Suspicious User Agents',
      description: 'Challenges requests with suspicious user agent patterns',
      conditions: [
        {
          field: RuleFieldType.USER_AGENT,
          condition: RuleConditionType.REGEX,
          value: '(?i)(bot|crawler|spider|scraper)',
        },
      ],
      action: RuleActionType.CHALLENGE,
      enabled: true,
    },
  ],
  successCriteria: {
    blockRate: 0.85, // Block 85% of bot traffic
    falsePositiveRate: 0.1, // Max 10% false positives
  },
};
