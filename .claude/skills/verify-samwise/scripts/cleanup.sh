#!/usr/bin/env bash
# Stop only the instance launch-local.sh started (by its recorded process group). Evidence is never touched.
REPO="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"; STATE="$REPO/.verify-run"
[ -d "$STATE" ] || { echo "nothing to clean"; exit 0; }
EVID=$(cat "$STATE/evidence" 2>/dev/null)
if [ -f "$STATE/pid" ]; then
  PID=$(cat "$STATE/pid")
  if kill -0 "$PID" 2>/dev/null; then
    kill -TERM -- "-$PID" 2>/dev/null || kill -TERM "$PID"
    for i in $(seq 1 10); do kill -0 "$PID" 2>/dev/null || break; sleep 1; done
    kill -0 "$PID" 2>/dev/null && kill -KILL -- "-$PID" 2>/dev/null
  fi
  echo "stopped pid $PID"
fi
[ -n "$EVID" ] && [ -f "$STATE/server.log" ] && cp "$STATE/server.log" "$EVID/server.log"
rm -rf "$STATE"
# next dev rewrites next-env.d.ts on start; put the committed version back so the run leaves no diff.
git -C "$REPO" diff --quiet -- next-env.d.ts || git -C "$REPO" checkout -- next-env.d.ts
[ -n "$EVID" ] && { echo "evidence kept at $EVID:"; ls "$EVID"; }
