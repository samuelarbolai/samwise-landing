#!/usr/bin/env bash
# Start samwise-landing locally (next dev) for UI verification. Prints the base URL.
# Usage: launch-local.sh [run-name]      e.g. launch-local.sh signup-validation
# State goes to .verify-run/ (gitignored scratch); evidence dir is printed for drive-page.mjs.
set -euo pipefail
REPO="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
RUN_NAME="${1:-local}"
STATE="$REPO/.verify-run"
mkdir -p "$STATE"
if [ -f "$STATE/pid" ] && kill -0 "$(cat "$STATE/pid")" 2>/dev/null; then
  echo "A verify instance is already running (pid $(cat "$STATE/pid"), $(cat "$STATE/url")). Run cleanup.sh first or reuse it." >&2
  exit 1
fi
cd "$REPO"
[ -d node_modules ] || pnpm install --frozen-lockfile >"$STATE/install.log" 2>&1
# Pick a free port from 3100 up, so we never drive someone else's :3000.
PORT=3100
while (exec 3<>/dev/tcp/127.0.0.1/$PORT) 2>/dev/null; do PORT=$((PORT+1)); done
# Local runs never get production secrets. DATABASE_URL is a dead local address on purpose:
# any route that reaches Neon fails loudly instead of writing to the production database.
SESSION_SECRET="verify-local-$(date +%s)" \
DATABASE_URL="postgresql://verify:verify@127.0.0.1:1/verify" \
NEXT_TELEMETRY_DISABLED=1 \
  setsid nohup pnpm exec next dev -p "$PORT" >"$STATE/server.log" 2>&1 &
echo $! >"$STATE/pid"
echo "http://localhost:$PORT" >"$STATE/url"  # localhost, not 127.0.0.1: next dev blocks dev resources for other origins and the page never hydrates
EVID="${VERIFY_EVIDENCE_ROOT:-/mnt/project-files/verification}/$(date -u +%Y-%m-%d)-$RUN_NAME"
mkdir -p "$EVID"; echo "$EVID" >"$STATE/evidence"
# Ready = the sign-up page actually renders, not just "port open" (first compile takes ~10-40 s).
for i in $(seq 1 90); do
  if curl -sf "http://localhost:$PORT/v2/signup" 2>/dev/null | grep -q 'id="phone"'; then
    echo "READY $(cat "$STATE/url")  evidence=$EVID"; exit 0
  fi
  kill -0 "$(cat "$STATE/pid")" 2>/dev/null || { echo "next dev exited; see $STATE/server.log" >&2; tail -20 "$STATE/server.log" >&2; exit 1; }
  sleep 2
done
echo "Not ready after 180 s; see $STATE/server.log" >&2; exit 1
