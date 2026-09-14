#!/usr/bin/env bash
set -euo pipefail

backend_log="${TMPDIR:-/tmp}/layer7-siege-backend.log"
frontend_log="${TMPDIR:-/tmp}/layer7-siege-frontend.log"
backend_port="${BACKEND_PORT:-3101}"
frontend_port="${FRONTEND_PORT:-3100}"

cleanup() {
  kill "$backend_pid" "$frontend_pid" 2>/dev/null || true
  pkill -P "$backend_pid" 2>/dev/null || true
  pkill -P "$frontend_pid" 2>/dev/null || true
}
trap cleanup EXIT

(cd backend && PORT="$backend_port" CORS_ORIGIN="http://localhost:$frontend_port" npm exec -- tsx src/server.ts) >"$backend_log" 2>&1 &
backend_pid=$!
(cd frontend && NEXT_PUBLIC_API_URL="http://localhost:$backend_port" npm run dev -- -p "$frontend_port") >"$frontend_log" 2>&1 &
frontend_pid=$!

wait_for_url() {
  local url="$1"
  for _ in {1..30}; do
    if curl --silent --fail "$url" >/dev/null; then
      return 0
    fi
    sleep 1
  done
  echo "Timed out waiting for $url" >&2
  return 1
}

wait_for_url "http://localhost:$backend_port/health"
wait_for_url "http://localhost:$frontend_port/scenarios"

scenario_response=$(curl --silent --fail "http://localhost:$backend_port/api/scenarios")
echo "$scenario_response" | grep -q 'owasp-sqli-xss-001'
echo "$scenario_response" | grep -q 'bot-scraping-001'

frontend_response=$(curl --silent --fail "http://localhost:$frontend_port/scenarios")
echo "$frontend_response" | grep -q 'Select a Scenario'

echo "E2E smoke test passed: backend health, scenarios API, and frontend route are available."