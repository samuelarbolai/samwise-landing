#!/bin/bash
# What a person meets when they download Samwise for Mac with a browser and open it for the first
# time. The app is not signed with an Apple Developer ID yet, so macOS refuses ("Samwise" Not Opened)
# and System Settings > Privacy & Security offers Open Anyway. This script walks that path on a real
# Mac and takes a picture of every step, so the steps on samwise.life/mac/open are checked against
# what macOS really shows, and can be checked again when macOS changes them.
#
# It only runs on a throwaway build machine: it sets that machine's login password to a random value,
# so that it can answer the password question macOS asks at the end.
set -uo pipefail
cd "$(dirname "$0")/.."

if [ "${GITHUB_ACTIONS:-}" != "true" ]; then
  echo "This changes the login password of the Mac it runs on, so it only runs on a build machine." >&2
  exit 1
fi

OUT="${1:-build}"
SHOTS="$OUT/shots"
RES="$OUT/first-open.txt"
BASE="${SAMWISE_BASE:-https://www.samwise.life}"
WORK="$(mktemp -d)"
mkdir -p "$SHOTS"
: > "$RES"
FAILED=0
say() { echo "$*" | tee -a "$RES"; }
pass() { say "PASS  $*"; }
fail() { say "FAIL  $*"; FAILED=$((FAILED + 1)); }
note() { say "note  $*"; }
shot() { sleep 1.5; screencapture -x "$SHOTS/$1.png" 2>/dev/null || note "screenshot $1 not taken"; }

# ───────────────────────── Helpers ─────────────────────────

# Every window on screen, front to back: id, layer, owner, title, frame.
cat > "$WORK/winlist.swift" <<'SWIFT'
import CoreGraphics
import Foundation

let list = (CGWindowListCopyWindowInfo([.optionOnScreenOnly], kCGNullWindowID) as? [[String: Any]]) ?? []
for w in list {
    let owner = w[kCGWindowOwnerName as String] as? String ?? ""
    let name = w[kCGWindowName as String] as? String ?? ""
    let id = w[kCGWindowNumber as String] as? Int ?? 0
    let layer = w[kCGWindowLayer as String] as? Int ?? 0
    let b = w[kCGWindowBounds as String] as? [String: Any] ?? [:]
    func n(_ k: String) -> Int { Int((b[k] as? Double) ?? 0) }
    print("\(id)\t\(layer)\t\(owner)\t\(name)\t\(n("X")),\(n("Y")),\(n("Width")),\(n("Height"))")
}
SWIFT
if ! swiftc -O "$WORK/winlist.swift" -o "$WORK/winlist" 2> "$WORK/swiftc.log"; then
  note "the window lister did not build: $(head -3 "$WORK/swiftc.log" | tr '\n' ' ')"
fi
windows() { "$WORK/winlist" 2>/dev/null | grep -v -E $'\t(Window Server|Dock|Control Center|SystemUIServer|Spotlight|Wallpaper|WindowManager|Notification Center|TextInputMenuAgent)\t' || true; }
# winshot <owner> <file>: a picture of that owner's frontmost real window, with and without its shadow.
winshot() {
  local id
  id="$("$WORK/winlist" 2>/dev/null | awk -F'\t' -v o="$1" '$3==o { split($5,f,","); if (f[3]>150 && f[4]>80) { print $1; exit } }')"
  if [ -z "$id" ]; then note "no window of $1 to photograph"; return 1; fi
  screencapture -x -o -l "$id" "$SHOTS/$2.png" 2>/dev/null || note "window picture $2 not taken"
  screencapture -x -l "$id" "$SHOTS/$2-shadow.png" 2>/dev/null || true
}

# What a process shows: every named thing in its windows, with its frame.
cat > "$WORK/dump.applescript" <<'AS'
on run argv
  set procName to item 1 of argv
  set out to ""
  tell application "System Events"
    if not (exists process procName) then return "no process " & procName
    tell process procName
      repeat with w in windows
        set wname to ""
        try
          set wname to name of w as text
        end try
        set out to out & "WINDOW | " & wname & " | " & my frameOf(w) & linefeed
        with timeout of 240 seconds
          set els to entire contents of w
        end timeout
        repeat with e in els
          set el to contents of e
          set r to ""
          set n to ""
          set v to ""
          set d to ""
          try
            set r to role of el as text
          end try
          try
            set n to name of el as text
          end try
          try
            set v to value of el as text
          end try
          try
            set d to description of el as text
          end try
          set t to ""
          try
            set t to title of el as text
          end try
          if n is "missing value" then set n to ""
          if v is "missing value" then set v to ""
          if t is "missing value" then set t to ""
          if n is not "" or v is not "" or r is "AXButton" or r is "AXScrollBar" then
            set out to out & r & " | " & n & " | " & v & " | " & d & " | " & my frameOf(el) & " | " & t & linefeed
          end if
        end repeat
      end repeat
    end tell
  end tell
  return out
end run

on frameOf(el)
  try
    tell application "System Events"
      set p to position of el
      set s to size of el
    end tell
    return ((item 1 of p) as text) & "," & ((item 2 of p) as text) & "," & ((item 1 of s) as text) & "," & ((item 2 of s) as text)
  on error
    return "?"
  end try
end frameOf
AS

# press <process> <button> <show|click> [has]: finds a button by its name, or with "has" by a part of
# its name; show only scrolls it into view.
cat > "$WORK/press.applescript" <<'AS'
on run argv
  set procName to item 1 of argv
  set btnName to item 2 of argv
  set mode to item 3 of argv
  set part to false
  if (count of argv) > 3 then set part to true
  tell application "System Events"
    if not (exists process procName) then return "no process " & procName
    tell process procName
      try
        set frontmost to true
      end try
      repeat with w in windows
        with timeout of 240 seconds
          set els to entire contents of w
        end timeout
        repeat with e in els
          set el to contents of e
          set r to ""
          set n to ""
          set t to ""
          set d to ""
          try
            set r to role of el as text
          end try
          if r is "AXButton" then
            try
              set n to name of el as text
            end try
            try
              set t to title of el as text
            end try
            try
              set d to description of el as text
            end try
            if n is btnName or t is btnName or d is btnName or (part and (n contains btnName or t contains btnName)) then
              try
                perform action "AXScrollToVisible" of el
              end try
              delay 0.7
              set p to position of el
              set s to size of el
              set f to ((item 1 of p) as text) & "," & ((item 2 of p) as text) & "," & ((item 1 of s) as text) & "," & ((item 2 of s) as text)
              if mode is "click" then
                click el
                return "clicked " & btnName & " at " & f
              end if
              return "found " & btnName & " at " & f
            end if
          end if
        end repeat
      end repeat
    end tell
  end tell
  return "not found: " & btnName
end run
AS
dump() { osascript "$WORK/dump.applescript" "$1" 2>&1; }
press() { osascript "$WORK/press.applescript" "$@" 2>&1; }
running() { ps -axo pid=,stat=,etime=,command= | grep "[S]amwise.app/Contents/MacOS/Samwise" | awk '{ print $1 " " $2 " " $3 }' | tr '\n' ';'; }

say "== First open of a browser download: $(sw_vers -productName) $(sw_vers -productVersion) ($(sw_vers -buildVersion)) =="
note "gatekeeper: $(spctl --status 2>&1 | tr '\n' ' ')"
note "screen: $(osascript -e 'tell application "Finder" to get bounds of window of desktop' 2>/dev/null)"

# An administrator's password for this throwaway Mac, to answer the question macOS asks at the end:
# this user's own password set to a random value, or else a second administrator made for the run.
PW="Sw-$(uuidgen | tr -d '-' | cut -c1-14)"
echo "::add-mask::$PW"
ADMIN=""
if sudo sysadminctl -resetPasswordFor "$USER" -newPassword "$PW" > "$WORK/passwd.log" 2>&1 && dscl . -authonly "$USER" "$PW" >/dev/null 2>&1; then
  ADMIN="$USER"
  note "login password of this build machine set to a random value"
elif sudo sysadminctl -addUser samwisecheck -fullName "Samwise Check" -password "$PW" -admin >> "$WORK/passwd.log" 2>&1 && dscl . -authonly samwisecheck "$PW" >/dev/null 2>&1; then
  ADMIN="samwisecheck"
  note "a second administrator was made on this build machine for the password question"
else
  note "no administrator password could be set: $(grep -v -i password "$WORK/passwd.log" | tail -2 | tr '\n' ' ')"
fi

# ───────────────────────── 1. The download ─────────────────────────
say "== 1. The download =="
DL="$(curl -fsSL -o "$WORK/Samwise.dmg" -w "%{http_code} %{size_download}" --max-time 120 "$BASE/download/mac" 2>/dev/null)"
if [ "${DL%% *}" = "200" ]; then pass "the disk image downloads from $BASE ($DL)"; else fail "the disk image did not download: $DL"; fi
# A browser marks what it downloads, curl does not. This is the mark Safari leaves.
MARK="0083;$(printf '%x' "$(date +%s)");Safari;$(uuidgen)"
xattr -w com.apple.quarantine "$MARK" "$WORK/Samwise.dmg"
MNT="/Volumes/Samwise"
hdiutil attach "$WORK/Samwise.dmg" -readonly -quiet || fail "the disk image did not open"
open "$MNT" 2>/dev/null || true
sleep 4
shot 49-disk-image
say "windows:"; windows | tee -a "$RES"
winshot Finder 49-disk-image-window || true
osascript -e 'tell application "Finder" to close every window' >/dev/null 2>&1 || true
rm -rf /Applications/Samwise.app
# Dragging to Applications is a copy that keeps the mark.
ditto "$MNT/Samwise.app" /Applications/Samwise.app || fail "Samwise could not be copied to Applications"
hdiutil detach "$MNT" -quiet >/dev/null 2>&1 || true
Q="$(xattr -p com.apple.quarantine /Applications/Samwise.app 2>/dev/null || true)"
if [ -n "$Q" ]; then
  pass "the copy in Applications carries the browser's download mark (${Q%%;*})"
else
  note "the copy lost the mark, setting it by hand"
  xattr -r -w com.apple.quarantine "$MARK" /Applications/Samwise.app
fi
note "spctl: $(spctl --assess --type execute -vv /Applications/Samwise.app 2>&1 | tr '\n' ' ')"

# ───────────────────────── 2. Opening it ─────────────────────────
say "== 2. Opening it, as a double-click does =="
( open /Applications/Samwise.app > "$WORK/open.log" 2>&1 & )
sleep 8
shot 50-not-opened
say "windows:"; windows | tee -a "$RES"
note "Samwise process while the dialog is up: $(running)"
D1="$(dump CoreServicesUIAgent)"
echo "$D1" > "$OUT/first-open-dialog.txt"
echo "$D1" | head -40 | tee -a "$RES"
if echo "$D1" | grep -q "Not Opened"; then pass "the dialog says Not Opened"; else fail "the dialog does not say Not Opened"; fi
if echo "$D1" | grep -q "could not verify"; then pass "it says Apple could not verify the app"; else fail "it does not say Apple could not verify the app"; fi
if echo "$D1" | grep -q "^AXButton | Done "; then pass "it offers Done"; else fail "it does not offer Done"; fi
if echo "$D1" | grep -q "^AXButton | Move to Trash "; then pass "it offers Move to Trash"; else fail "it does not offer Move to Trash"; fi
if echo "$D1" | grep -q -E "^AXButton \| Open"; then fail "the dialog offers Open, which the page says it does not"; else pass "it offers no way to open the app from the dialog"; fi
winshot CoreServicesUIAgent 50-not-opened-window

note "Done: $(press CoreServicesUIAgent Done click)"
sleep 4
note "Samwise process after Done: $(running)"
if [ -z "$(running)" ]; then pass "after Done, Samwise is not running"; else fail "Samwise is running although macOS said Not Opened"; fi

# ───────────────────────── 3. Privacy & Security ─────────────────────────
say "== 3. System Settings > Privacy & Security =="
open "x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension?Security"
sleep 12
shot 51-privacy-security
D2="$(dump "System Settings")"
echo "$D2" > "$OUT/first-open-settings.txt"
note "settings elements: $(echo "$D2" | wc -l | xargs)"
echo "$D2" | grep -i -E "samwise|anyway|blocked|^WINDOW|Allow app" | tee -a "$RES"
# macOS names the Open Anyway button after the line it belongs to, so that line is how it is found.
BLOCKED="was blocked to protect your Mac"
if echo "$D2" | grep -q "^AXStaticText | “Samwise” $BLOCKED"; then pass "Privacy & Security says Samwise was blocked to protect your Mac"; else fail "no line says Samwise was blocked"; fi
if echo "$D2" | grep -q "^AXButton | “Samwise” $BLOCKED"; then pass "with a button on that line (Open Anyway in the picture)"; else fail "no button on that line"; fi
if echo "$D2" | grep -q "^AXStaticText | Security "; then pass "under the heading Security"; else note "no heading named Security was found"; fi
note "Open Anyway: $(press "System Settings" "$BLOCKED" show has)"
shot 52-open-anyway
say "windows:"; windows | tee -a "$RES"
winshot "System Settings" 52-open-anyway-window

# ───────────────────────── 4. Open Anyway ─────────────────────────
say "== 4. Open Anyway =="
note "click: $(press "System Settings" "$BLOCKED" click has)"
sleep 5
shot 53-open-anyway-question
say "windows:"; windows | tee -a "$RES"
D3="$(dump CoreServicesUIAgent)"
D3S="$(dump "System Settings")"
{ echo "--- CoreServicesUIAgent"; echo "$D3"; echo "--- System Settings"; echo "$D3S"; } > "$OUT/first-open-question.txt"
echo "$D3" | head -30 | tee -a "$RES"
ASKER=""
if echo "$D3" | grep -q "^AXButton | Open Anyway "; then ASKER="CoreServicesUIAgent"; elif echo "$D3S" | grep -q "^AXButton | Open Anyway "; then ASKER="System Settings"; fi
if [ -n "$ASKER" ]; then pass "macOS asks once more, with an Open Anyway button ($ASKER)"; else fail "no second question with Open Anyway"; fi
[ "$ASKER" = "CoreServicesUIAgent" ] && winshot CoreServicesUIAgent 53-open-anyway-question-window
if [ -n "$ASKER" ]; then
  note "click: $(press "$ASKER" "Open Anyway" click)"
  sleep 5
  shot 54-password
  say "windows:"; windows | tee -a "$RES"
  { for who in SecurityAgent coreautha "System Settings" CoreServicesUIAgent; do echo "--- $who"; dump "$who"; done; } > "$OUT/first-open-password.txt" 2>&1 || true
  grep -v "^AXStaticText | $" "$OUT/first-open-password.txt" | head -40 | tee -a "$RES"
  winshot SecurityAgent 54-password-window || true
  if windows | grep -q -E $'\t(SecurityAgent|coreautha|LocalAuthenticationRemoteService)\t'; then pass "macOS then asks for an administrator's password"; else note "no password window was seen"; fi
  if [ -n "$(running)" ]; then
    note "Samwise opened without a password question"
  elif [ "$ADMIN" = "$USER" ]; then
    osascript -e 'on run argv' -e 'tell application "System Events"' -e 'keystroke (item 1 of argv)' -e 'delay 0.6' -e 'key code 36' -e 'end tell' -e 'end run' "$PW" >/dev/null 2>&1 || note "the password could not be typed"
  elif [ -n "$ADMIN" ]; then
    # Another administrator answers: back to the name field, replace the name, then the password.
    osascript -e 'on run argv' -e 'tell application "System Events"' -e 'key code 48 using shift down' -e 'delay 0.4' -e 'keystroke "a" using command down' -e 'keystroke (item 1 of argv)' -e 'delay 0.4' -e 'key code 48' -e 'delay 0.4' -e 'keystroke (item 2 of argv)' -e 'delay 0.6' -e 'key code 36' -e 'end tell' -e 'end run' "$ADMIN" "$PW" >/dev/null 2>&1 || note "the name and password could not be typed"
  fi
  for _ in 1 2 3 4 5 6 7 8 9 10; do [ -n "$(running)" ] && break; sleep 2; done
  sleep 3
  shot 55-opened
  say "windows:"; windows | tee -a "$RES"
  note "Samwise process at the end: $(running)"
  if [ -n "$(running)" ]; then pass "after Open Anyway and the password, Samwise opens"; else fail "Samwise did not open after Open Anyway and the password"; fi
  winshot Samwise 55-opened-window || true
fi

# Leave the build machine as it was found.
launchctl bootout "gui/$(id -u)/life.samwise.mac" >/dev/null 2>&1 || true
pkill -x Samwise >/dev/null 2>&1 || true
osascript -e 'tell application "System Settings" to quit' >/dev/null 2>&1 || true

say "== $FAILED failed =="
[ "$FAILED" -eq 0 ]
