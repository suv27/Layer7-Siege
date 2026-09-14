# Layer7 Siege 🛡️

**Layer7 Siege** is an open-source, gamified web application designed for students and security engineers to master Layer 7 security, Web Application Firewalls (WAF), API protection, and bot mitigation through hands-on simulation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)

## 🎯 Learning Objectives

Layer7 Siege helps you build a comprehensive security portfolio through interactive scenarios:

- **Layer 7 Fundamentals:** Understand HTTP payload analysis, header inspection, and URI routing defenses
- **OWASP Top 10 & API Defense:** Recognize and block SQLi, XSS, BOLA, and broken authentication attacks
- **Bot & AI Traffic Mitigation:** Configure fingerprinting, challenge rules (CAPTCHA/JS execution), and defense strategies against automated AI bots
- **L7 DDoS Protection:** Implement rate limiting, IP reputation scoring, and burst-protection thresholds
- **AI/LLM Security:** Mitigate prompt injection, model denial-of-wallet, and API token exhaustion attacks

### Your Security Portfolio Journey

```
                    ⭐
                    │
         StarDefense-Perimeter
                    │
      ┌─────────────┼─────────────┐
      │             │             │
     WAF         Bot Mgmt     API Security
      │             │             │
      └─────────────┼─────────────┘
                    │
             Layer 7 Gateway
                    │
                AWS Cloud
                    │
      ┌─────────────┼─────────────┐
      │             │             │
  CloudFront       WAF        API Gateway
      │             │             │
      └─────────────┼─────────────┘
                    │
               Application
                    │
               Telemetry
                    │
         Security Dashboard
```

## 🕹️ Core Gameplay

1. **Select a Scenario:** Choose from beginner to advanced challenges (e.g., "Mitigate Credential Stuffing Attack" or "Defend AI Endpoint from API Abuse")
2. **Configure Defenses:** Set up custom WAF rules, rate limits, and bot challenges
3. **Run Traffic:** Execute live simulated attack traffic alongside benign user requests
4. **Earn Points:** Achieve high defense efficiency by blocking attacks while maintaining zero false positives for legitimate users

## 🏗️ Architecture

Layer7 Siege uses a modern, secure architecture:

- **Frontend:** Next.js 14+ with TypeScript, TailwindCSS, and shadcn/ui components
- **Backend:** Node.js with Fastify for high-performance request simulation
- **Simulation Engine:** In-memory traffic generator with realistic attack patterns
- **Security:** All attacks are simulated - no real malicious traffic is generated

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend Framework | Next.js 14+ (React) | Modern SSR/SSG framework with excellent DX |
| Language | TypeScript | Type safety across frontend and backend |
| Styling | TailwindCSS | Utility-first CSS for rapid UI development |
| UI Components | shadcn/ui | Beautiful, accessible component library |
| Backend Runtime | Node.js 20+ | Fast JavaScript runtime for simulation engine |
| Backend Framework | Fastify | High-performance, low-overhead web framework |
| Real-time Updates | Server-Sent Events (SSE) | Live traffic visualization without WebSockets complexity |
| State Management | React Context + Zustand | Lightweight state management for game state |
| Build Tool | Turbopack | Next.js's optimized bundler for fast builds |

### Why This Stack?

- **Security:** No real attack execution - all traffic is simulated in-memory
- **Performance:** Fastify provides 2x faster request handling than Express
- **Developer Experience:** TypeScript catches errors early, Next.js offers excellent DX
- **Modern UI:** shadcn/ui provides beautiful, accessible components out of the box
- **Deployment:** Containerized with Docker for easy deployment anywhere

## 📁 Project Structure

```
layer7-siege/
├── README.md
├── LICENSE
├── .gitignore
├── docker-compose.yml
├── docs/
│   ├── architecture.md          # Detailed technical architecture
│   ├── scenarios.md             # Scenario definitions and learning paths
│   └── deployment.md            # Deployment guides
├── frontend/                     # Next.js Dashboard
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── scenarios/       # Scenario selection and gameplay
│   │   │   ├── leaderboard/     # Leaderboard page
│   │   │   └── sandbox/         # Free-form sandbox mode
│   │   ├── components/          # React components
│   │   │   ├── TrafficVisualizer.tsx
│   │   │   ├── WAFConfigPanel.tsx
│   │   │   ├── AttackSelector.tsx
│   │   │   └── ScoreBoard.tsx
│   │   ├── lib/                 # Utilities and helpers
│   │   │   ├── api.ts           # API client
│   │   │   └── types.ts         # TypeScript types
│   │   └── hooks/               # Custom React hooks
│   ├── public/                  # Static assets
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── package.json
└── backend/                      # Node.js Simulation Engine
    ├── src/
    │   ├── engines/             # Core simulation engines
    │   │   ├── waf-inspector.ts      # WAF rule evaluation
    │   │   ├── bot-challenge.ts     # Bot detection logic
    │   │   ├── traffic-generator.ts # Attack traffic simulation
    │   │   └── rate-limiter.ts      # Rate limiting algorithms
    │   ├── scenarios/           # Scenario definitions
    │   │   ├── owasp.ts         # OWASP Top 10 scenarios
    │   │   ├── bot-mitigation.ts # Bot defense scenarios
    │   │   ├── ddos.ts          # DDoS mitigation scenarios
    │   │   └── ai-traffic.ts    # AI/LLM security scenarios
    │   ├── routes/              # API route handlers
    │   │   ├── scenarios.ts
    │   │   ├── simulation.ts
    │   │   └── leaderboard.ts
    │   ├── types/               # Shared TypeScript types
    │   └── server.ts            # Fastify server entry point
    ├── tests/                   # Backend tests
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20 or higher
- **npm** or **pnpm** or **yarn**
- **Docker** (optional, for containerized deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/suv27/Layer7-Siege.git
   cd layer7-siege
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start the development servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will start on `http://localhost:3001`
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will start on `http://localhost:3000`

4. **Open your browser**
   Navigate to `http://localhost:3000` to start using Layer7 Siege

### Docker Deployment (Recommended for Production)

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

## 🎮 Scenario Modules

### 1. OWASP Top 10 & API Security
- **SQL Injection (SQLi):** Detect and block malicious SQL payloads in query parameters
- **Cross-Site Scripting (XSS):** Identify and sanitize script injection attempts
- **Broken Object Level Authorization (BOLA):** Prevent unauthorized access to user resources
- **JWT Tampering:** Validate JWT signatures and detect token manipulation

### 2. Bot & Automation Defense
- **Headless Browser Detection:** Identify automated browsers lacking human interaction patterns
- **Credential Stuffing:** Block repeated login attempts with stolen credentials
- **Stealth AI Scraping:** Detect sophisticated AI crawlers mimicking human behavior
- **Challenge Configuration:** Implement CAPTCHA and JavaScript challenges

### 3. DDoS & Rate Limiting
- **Slowloris Attacks:** Mitigate slow HTTP connection exhaustion
- **High-Volume API Hammering:** Implement adaptive rate limiting for endpoints like `/search`
- **Burst Protection:** Configure thresholds for traffic spikes
- **IP Reputation Scoring:** Block requests from known malicious IPs

### 4. LLM / AI Traffic Security
- **Prompt Injection:** Detect and block malicious prompts targeting AI models
- **Model Denial-of-Wallet:** Prevent API token exhaustion attacks
- **AI Endpoint Abuse:** Protect AI APIs from automated exploitation
- **Data Exfiltration:** Block attempts to extract training data or model weights

## 🏆 Gamification Features

- **XP Progression:** Earn experience points for completing scenarios
- **Defense Efficiency Score:** Balance attack blocking with low false-positive rates
- **Real-time Challenges:** Dynamic scenarios that adapt to your skill level
- **Leaderboards:** Compete with other security engineers globally
- **Skill Badges:** Unlock badges for mastering specific security domains

## 🔒 Security Considerations

Layer7 Siege is designed with security as a core principle:

- **Simulation Only:** All attacks are simulated in-memory - no real malicious traffic is generated
- **No External Dependencies:** The simulation engine is self-contained
- **Safe for Corporate Networks:** Can be run safely in enterprise environments
- **Educational Focus:** Designed for learning, not for actual penetration testing
- **Open Source:** Fully auditable codebase for transparency

## 🚢 Deployment Options

### Development
- Local Node.js servers (frontend on port 3000, backend on port 3001)

### Production
- **Docker Containers:** Deploy with Docker Compose or Kubernetes
- **Cloud Platforms:** 
  - AWS ECS/Fargate
  - Google Cloud Run
  - Azure Container Instances
- **Static Frontend:** Deploy Next.js frontend to Vercel, Netlify, or AWS CloudFront
- **Backend API:** Deploy Node.js backend to any Node.js hosting platform

### Environment Variables

Create a `.env` file in both `frontend/` and `backend/` directories:

**Backend (.env):**
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (TypeScript, Prettier)
- Write tests for new features
- Update documentation as needed
- Ensure all scenarios are educational and safe

## 📚 Documentation

- [Architecture Documentation](docs/architecture.md) - Detailed technical architecture
- [Scenario Definitions](docs/scenarios.md) - Complete scenario catalog and learning paths
- [Deployment Guide](docs/deployment.md) - Production deployment instructions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OWASP for the OWASP Top 10 framework
- The security community for inspiration and best practices
- Open source contributors who make tools like Fastify and Next.js possible

## 📞 Support

- **Issues:** Open an issue on GitHub for bugs or feature requests
- **Discussions:** Use GitHub Discussions for questions and ideas
- **Documentation:** Check the [docs/](docs/) folder for detailed guides

---

**Built with ❤️ for the security community**
