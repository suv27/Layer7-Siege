# Testing Guide

## Unit and API Tests

The backend uses Jest with `ts-jest`. Tests cover rule evaluation and the scenario API routes.

```bash
cd backend
npm install
npm test
```

To run only the scenario API integration tests:

```bash
npm run test:integration
```

## Build Checks

Compile the backend and build the frontend before opening a pull request:

```bash
cd backend && npm run build
cd ../frontend && npm run build
```

The frontend also includes a focused hydration-boundary regression check:

```bash
cd frontend
npm run test:hydration
```

## End-to-End Smoke Test

From the repository root, run:

```bash
bash scripts/e2e-smoke.sh
```

The script starts both development servers, waits for `GET /health` and `/scenarios`, verifies that the API returns the registered OWASP and bot scenarios, and checks that the frontend scenario page is served. It stops both child processes when it exits.