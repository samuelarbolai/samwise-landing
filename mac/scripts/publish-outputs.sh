#!/bin/bash
# Puts what a run produced (disk image, screenshots, results, logs) on a branch of its own, replacing
# what was there. Used by .github/workflows/mac-app.yml: mac-builds for builds, mac-live-check for live checks.
set -e
BRANCH="${1:?branch name}"
WORK="$(mktemp -d)"
SRC="$GITHUB_WORKSPACE/mac/build"
mkdir -p "$WORK/out"
if [ -d "$SRC" ]; then
  cp -R "$SRC/shots" "$WORK/out/" 2>/dev/null || true
  for f in "$SRC"/*.dmg "$SRC"/*.sha256 "$SRC"/*.txt "$SRC"/*.log "$SRC"/*.jsonl "$SRC"/icon.png; do
    [ -f "$f" ] && cp "$f" "$WORK/out/"
  done
fi
sw_vers > "$WORK/out/runner.txt" 2>&1 || true
echo "$GITHUB_SHA run $GITHUB_RUN_ID" > "$WORK/out/BUILD"
# This branch only carries run outputs: Vercel must not try to deploy it.
echo '{"git":{"deploymentEnabled":false}}' > "$WORK/vercel.json"
cd "$WORK"
git init -q -b "$BRANCH"
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -A
git commit -q -m "Mac run outputs for ${GITHUB_SHA::7}"
git push -q -f "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" "$BRANCH"
