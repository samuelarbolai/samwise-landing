#!/bin/bash
# Builds Samwise.app (Apple silicon + Intel) and Samwise-<version>.dmg into mac/<out>.
# Runs on a Mac with Xcode. The app is signed ad hoc: no Apple Developer ID is involved.
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION="$(tr -d '[:space:]' < VERSION)"
BUILD="${GITHUB_RUN_NUMBER:-1}"
OUT="${1:-build}"
rm -rf "$OUT"
mkdir -p "$OUT"

swift build -c release --arch arm64 --arch x86_64
BIN=".build/apple/Products/Release/Samwise"

APP="$OUT/Samwise.app"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp "$BIN" "$APP/Contents/MacOS/Samwise"
sed -e "s/__VERSION__/$VERSION/" -e "s/__BUILD__/$BUILD/" Resources/Info.plist > "$APP/Contents/Info.plist"
plutil -lint "$APP/Contents/Info.plist"

# The icon is drawn by the app itself, so the repository holds no binary art.
ICONSET="$OUT/AppIcon.iconset"
"$APP/Contents/MacOS/Samwise" --render-icon "$ICONSET"
iconutil -c icns "$ICONSET" -o "$APP/Contents/Resources/AppIcon.icns"
cp "$ICONSET/icon_256x256.png" "$OUT/icon.png"
rm -rf "$ICONSET"

codesign --force --deep --sign - "$APP"
codesign --verify --deep --strict "$APP"
echo "architectures: $(lipo -archs "$APP/Contents/MacOS/Samwise")"

STAGE="$OUT/dmg"
mkdir -p "$STAGE"
cp -R "$APP" "$STAGE/"
ln -s /Applications "$STAGE/Applications"
hdiutil create -volname "Samwise" -srcfolder "$STAGE" -ov -format UDZO "$OUT/Samwise-$VERSION.dmg" > /dev/null
rm -rf "$STAGE"
( cd "$OUT" && shasum -a 256 "Samwise-$VERSION.dmg" | tee "Samwise-$VERSION.dmg.sha256" )
ls -l "$OUT"
