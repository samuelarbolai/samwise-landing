#!/bin/bash
# End-to-end check on a real Mac. Launches the built app with a pretend clock and walks it through
# an afternoon: countdown, takeover, typing the line, snooze, follow-up, skip, missed call, done.
# Every step waits for the app's own status file and takes a screenshot. All account data is made up.
set -uo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-build}"
BIN="$PWD/$OUT/Samwise.app/Contents/MacOS/Samwise"
SHOTS="$PWD/$OUT/shots"
RESULT="$PWD/$OUT/e2e.txt"
WORK="$(mktemp -d)"
mkdir -p "$SHOTS"
: > "$RESULT"
FAILS=0
REAL_KEYS=unknown
TODAY="$(date -u +%Y-%m-%d)"
ID="${TODAY}T16:00"

say() { echo "$*" | tee -a "$RESULT"; }

status() { # dir key
  python3 - "$1/status.json" "$2" <<'PY' 2>/dev/null
import json, sys
try:
    d = json.load(open(sys.argv[1]))
except Exception:
    print("")
    sys.exit(0)
v = d
for part in sys.argv[2].split("."):
    v = v.get(part, "") if isinstance(v, dict) else ""
print(v)
PY
}

wait_for() { # dir key value seconds
  local i=0
  while [ "$i" -lt "${4:-15}" ]; do
    [ "$(status "$1" "$2")" = "$3" ] && return 0
    sleep 1
    i=$((i + 1))
  done
  return 1
}

expect() { # label dir key value [seconds]
  if wait_for "$2" "$3" "$4" "${5:-15}"; then
    say "PASS  $1"
  else
    say "FAIL  $1 (wanted $3=$4, got '$(status "$2" "$3")')"
    FAILS=$((FAILS + 1))
  fi
}

expect_contains() { # label dir key text
  local i=0 got=""
  while [ "$i" -lt 12 ]; do
    got="$(status "$2" "$3")"
    case "$got" in *"$4"*) say "PASS  $1"; return 0 ;; esac
    sleep 1
    i=$((i + 1))
  done
  say "FAIL  $1 (wanted $3 to contain '$4', got '$got')"
  FAILS=$((FAILS + 1))
}

shot() { sleep 1.3; screencapture -x "$SHOTS/$1.png" 2>/dev/null || say "note  screenshot $1 not taken"; }
cmd() { echo "$2" >> "$1/commands.txt"; }

# Types with real key presses when this Mac allows it; otherwise through the app's test hook.
keys() { # dir text status-key expected-value
  if [ "$REAL_KEYS" != "no" ]; then
    osascript -e "tell application \"System Events\" to keystroke \"$2\"" >/dev/null 2>&1
    if wait_for "$1" "$3" "$4" 6; then
      REAL_KEYS=yes
      return 0
    fi
    if [ "$REAL_KEYS" = "unknown" ]; then
      REAL_KEYS=no
      say "note  real key presses are not available on this Mac; typing goes through the test hook"
    else
      say "note  one real key press attempt did not land; repeating through the test hook"
    fi
    cmd "$1" "key:esc"
    sleep 2
  fi
  cmd "$1" "type:$2"
}

launch() { # dir fake-now [extra args...]
  local dir="$1" now="$2"
  shift 2
  mkdir -p "$dir"
  TZ=UTC "$BIN" --no-agent --state-dir "$dir" --allow-capture --test-hooks --no-welcome --fake-now "$now" "$@" >> "$dir/stderr.log" 2>&1 &
  echo $!
}

stop() { # dir pid
  cmd "$1" "quit"
  local i=0
  while kill -0 "$2" 2>/dev/null && [ "$i" -lt 8 ]; do sleep 1; i=$((i + 1)); done
  kill -9 "$2" 2>/dev/null || true
}

# ───────────────────────── 1. No account: 16:00 on this Mac's clock ─────────────────────────
say "== 1. No account, check-in at 16:00 =="
S1="$WORK/s1"
P1="$(launch "$S1" "${TODAY}T15:54:30Z" --mute)"
expect "small countdown five minutes before" "$S1" desired headsUp 20
shot 01-heads-up
cmd "$S1" "advance:275"
expect "screen taken one minute before" "$S1" desired takeover
expect "it is the countdown" "$S1" kind countdown
expect "the alarm has the keyboard" "$S1" keyboard True
shot 02-countdown
cmd "$S1" "advance:60"
expect "at 16:00 it says it is time" "$S1" kind ringing
expect_contains "no phone call is promised without an account" "$S1" subtitle "Do your check-in now"
shot 03-ringing
keys "$S1" "i am doing" typed iamdoing
expect "typed letters are taken" "$S1" typed iamdoing
shot 04-typing
cmd "$S1" "type:zzz"
sleep 2
expect "letters that do not belong are refused" "$S1" typed iamdoing
cmd "$S1" "key:esc"
expect "Esc clears the line" "$S1" typed ""
cmd "$S1" "snooze"
expect "snooze gives five minutes" "$S1" desired snoozed
shot 05-snoozed
cmd "$S1" "advance:301"
expect "after the snooze the screen is taken again" "$S1" desired takeover
expect "and it says the check-in is waiting" "$S1" kind late
shot 06-late
keys "$S1" "I am doing my check-in now" desired inProgress
expect "typing the line gives the screen back" "$S1" desired inProgress
expect "the alarm is off the screen" "$S1" takeover False
shot 07-in-progress
cmd "$S1" "advance:901"
expect "15 minutes later it asks if the check-in is finished" "$S1" ask True
shot 08-did-you-finish
cmd "$S1" "advance:601"
expect "no answer for 10 minutes takes the screen again" "$S1" kind followUp
shot 09-follow-up
keys "$S1" "i choose to skip this check-in" desired idle
expect "typing the skip line always clears the screen" "$S1" desired idle
expect "the check-in is marked skipped" "$S1" "phases.$ID" skipped
shot 10-skipped
cmd "$S1" "test"
expect "the test alarm takes the screen" "$S1" kind test
shot 11-test
cmd "$S1" "finish"
expect "ending the test clears the screen" "$S1" desired idle
cmd "$S1" "show:welcome"
expect "welcome window opens" "$S1" windows True
shot 12-welcome
cmd "$S1" "show:settings"
shot 13-settings
cmd "$S1" "show:pair"
shot 14-connect
cmd "$S1" "show:pause"
shot 15-pause
stop "$S1" "$P1"
say "keys  real key presses: $REAL_KEYS"

# ───────────────────────── 2. Restart and crash guard ─────────────────────────
say "== 2. Restarts while the alarm is on screen =="
S2="$WORK/s2"
P2="$(launch "$S2" "${TODAY}T15:59:30Z" --mute)"
expect "the alarm is on screen" "$S2" desired takeover
kill -9 "$P2" 2>/dev/null
sleep 1
rm -f "$S2/status.json"
P2="$(launch "$S2" "${TODAY}T16:00:20Z" --mute)"
expect "after the app is killed and reopened, the alarm is back" "$S2" desired takeover 20
expect "and it now says it is time" "$S2" kind ringing
kill -9 "$P2" 2>/dev/null
sleep 1
P2="$(launch "$S2" "${TODAY}T16:00:30Z" --mute)"
sleep 4
kill -9 "$P2" 2>/dev/null
sleep 1
rm -f "$S2/status.json"
P2="$(launch "$S2" "${TODAY}T16:00:40Z" --mute)"
expect "after three restarts the alarm lets go (a bug can never lock the Mac)" "$S2" desired idle 20
expect "that check-in is closed" "$S2" "phases.$ID" skipped
stop "$S2" "$P2"

# ───────────────────────── 3. Sound path (no --mute) ─────────────────────────
say "== 3. Sound =="
S3="$WORK/s3"
P3="$(launch "$S3" "${TODAY}T15:59:30Z")"
expect "the alarm is on screen" "$S3" desired takeover
cmd "$S3" "advance:40"
expect "at 16:00 it rings" "$S3" kind ringing
sleep 4
if kill -0 "$P3" 2>/dev/null; then say "PASS  the app keeps running with sound on"; else say "FAIL  the app died with sound on"; FAILS=$((FAILS + 1)); fi
say "note  ring playing on this Mac: $(status "$S3" sound)"
cmd "$S3" "type:i choose to skip this check-in"
expect "skip works while ringing" "$S3" desired idle
stop "$S3" "$P3"

# ───────────────────────── 4. Connected account (stand-in server, made-up data) ─────────────────────────
say "== 4. Connected to a Samwise account =="
M="$WORK/mock"
mkdir -p "$M"
write_config() { # done done_source call_placed call_missed
  cat > "$M/config.json" <<JSON
{
  "user": {"first_name": "Alex", "language": "en", "timezone": "America/Bogota"},
  "checkins": [{"time": "16:00", "words": [
    {"title": "Why I do this", "body": "I do this every day because the afternoon is where I lose the thread. Ten minutes here and the rest of the day is mine."},
    {"title": "What I want today", "body": "One clear thing done before dinner. A walk. A real conversation."}
  ]}],
  "slots": [{"id": "$ID", "done": $1, "done_source": $2, "will_call": true, "call_placed": $3, "call_missed": $4}],
  "tasks": [{"id": 1, "title": "Call a friend", "detail": "Ask how the week went."}, {"id": 2, "title": "Book the visit", "detail": null}],
  "support": {"active": true, "grace_minutes": 30},
  "samwise_number": "+1 555 010 0199",
  "latest_version": "1.0.0"
}
JSON
}
write_config false null false false
python3 scripts/mock_server.py 8787 "$M" &
MOCK=$!
sleep 1
S4="$WORK/s4"
mkdir -p "$S4"
P4="$(launch "$S4" "${TODAY}T20:54:30Z" --mute --api-base http://127.0.0.1:8787)"
expect "starts without an account" "$S4" paired False 20
cmd "$S4" "pairverify:+15550100000,000000"
expect "a wrong code is refused" "$S4" hook_result "pairverify:problem"
cmd "$S4" "pairverify:+15550100000,123456"
expect "the right code connects this Mac" "$S4" paired True
expect "the account's name arrives" "$S4" name Alex
expect "16:00 Bogota: small countdown" "$S4" desired headsUp
expect_contains "the menu shows the account's time and place" "$S4" next "16:00 (Bogota)"
shot 20-heads-up-connected
cmd "$S4" "advance:275"
expect "screen taken one minute before the call" "$S4" kind countdown
expect_contains "it says Samwise will call the phone" "$S4" subtitle "Samwise calls your phone at 16:00"
shot 21-countdown-connected
cmd "$S4" "advance:60"
expect "at 16:00 it rings" "$S4" kind ringing
expect_contains "it says Samwise is calling now" "$S4" subtitle "Samwise is calling your phone now"
shot 22-ringing-connected
expect "own words stay hidden at first" "$S4" words_shown False
cmd "$S4" "key:tab"
expect "Tab shows the person's own words" "$S4" words_shown True
shot 23-own-words
cmd "$S4" "key:tab"
expect "Tab hides them again" "$S4" words_shown False
cmd "$S4" "type:I am doing my check-in now"
expect "typing the line gives the screen back" "$S4" desired inProgress
write_config false null true true
cmd "$S4" "poll"
expect "a missed call takes the screen again" "$S4" kind missedCall 20
expect_contains "it gives the number and the deadline" "$S4" subtitle "Before 16:30, nobody is told"
shot 24-missed-call
cmd "$S4" "type:I am doing my check-in now"
expect "typing the line gives the screen back again" "$S4" desired inProgress
write_config true '"call"' true false
cmd "$S4" "poll"
expect "when Samwise counts the check-in, the alarm ends on its own" "$S4" desired idle 20
expect "the check-in is marked done" "$S4" "phases.$ID" done
expect "the after-check-in card opens" "$S4" windows True
shot 25-after-check-in
cmd "$S4" "taskdone"
sleep 26
for kind in paired fired committed call_missed_seen done task_done; do
  if grep -q "\"kind\": \"$kind\"" "$M/requests.jsonl" 2>/dev/null; then say "PASS  Samwise was told: $kind"; else say "FAIL  Samwise was not told: $kind"; FAILS=$((FAILS + 1)); fi
done
if grep -q '"path": "/api/mac/tasks/done"' "$M/requests.jsonl" 2>/dev/null; then say "PASS  ticking a task reaches Samwise"; else say "FAIL  ticking a task did not reach Samwise"; FAILS=$((FAILS + 1)); fi
stop "$S4" "$P4"

# ───────────────────────── 5. Already done before the time ─────────────────────────
say "== 5. Check-in already done before 16:00 =="
write_config true '"entry"' false false
S5="$WORK/s5"
mkdir -p "$S5"
printf 'test-token' > "$S5/token"
P5="$(launch "$S5" "${TODAY}T20:58:50Z" --mute --api-base http://127.0.0.1:8787)"
expect "connected from the saved token" "$S5" paired True 20
expect "Samwise already counts today's check-in" "$S5" "phases.$ID" done 20
cmd "$S5" "advance:120"
sleep 4
expect "so at 16:00 the screen is left alone" "$S5" desired idle
expect "no alarm window" "$S5" takeover False
stop "$S5" "$P5"
kill "$MOCK" 2>/dev/null || true

# Keep the app's own logs with the results (they hold no personal data).
for d in s1 s2 s3 s4 s5; do
  [ -f "$WORK/$d/samwise.log" ] && cp "$WORK/$d/samwise.log" "$OUT/$d.app.log"
  [ -f "$WORK/$d/stderr.log" ] && cp "$WORK/$d/stderr.log" "$OUT/$d.stderr.log"
done
[ -f "$M/requests.jsonl" ] && cp "$M/requests.jsonl" "$OUT/mock-requests.jsonl"

say "== $FAILS failed =="
[ "$FAILS" -eq 0 ]
