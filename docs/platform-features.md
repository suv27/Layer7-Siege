# Platform Feature Guide

Layer7 Siege now exposes a platform layer around the simulation engine. The first release is intentionally in-memory so the workflows are usable and testable without requiring credentials or a database during local development.

## Feature Map

1. **Interactive WAF rule builder:** `RuleBuilder` creates, edits, enables, disables, and removes rules with AND conditions.
2. **Real-time attack visualizer:** `TrafficVisualizer` consumes the simulation SSE stream and displays live request outcomes.
3. **Profiles and saved game state:** `GET/POST /api/profile` stores XP, rank, completed scenarios, and saved rules in the running service.
4. **Scenario test vectors:** `POST /api/scenario-tests` checks the current rules against attack and benign patterns before a run.
5. **Forensic reports:** `GET /api/reports/:simulationId` returns score data and per-request matched-rule findings; the workbench downloads JSON.
6. **Scenario studio:** `POST /api/custom-scenarios` stores author-created scenarios and `GET /api/custom-scenarios` lists them.
7. **Live logs:** simulation traffic is recorded by the platform log stream and exposed through `GET /api/logs`.
8. **AI security playground:** `POST /api/ai/evaluate` evaluates prompt-injection markers against an adjustable sensitivity value.
9. **Team leaderboard:** `POST /api/teams` creates a team and `GET /api/teams` returns score-sorted teams.
10. **Remediation hints:** `GET /api/hints/:scenarioId?failures=3` unlocks contextual guidance after repeated failures.

## Persistence Boundary

Profiles, teams, custom scenarios, logs, and archived simulations currently live in process memory. They reset when the backend restarts. This keeps the MVP portable and makes the API contracts ready for a later PostgreSQL/authentication adapter without coupling the learning workflows to deployment infrastructure.

## Verification

The backend integration suite covers the platform API contracts. The repository E2E smoke test starts both services and verifies health, scenarios, frontend rendering, profiles, AI guardrails, teams, and hints:

```bash
bash scripts/e2e-smoke.sh
```