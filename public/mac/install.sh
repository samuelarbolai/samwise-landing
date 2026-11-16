#!/bin/bash
# Installs Samwise for Mac (the check-in alarm) into Applications and opens it.
#
#   curl -fsSL https://www.samwise.life/mac/install.sh | bash
#
# What it does: downloads the disk image from samwise.life, copies Samwise.app into
# Applications (replacing an older copy; your settings are kept) and opens it.
# It asks for no password and installs nothing else.
set -euo pipefail

# Everything runs inside main, called on the last line, so a download that is cut off
# half way runs nothing at all.
main() {
  URL="${SAMWISE_DMG_URL:-https://www.samwise.life/download/mac}"
  LABEL="life.samwise.mac"

  if [ "$(uname -s)" != "Darwin" ]; then
    echo "Samwise for Mac only runs on macOS." >&2
    exit 1
  fi
  MAJOR="$(sw_vers -productVersion | cut -d. -f1)"
  if [ "$MAJOR" -lt 13 ]; then
    echo "Samwise for Mac needs macOS 13 or newer. This Mac has $(sw_vers -productVersion)." >&2
    exit 1
  fi

  TMP="$(mktemp -d)"
  MNT="$TMP/mnt"
  cleanup() {
    hdiutil detach "$MNT" -quiet >/dev/null 2>&1 || true
    rm -rf "$TMP"
  }
  trap cleanup EXIT

  echo "Downloading Samwise for Mac..."
  curl -fsSL "$URL" -o "$TMP/Samwise.dmg"
  mkdir -p "$MNT"
  hdiutil attach "$TMP/Samwise.dmg" -nobrowse -readonly -quiet -mountpoint "$MNT"
  if [ ! -d "$MNT/Samwise.app" ]; then
    echo "The download did not contain Samwise.app. Nothing was changed." >&2
    exit 1
  fi

  # A copy that is already running is stopped first.
  launchctl bootout "gui/$(id -u)/$LABEL" >/dev/null 2>&1 || true
  pkill -x Samwise >/dev/null 2>&1 || true
  sleep 1

  DEST="/Applications"
  if [ ! -w "$DEST" ]; then
    DEST="$HOME/Applications"
    mkdir -p "$DEST"
  fi
  rm -rf "$DEST/Samwise.app"
  ditto "$MNT/Samwise.app" "$DEST/Samwise.app"
  xattr -dr com.apple.quarantine "$DEST/Samwise.app" >/dev/null 2>&1 || true

  echo "Installed in $DEST. Opening Samwise..."
  open "$DEST/Samwise.app"
  echo "Done. Look for the star in your menu bar."
}

main "$@"
