#!/usr/bin/env bash
# Read-only: is the local verify instance worth driving, and which remote targets can this machine reach?
REPO="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"; STATE="$REPO/.verify-run"
echo "repo HEAD: $(git -C "$REPO" rev-parse --short HEAD) ($(git -C "$REPO" branch --show-current))"
if [ -f "$STATE/pid" ]; then
  PID=$(cat "$STATE/pid"); URL=$(cat "$STATE/url"); PORT=${URL##*:}
  if kill -0 "$PID" 2>/dev/null; then echo "local: pid $PID alive"; else echo "local: pid $PID DEAD (run cleanup.sh, then launch-local.sh)"; fi
  LPID=$( (fuser "$PORT/tcp" 2>/dev/null || lsof -t -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null) | tr -s ' ' '\n' | grep -m1 '[0-9]')
  if [ -n "$LPID" ] && [ "$(ps -o pgid= -p "$LPID" | tr -d ' ')" = "$PID" ]; then echo "local: port $PORT owned by our process group ($LPID)"
  else echo "local: port $PORT NOT owned by our instance (listener pid: ${LPID:-none}); do not drive it"; fi
  CODE=$(curl -s -o /tmp/verify-doctor.html -w '%{http_code}' "$URL/v2/signup")
  grep -q 'id="phone"' /tmp/verify-doctor.html && echo "local: /v2/signup $CODE, form rendered" || echo "local: /v2/signup $CODE, form NOT rendered"
  echo "local: evidence dir $(cat "$STATE/evidence" 2>/dev/null)"
else
  echo "local: no instance (launch-local.sh starts one)"
fi
# Direct network from this shell. In the Claude cloud container all three were refused on 2026-11-15:
# then production is reached only through MCP tools (Vercel web_fetch_vercel_url, Neon run_sql, n8n, WhatsApp).
for u in https://www.samwise.life/v2/signup https://samuelgiraldoconcha.app.n8n.cloud/healthz https://console.neon.tech; do
  printf 'net: %-55s %s\n' "$u" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 "$u")"
done
