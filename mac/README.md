# Samwise for Mac

A menu-bar app with one job: at check-in time it takes over every screen of the Mac until the person
deals with it. The check-in itself (the phone call, the journal) stays where it is; this is the alarm.

Download: https://www.samwise.life/mac

## What it does

| When | What happens |
|---|---|
| 5 minutes before | A small countdown panel at the top of the screen and one soft chime. |
| 1 minute before | Every display is covered. With a connected account: "Samwise calls your phone at 16:00. Get it in your hand." |
| At the time | "It's time for your check-in." A ring that grows louder; after a minute a sharper ring, and a muted Mac is set to 60%. |
| To get the screen back | Type `I am doing my check-in now`. There is no text field and nothing to paste into. |
| 15 minutes later | "Did you finish your check-in?" No answer for 10 minutes takes the screen again. |
| If Samwise's call was missed | The screen is taken again with Samwise's number and the time until which nobody is told. |
| When Samwise counts the check-in | The alarm ends on its own and shows what the person planned for after. |

The person is always in charge: snooze (5 minutes, twice), skip by typing `I choose to skip this check-in`,
pause from the menu bar, or change every limit in Settings. The alarm screen says why it is insistent.
macOS Force Quit is never blocked, and three restarts while an alarm is up make it let go, so a bug cannot lock the Mac.

## Layout

- `Sources/SamwiseCore` holds the rules with no screen code: `Engine.step` takes the clock, the schedule and
  what Samwise reports, and returns what should be on screen. It is unit-tested (`swift test`, also runs on Linux).
- `Sources/Samwise` is the AppKit app: the takeover windows, the small panel, sounds, menu bar, settings, pairing.
- `scripts/build.sh` builds `Samwise.app` (Apple silicon + Intel), signs it ad hoc and makes the DMG.
- `scripts/e2e.sh` runs the built app on a real Mac with a pretend clock and a stand-in server, and takes screenshots.
- `.github/workflows/mac-app.yml` runs both on a GitHub macOS runner and pushes the outputs to the `mac-builds` branch.

## Data

Without an account the app sends nothing anywhere. With one it talks only to `samwise.life/api/mac/*`:
it reads the schedule, the person's own journal text for that time of day, their after-check-in list and
how today's check-in stands, and it reports alarm events (fired, typed, snoozed, skipped). Journal text is shown
only after Tab is pressed (a setting), is never written to the log, and the alarm window is hidden from screen sharing.
State lives in `~/Library/Application Support/Samwise/`.

## Signing

The app is not signed with an Apple Developer ID, so the first open needs System Settings > Privacy & Security >
Open Anyway (or the Terminal install line on the download page). Notarizing it needs an Apple Developer account:
a Developer ID Application certificate and an app-specific password as repository secrets, then `codesign --options runtime`
and `xcrun notarytool submit` in `build.sh`.

## Run it locally

```bash
cd mac
swift test
scripts/build.sh build
open build/Samwise.app --args --no-agent --test-now
```
