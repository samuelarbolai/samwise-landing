#!/bin/bash
# Live check on a real Mac against samwise.life, the way a person's Mac meets it:
# the download page, the disk image, the one-line installer, connecting an account, the real
# schedule on the real clock, and what the alarm reports back.
#
# It only ever uses a temporary test account made for this run (made-up name, a phone number that
# cannot exist, no trusted people, so nobody is called or messaged). Its one-time codes come in as
# environment variables and stop working when the run is over:
#   PAIR_CODE   one-time pairing code of the test account (required)
#   TEST_PHONE  the test account's number, and TEST_OTP a 6-digit code waiting for it (both optional:
#               with them the WhatsApp-code way of connecting is checked too)
set -uo pipefail
# It replaces the Samwise in Applications and its saved state, so it only runs on a build machine.
if [ "${CI:-}" != "true" ] && [ "${SAMWISE_LIVE_CHECK:-}" != "1" ]; then
  echo "This check replaces your installed Samwise and its settings. It is meant for a build machine." >&2
  echo "Set SAMWISE_LIVE_CHECK=1 to run it here anyway." >&2
  exit 2
fi
cd "$(dirname "$0")/.."
OUT="${1:-build}"
BASE="${SAMWISE_BASE:-https://www.samwise.life}"
PAIR_CODE="${PAIR_CODE:-}"
TEST_PHONE="${TEST_PHONE:-}"
TEST_OTP="${TEST_OTP:-}"
SHOTS="$PWD/$OUT/shots"
RESULT="$PWD/$OUT/live.txt"
WORK="$(mktemp -d)"
HOMEDIR="$HOME/Library/Application Support/Samwise"
LABEL="life.samwise.mac"
DOMAIN="gui/$(id -u)"
mkdir -p "$SHOTS"
: > "$RESULT"
FAILS=0

say() { echo "$*" | tee -a "$RESULT"; }
pass() { say "PASS  $1"; }
fail() { say "FAIL  $1"; FAILS=$((FAILS + 1)); }
check() { if [ "$2" = "$3" ]; then pass "$1"; else fail "$1 (wanted '$3', got '$2')"; fi; }

status() { # key
  python3 - "$HOMEDIR/status.json" "$1" <<'PY' 2>/dev/null
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
wait_for() { # key value seconds
  local i=0
  while [ "$i" -lt "${3:-15}" ]; do
    [ "$(status "$1")" = "$2" ] && return 0
    sleep 1
    i=$((i + 1))
  done
  return 1
}
wait_for_either() { # key value-a value-b seconds
  local i=0 got=""
  while [ "$i" -lt "${4:-15}" ]; do
    got="$(status "$1")"
    if [ "$got" = "$2" ] || [ "$got" = "$3" ]; then return 0; fi
    sleep 1
    i=$((i + 1))
  done
  return 1
}
expect() { # label key value [seconds]
  if wait_for "$2" "$3" "${4:-15}"; then pass "$1"; else fail "$1 (wanted $2=$3, got '$(status "$2")')"; fi
}
expect_contains() { # label key text [seconds]
  local i=0 got=""
  while [ "$i" -lt "${4:-12}" ]; do
    got="$(status "$2")"
    case "$got" in *"$3"*) pass "$1"; return 0 ;; esac
    sleep 1
    i=$((i + 1))
  done
  fail "$1 (wanted $2 to contain '$3', got '$got')"
}
shot() { sleep 1.3; screencapture -x "$SHOTS/$1.png" 2>/dev/null || say "note  screenshot $1 not taken"; }
cmd() { echo "$1" >> "$HOMEDIR/commands.txt"; }

# One request: prints "<status> <seconds>" and leaves the body in $WORK/body and the headers in $WORK/head.
req() { # method path [json] [token]
  local args=(-s -o "$WORK/body" -D "$WORK/head" -w "%{http_code} %{time_total}" -X "$1" -H "Accept: application/json" --max-time 40)
  [ -n "${3:-}" ] && args+=(-H "Content-Type: application/json" -d "$3")
  [ -n "${4:-}" ] && args+=(-H "Authorization: Bearer $4")
  curl "${args[@]}" "$BASE$2" 2>/dev/null
}
code_of() { echo "$1" | cut -d' ' -f1; }
secs_of() { echo "$1" | cut -d' ' -f2; }
slower_than() { python3 -c "import sys; sys.exit(0 if float(sys.argv[1]) >= float(sys.argv[2]) else 1)" "$1" "$2"; }

# ───────────────────────── A. The site, from this Mac ─────────────────────────
say "== A. samwise.life from this Mac ($BASE) =="
R="$(req GET /mac)"
check "the download page opens" "$(code_of "$R")" 200
cp "$WORK/body" "$WORK/page.html"
if grep -q "A check-in alarm you cannot miss" "$WORK/page.html"; then pass "it is the Samwise for Mac page"; else fail "the page does not show its headline"; fi

BARE="$(curl -s -o /dev/null -L -w "%{http_code} %{url_effective}" --max-time 40 "https://samwise.life/mac" 2>/dev/null)"
case "$BARE" in "200 https://www.samwise.life/mac"*) pass "samwise.life/mac without www lands on the same page" ;; *) fail "samwise.life/mac without www: $BARE" ;; esac

LOC="$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" --max-time 40 "$BASE/download/mac" 2>/dev/null)"
case "$LOC" in "302 $BASE/downloads/Samwise-"*".dmg") pass "the download link points at the disk image" ;; *) fail "the download link answered: $LOC" ;; esac
DL="$(curl -s -L -o "$WORK/Samwise.dmg" -w "%{http_code} %{content_type} %{size_download}" --max-time 120 "$BASE/download/mac" 2>/dev/null)"
say "note  download: $DL"
check "the disk image downloads" "$(echo "$DL" | cut -d' ' -f1)" 200
GOT_SUM="$(shasum -a 256 "$WORK/Samwise.dmg" 2>/dev/null | cut -d' ' -f1)"
if [ -n "$GOT_SUM" ] && grep -q "$GOT_SUM" "$WORK/page.html"; then pass "its SHA-256 is the one printed on the page"; else fail "the page does not print this file's SHA-256 ($GOT_SUM)"; fi
if hdiutil verify -quiet "$WORK/Samwise.dmg" >/dev/null 2>&1; then pass "macOS accepts the disk image"; else fail "hdiutil could not verify the disk image"; fi

R="$(req GET /mac/install.sh)"
check "the installer script is served" "$(code_of "$R")" 200
if head -1 "$WORK/body" | grep -q '^#!/bin/bash' && grep -q 'main "\$@"' "$WORK/body"; then pass "it is the whole script"; else fail "the installer script looks cut off"; fi

R="$(req GET /api/mac/config)"
check "the schedule is refused without a connected Mac" "$(code_of "$R")" 401
if grep -qi '^cache-control: no-store' "$WORK/head"; then pass "answers are marked never to be stored"; else fail "no-store header missing"; fi
R="$(req GET /api/mac/config "" "swm_0000000000000000000000000000000000000000000")"
check "a made-up token is refused" "$(code_of "$R")" 401
R="$(req POST /api/mac/events '{"events":[]}' "swm_0000000000000000000000000000000000000000000")"
check "events from a made-up token are refused" "$(code_of "$R")" 401
R="$(req POST /api/mac/pair/code '{"code":"NOTACODE12"}')"
check "a wrong pairing code is refused" "$(code_of "$R")" 401
R="$(req POST /api/mac/pair/verify '{"phone":"+15550100999","code":"123456"}')"
check "a code for a number without an account is refused" "$(code_of "$R")" 401

# A number with no account gets the same answer as a real one, after the same wait.
R="$(req POST /api/mac/pair/start '{"phone":"+15550100999"}')"
UNKNOWN_SECS="$(secs_of "$R")"
check "asking a code for a number without an account answers like any other" "$(code_of "$R") $(cat "$WORK/body")" '200 {"sent":true}'
if slower_than "$UNKNOWN_SECS" 1.4; then pass "and takes its time (${UNKNOWN_SECS}s), so the wait says nothing"; else fail "answered too fast (${UNKNOWN_SECS}s)"; fi
R="$(req POST /api/mac/pair/start '{"phone":"12"}')"
check "a number that is too short is refused with a reason" "$(code_of "$R")" 400

# ───────────────────────── B. Install with the one line from the page ─────────────────────────
say "== B. The one-line install =="
launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
pkill -x Samwise 2>/dev/null || true
rm -rf "$HOMEDIR" "/Applications/Samwise.app"
mkdir -p "$HOMEDIR"
cat > "$HOMEDIR/state.json" <<JSON
{"welcomed": true, "settings": {"keepRunning": true, "sound": "off"}}
JSON
# The installed copy is started by macOS, so its test flags travel in the environment. No --api-base: it talks to samwise.life.
launchctl setenv SAMWISE_FLAGS "--test-hooks --allow-capture --mute"
if curl -fsSL "$BASE/mac/install.sh" | bash > "$WORK/install.log" 2>&1; then
  pass "curl ... install.sh | bash ran"
else
  fail "the one-line install failed: $(tail -3 "$WORK/install.log" | tr '\n' ' ')"
fi
if [ -d "/Applications/Samwise.app" ]; then pass "Samwise.app is in Applications"; else fail "Samwise.app is not in Applications"; fi
if codesign --verify --deep --strict "/Applications/Samwise.app" >/dev/null 2>&1; then pass "its signature is intact"; else fail "codesign does not accept the installed app"; fi
expect "macOS runs the kept-alive copy" launchd True 40
check "it starts without an account" "$(status paired)" False

# ───────────────────────── C. Connect the test account ─────────────────────────
say "== C. Connecting the test account =="
if [ -z "$PAIR_CODE" ]; then
  fail "no PAIR_CODE given, the rest cannot run"
  say "== $FAILS failed =="
  exit 1
fi

if [ -n "$TEST_PHONE" ] && [ -n "$TEST_OTP" ]; then
  T0="$(date +%s)"
  cmd "pairstart:$TEST_PHONE"
  expect "asking for a WhatsApp code is accepted" hook_result pairstart:ok 30
  say "note  that took $(( $(date +%s) - T0 ))s from the app (a number without an account took ${UNKNOWN_SECS}s)"
  cmd "pairverify:$TEST_PHONE,000000"
  expect "a wrong WhatsApp code is refused" hook_result pairverify:problem 30
  check "and the Mac stays unconnected" "$(status paired)" False
  cmd "pairverify:$TEST_PHONE,$TEST_OTP"
  expect "the right WhatsApp code connects this Mac" hook_result pairverify:ok 30
  expect "connected" paired True
  expect "the account's first name arrives" name Alex
  cmd "disconnect"
  expect "Disconnect this Mac works" paired False
  sleep 3
else
  say "note  WhatsApp-code way not checked in this run (no TEST_PHONE and TEST_OTP)"
fi

cmd "paircode:WRONGCODE9"
expect "a wrong pairing code is refused" hook_result paircode:problem 30
cmd "paircode:$PAIR_CODE"
expect "the pairing code connects this Mac" hook_result paircode:ok 30
expect "connected" paired True
expect "the account's first name arrives" name Alex
expect "the account's after-check-in list arrives" tasks 2
say "note  menu line: $(status next)"
check "no connection problem is shown" "$(status problem)" ""
shot 40-live-connected

# ───────────────────────── D. The real schedule on the real clock ─────────────────────────
say "== D. The account's check-in time, on the real clock =="
if wait_for_either desired headsUp takeover 480; then
  if [ "$(status desired)" = "headsUp" ]; then
    pass "the small countdown comes up for the account's check-in time"
  else
    say "note  this Mac was connected less than a minute before the check-in, so the alarm came up without the countdown"
  fi
else
  fail "no countdown within 8 minutes (state: $(status desired), next: $(status next))"
fi
shot 41-live-heads-up
expect "one minute before, the screen is taken" desired takeover 420
ID="$(status id)"
say "note  check-in $ID, screen says: $(status title) / $(status subtitle)"
case "$(status subtitle)" in
  *"Samwise calls"*|*"Samwise is calling"*) fail "a phone call is promised to an account that gets none" ;;
  *) pass "no phone call is promised (this account has no trusted people, so Samwise does not call it)" ;;
esac
shot 42-live-alarm
if [ "$(status words_count)" != "0" ] && [ -n "$(status words_count)" ]; then pass "the account's own opening words arrived"; else fail "no opening words arrived"; fi
check "they stay hidden at first" "$(status words_shown)" False
cmd "key:tab"
expect "Tab shows them" words_shown True
shot 43-live-own-words
cmd "key:tab"
expect "Tab hides them again" words_shown False
cmd "type:I am doing my check-in now"
expect "typing the line gives the screen back" desired inProgress
expect_contains "and opens the journal at this check-in's tab" opened "tab=t."
shot 44-live-in-progress

# The person running this check now adds a written entry for the test account in Samwise's database.
say "note  waiting for Samwise to count the check-in (a written entry is added to the test account now)"
if wait_for "phases.$ID" done 480; then
  pass "when Samwise counts the check-in, the alarm ends on its own"
  expect "the after-check-in card opens" windows True
  case "$(status next)" in
    *"today ${ID#*T}"*) fail "the menu still names the check-in that is done ($(status next))" ;;
    *) pass "the menu moves on to the check-in after this one ($(status next))" ;;
  esac
  shot 45-live-after-check-in
  cmd "taskdone"
  # The app drops the task from its own list at once. Only Samwise's next two answers prove it was saved.
  sleep 10
  cmd "poll"
  sleep 10
  check "ticking a task is saved by Samwise: its next answer has one task less" "$(status tasks)" 1
else
  fail "Samwise did not count the check-in within 8 minutes (phase: $(status "phases.$ID"))"
fi

if wait_for queued_events 0 90; then pass "everything the alarm did was reported to Samwise"; else fail "$(status queued_events) events still waiting to be sent"; fi

# ───────────────────────── E. Leave nothing behind ─────────────────────────
say "== E. Clean up =="
cmd "disconnect"
expect "the Mac is disconnected" paired False
cmd "keeprunning:off"
expect "keep running is turned off" launchd False 40
sleep 2
cmd "quit"
sleep 3
pkill -x Samwise 2>/dev/null || true
launchctl unsetenv SAMWISE_FLAGS
cp "$HOMEDIR/samwise.log" "$OUT/live.app.log" 2>/dev/null || true
cp "$WORK/install.log" "$OUT/live.install.log" 2>/dev/null || true

say "== $FAILS failed =="
[ "$FAILS" -eq 0 ]
