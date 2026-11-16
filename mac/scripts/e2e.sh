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

# What macOS itself lists as keeping this Mac awake. Saved with the outputs and printed as a note:
# the wording of pmset differs between macOS versions, so the pass or fail is the app's own state.
awake_note() { # name
  pmset -g assertions > "$OUT/pmset-$1.txt" 2>&1 || true
  local lines
  lines="$(grep -E "Samwise check-in alarm is on screen|A Samwise check-in is near" "$OUT/pmset-$1.txt" | sed -E 's/^[[:space:]]+//' | head -3 | tr '\n' '|')"
  if [ -n "$lines" ]; then say "note  macOS lists it ($1): $lines"; else say "note  macOS lists no Samwise sleep assertion ($1)"; fi
}

# ───────────────────────── 1. No account: 16:00 on this Mac's clock ─────────────────────────
say "== 1. No account, check-in at 16:00 =="
S1="$WORK/s1"
P1="$(launch "$S1" "${TODAY}T15:55:30Z" --mute)"
expect "small countdown five minutes before" "$S1" desired headsUp 20
shot 01-heads-up
expect "the Mac is kept from falling asleep before the check-in" "$S1" awake 1
awake_note before
cmd "$S1" "advance:215"
expect "screen taken one minute before" "$S1" desired takeover
expect "and its screen is kept on while the alarm is up" "$S1" awake 2
awake_note alarm
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
expect "by then the Mac may fall asleep on its own again" "$S1" awake 0
awake_note after
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
  "checkins": [{"time": "16:00", "journal_url": "https://example.com/journal?tab=t.midday", "words": [
    {"title": "", "body": "I do this every day because the afternoon is where I lose the thread. Ten minutes here and the rest of the day is mine.\n\nOne clear thing done before dinner. A walk. A real conversation."}
  ]}],
  "journal_url": "https://example.com/journal",
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
P4="$(launch "$S4" "${TODAY}T20:55:30Z" --mute --api-base http://127.0.0.1:8787)"
expect "starts without an account" "$S4" paired False 20
cmd "$S4" "pairverify:+15550100000,000000"
expect "a wrong code is refused" "$S4" hook_result "pairverify:problem"
cmd "$S4" "pairverify:+15550100000,123456"
expect "the right code connects this Mac" "$S4" paired True
expect "the account's name arrives" "$S4" name Alex
expect "16:00 Bogota: small countdown" "$S4" desired headsUp
expect_contains "the menu shows the account's time and place" "$S4" next "16:00 (Bogota)"
shot 20-heads-up-connected
cmd "$S4" "advance:215"
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
expect_contains "and opens the journal at the tab for this check-in" "$S4" opened "tab=t.midday"
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
for kind in paired shown fired committed call_missed_seen done task_done; do
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
expect_contains "the menu names tomorrow's check-in, not the one that is done" "$S5" next "tomorrow 16:00 (Bogota)"
cmd "$S5" "advance:120"
sleep 4
expect "so at 16:00 the screen is left alone" "$S5" desired idle
expect "no alarm window" "$S5" takeover False
stop "$S5" "$P5"

# ───────────────────────── 5a. Counted during the last minute ─────────────────────────
say "== 5a. The check-in is counted while the countdown is on screen =="
write_config false null false false
S5A="$WORK/s5a"
mkdir -p "$S5A"
printf 'test-token' > "$S5A/token"
P5A="$(launch "$S5A" "${TODAY}T20:59:02Z" --mute --api-base http://127.0.0.1:8787)"
expect "the countdown has the screen before 16:00" "$S5A" kind countdown 20
write_config true '"entry"' false false
cmd "$S5A" "poll"
expect "it ends on its own when Samwise counts the check-in" "$S5A" desired idle 20
expect "the after-check-in card opens" "$S5A" windows True
expect_contains "the card names tomorrow's check-in, not the one that just ended" "$S5A" after_next "tomorrow 16:00 (Bogota)"
expect_contains "and so does the menu" "$S5A" next "tomorrow 16:00 (Bogota)"
shot 26-after-check-in-early
stop "$S5A" "$P5A"

# ───────────────────────── 5b. A check-in comes near on a quiet Mac ─────────────────────────
say "== 5b. Asking Samwise again when a check-in comes near =="
write_config false null false false
asked() { if [ -f "$M/gets.log" ]; then wc -l < "$M/gets.log" | tr -d ' '; else echo 0; fi; }
S5B="$WORK/s5b"
mkdir -p "$S5B"
printf 'test-token' > "$S5B/token"
rm -f "$M/gets.log"
P5B="$(launch "$S5B" "${TODAY}T20:40:00Z" --mute --api-base http://127.0.0.1:8787)"
expect "connected from the saved token, twenty minutes before the check-in" "$S5B" paired True 20
sleep 6
BEFORE="$(asked)"
if [ "$BEFORE" -ge 1 ] && [ "$BEFORE" -le 2 ]; then say "PASS  far from a check-in it asks Samwise once and then stays quiet ($BEFORE)"; else say "FAIL  far from a check-in it asked Samwise $BEFORE times in 6 seconds"; FAILS=$((FAILS + 1)); fi
cmd "$S5B" "advance:780"
i=0
while [ "$(asked)" -le "$BEFORE" ] && [ "$i" -lt 12 ]; do sleep 1; i=$((i + 1)); done
AFTER="$(asked)"
if [ "$AFTER" -gt "$BEFORE" ]; then say "PASS  seven minutes before the check-in it asks Samwise again, without waiting out the quiet 15 minutes"; else say "FAIL  seven minutes before the check-in it did not ask Samwise again ($AFTER requests)"; FAILS=$((FAILS + 1)); fi
sleep 5
LATER="$(asked)"
if [ "$LATER" -le $((AFTER + 1)) ]; then say "PASS  and then keeps to one request every 30 seconds ($LATER)"; else say "FAIL  it asked Samwise $((LATER - AFTER)) more times within 5 seconds"; FAILS=$((FAILS + 1)); fi
expect "no alarm yet, seven minutes before" "$S5B" desired idle
stop "$S5B" "$P5B"
kill "$MOCK" 2>/dev/null || true

# ───────────────────────── 6. Over a full-screen app ─────────────────────────
say "== 6. Over a full-screen app =="
NOTE="$WORK/working.txt"
echo "Deep in work. This window is full screen." > "$NOTE"
open -a TextEdit "$NOTE"
sleep 4
osascript -e 'tell application "System Events" to tell process "TextEdit" to set value of attribute "AXFullScreen" of window 1 to true' >/dev/null 2>&1
sleep 4
FULL="$(osascript -e 'tell application "System Events" to tell process "TextEdit" to get value of attribute "AXFullScreen" of window 1' 2>/dev/null)"
say "note  TextEdit is full screen: ${FULL:-unknown}"
shot 30-full-screen-app-before
S6="$WORK/s6"
P6="$(launch "$S6" "${TODAY}T15:59:30Z" --mute)"
expect "the alarm takes the screen over a full-screen app" "$S6" desired takeover 20
expect "and it has the keyboard there" "$S6" keyboard True
shot 31-over-full-screen-app
keys "$S6" "i am doing my check-in now" desired inProgress
expect "typing the line gives the screen back" "$S6" desired inProgress
sleep 2
FRONT="$(osascript -e 'tell application "System Events" to get name of first process whose frontmost is true' 2>/dev/null)"
if [ "$FRONT" = "TextEdit" ]; then say "PASS  the app you were working in is in front again"; else say "note  app in front after the alarm: ${FRONT:-unknown}"; fi
LEAK="$(osascript -e 'tell application "TextEdit" to get text of document 1' 2>/dev/null)"
case "$LEAK" in
  *"doing my"*) say "FAIL  typed letters leaked into the app underneath"; FAILS=$((FAILS + 1)) ;;
  *"Deep in work"*) say "PASS  nothing typed on the alarm reached the app underneath" ;;
  *) say "note  could not read the document underneath to check for leaked letters" ;;
esac
shot 32-back-to-work
stop "$S6" "$P6"
osascript -e 'tell application "TextEdit" to quit saving no' >/dev/null 2>&1 || true
sleep 1
pkill -x TextEdit 2>/dev/null || true

# ───────────────────────── 7. Screenshots and screen sharing ─────────────────────────
say "== 7. Screen capture =="
S7="$WORK/s7"
mkdir -p "$S7"
TZ=UTC "$BIN" --no-agent --state-dir "$S7" --test-hooks --no-welcome --mute --fake-now "${TODAY}T15:59:30Z" >> "$S7/stderr.log" 2>&1 &
P7=$!
expect "the alarm is on screen (capture not allowed this time)" "$S7" desired takeover 20
shot 33-what-a-screen-recording-sees
cmd "$S7" "type:i choose to skip this check-in"
expect "skip clears it" "$S7" desired idle
stop "$S7" "$P7"

# ───────────────────────── 8. One-line install, kept running by macOS ─────────────────────────
say "== 8. Installed in Applications and kept running by macOS =="
# This part replaces the Samwise in Applications and its saved state, so it only runs on a build
# machine (CI=true) or when asked for by name. On a person's own Mac it is skipped.
if [ "${CI:-}" != "true" ] && [ "${SAMWISE_E2E_INSTALL:-}" != "1" ]; then
  say "note  skipped on this Mac: it would replace your installed Samwise and its settings (set SAMWISE_E2E_INSTALL=1 to run it anyway)"
else
VERSION="$(cat VERSION)"
DMG="$PWD/$OUT/Samwise-$VERSION.dmg"
HOMEDIR="$HOME/Library/Application Support/Samwise"
LABEL="life.samwise.mac"
DOMAIN="gui/$(id -u)"
rm -rf "$HOMEDIR"
mkdir -p "$HOMEDIR"
# Welcome already done, sound off, and a check-in a few minutes from now on this Mac's real clock.
AT="$(date -v+3M -v+30S +%H:%M)"
cat > "$HOMEDIR/state.json" <<JSON
{"welcomed": true, "settings": {"localTimes": ["$AT"], "keepRunning": true, "sound": "off"}}
JSON
launchctl setenv SAMWISE_FLAGS "--test-hooks --allow-capture --mute"
if SAMWISE_DMG_URL="file://$DMG" bash ../public/mac/install.sh > "$WORK/install.log" 2>&1; then
  say "PASS  the one-line installer ran"
else
  say "FAIL  the one-line installer failed: $(tail -3 "$WORK/install.log" | tr '\n' ' ')"
  FAILS=$((FAILS + 1))
fi
if [ -d "/Applications/Samwise.app" ]; then say "PASS  Samwise.app is in Applications"; else say "FAIL  Samwise.app is not in Applications"; FAILS=$((FAILS + 1)); fi
expect "macOS runs the kept-alive copy" "$HOMEDIR" launchd True 40
sleep 4
COUNT="$(pgrep -x Samwise | wc -l | tr -d ' ')"
if [ "$COUNT" = "1" ]; then say "PASS  exactly one copy is running"; else say "FAIL  $COUNT copies are running"; FAILS=$((FAILS + 1)); fi
if launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; then say "PASS  the keep-running agent is loaded"; else say "FAIL  the keep-running agent is not loaded"; FAILS=$((FAILS + 1)); fi
expect "the real clock brings the small countdown" "$HOMEDIR" desired headsUp 90
shot 34-installed-heads-up
expect "and one minute before the time, the alarm" "$HOMEDIR" desired takeover 240
shot 35-installed-alarm
OLD="$(status "$HOMEDIR" pid)"
kill -9 "$OLD" 2>/dev/null
rm -f "$HOMEDIR/status.json"
expect "killed with the alarm up: macOS reopens it and the alarm is back" "$HOMEDIR" desired takeover 60
NEW="$(status "$HOMEDIR" pid)"
if [ -n "$NEW" ] && [ "$NEW" != "$OLD" ]; then say "PASS  it is a new process started by macOS"; else say "FAIL  no new process after the kill"; FAILS=$((FAILS + 1)); fi
cmd "$HOMEDIR" "type:i choose to skip this check-in"
expect "the skip line still clears it" "$HOMEDIR" desired idle
cmd "$HOMEDIR" "keeprunning:off"
expect "turning Keep running off leaves a plain copy" "$HOMEDIR" launchd False 40
sleep 3
if launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; then say "FAIL  the agent is still loaded after turning it off"; FAILS=$((FAILS + 1)); else say "PASS  the agent is gone after turning it off"; fi
if [ -f "$HOME/Library/LaunchAgents/$LABEL.plist" ]; then say "FAIL  the agent file is still there"; FAILS=$((FAILS + 1)); else say "PASS  the agent file is removed"; fi
COUNT="$(pgrep -x Samwise | wc -l | tr -d ' ')"
if [ "$COUNT" = "1" ]; then say "PASS  one plain copy keeps running"; else say "FAIL  $COUNT copies are running after turning it off"; FAILS=$((FAILS + 1)); fi
cmd "$HOMEDIR" "quit"
sleep 3
pkill -x Samwise 2>/dev/null || true
launchctl unsetenv SAMWISE_FLAGS
cp "$HOMEDIR/samwise.log" "$OUT/s8.app.log" 2>/dev/null || true
cp "$WORK/install.log" "$OUT/s8.install.log" 2>/dev/null || true
fi

# Keep the app's own logs with the results (they hold no personal data).
for d in s1 s2 s3 s4 s5 s6 s7; do
  [ -f "$WORK/$d/samwise.log" ] && cp "$WORK/$d/samwise.log" "$OUT/$d.app.log"
  [ -f "$WORK/$d/stderr.log" ] && cp "$WORK/$d/stderr.log" "$OUT/$d.stderr.log"
done
[ -f "$M/requests.jsonl" ] && cp "$M/requests.jsonl" "$OUT/mock-requests.jsonl"

say "== $FAILS failed =="
[ "$FAILS" -eq 0 ]
