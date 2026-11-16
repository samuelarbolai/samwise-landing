# Samwise for Mac

A menu-bar app with one job: at check-in time it takes over every screen of the Mac until the person
deals with it. The check-in itself (the phone call, the journal) stays where it is; this is the alarm.

Download: https://www.samwise.life/mac

## What it does

| When | What happens |
|---|---|
| From 30 minutes before | The Mac is kept from falling asleep on its own, because a sleeping Mac cannot ring (`Engine.awakeLevel`). The screen may turn off until the alarm, and is kept on while the alarm is up. It ends when the alarm is answered, at the latest 15 minutes past the time. A setting turns it off; a closed lid still sleeps the Mac. |
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
- `scripts/e2e.sh` runs the built app on a real Mac with a pretend clock and a stand-in server (`mock_server.py`),
  and takes screenshots. Its last part installs the app for real, so it only runs on a build machine.
- `scripts/live-check.sh` checks the real samwise.life from a Mac with a temporary test account (see below).
- `scripts/first-open.sh` opens a browser-style download for the first time and photographs what macOS asks
  (see "Signing, and the first open").
- `.github/workflows/mac-app.yml` runs the build and the live check on a GitHub macOS runner, and
  `.github/workflows/mac-first-open.yml` the first open. Outputs go to the `mac-builds`, `mac-live-check` and
  `mac-first-open-check` branches, not to this branch.

The rest of the feature lives in the website:

- `app/mac/` is the download page, `app/mac/open` the page with the first-open steps (every Download button
  leads there), `app/download/mac` the link that always points at the current disk image,
  `public/mac/install.sh` the one-line installer, `public/downloads/` the disk image itself.
- `app/api/mac/*` and `lib/mac/server.ts` are what a connected Mac talks to. `lib/mac/release.ts` names the
  version the site offers.

## What a connected Mac may do

A Mac is connected to one Samwise account by a device token (`mac_devices`; only the token's SHA-256 is stored).
Everything a token can read or change is scoped to its own user.

| Call | What it does |
|---|---|
| `POST /api/mac/pair/start` `{phone}` | Sends a 6-digit code to that account's WhatsApp (reuses `phone_codes` and the n8n workflow "Samwise Phone Code"). Same answer and same wait whether or not the number has an account. |
| `POST /api/mac/pair/verify` `{phone, code}` | Checks the code (10 minutes, 5 tries) and returns `{token, config}`. |
| `POST /api/mac/pair/code` `{code}` | Same with a one-time pairing code handed over directly (`mac_pair_codes`). |
| `GET /api/mac/config` | Check-in times, how yesterday's, today's and tomorrow's check-ins stand, the person's own opening words, their open after-check-in list. |
| `POST /api/mac/events` `{events}` | What the alarm did (`mac_app_events`). Names and counters only. |
| `POST /api/mac/tasks/done` `{id}` | Ticks one of the person's own open tasks. |
| `POST /api/mac/unpair` | Disconnects this Mac. |

`config` mirrors how Samwise decides about a call (n8n "Ritual Call Dispatch"), so the alarm only says
"Samwise is calling your phone" when a call is really due: see the comment on `loadConfig`.

Having a Samwise account is private, so the pairing calls never tell a stranger whether a number has one.

## Data

Without an account the app sends nothing anywhere. With one it talks only to `samwise.life/api/mac/*`:
it reads the schedule, the person's own opening words for that time of day, their after-check-in list and
how today's check-in stands, and it reports alarm events (fired, shown, typed, snoozed, skipped, done) with the
Mac's name and macOS version. It never sends what is typed, read or open. Opening words are shown only after Tab
is pressed (a setting), are never written to the log, and the alarm window asks macOS to keep it out of
screenshots and screen recordings. State lives in `~/Library/Application Support/Samwise/`.

## How Samwise notices a broken alarm

When a connected Mac asks for its schedule within 10 minutes after a check-in time, the server notes a `seen`
event: that Mac was on and online. The Mac reports `shown` when the alarm takes the screen. The daily Health Check
(n8n, function `samwise_mac_health_checks()` in Neon) reports any `seen` without `shown`, `done`, `skipped` or
`missed` (`mac_alarm_not_shown`), and any alarm dropped by the restart guard (`mac_alarm_crashed`).

## Signing, and the first open

The app is not signed with an Apple Developer ID, so it is offered as a beta and macOS refuses a copy that was
downloaded with a browser. On macOS 15 and newer the dialog says "Samwise" Not Opened and only offers Move to
Trash and Done: right-click > Open no longer gets past it. The way through is:

1. Click Done. (The blue default button is Move to Trash.)
2. System Settings > Privacy & Security, scroll down to Security, click Open Anyway.
3. In the question that follows, Open "Samwise"?, click Open Anyway (Move to Trash is the blue default again),
   then give an administrator's password or Touch ID.

`samwise.life/mac/open` shows these steps with pictures, says plainly that this is a beta Apple has not checked
(open it only if you trust Samwise), and is where every Download button on the site leads: on a Mac the page
starts the download by itself (`/mac/open?dl=1`); on a phone or a PC it starts nothing and says to open the page
on the Mac. `/download/mac` sends a browser to that page too, and gives the disk image to everything else (curl,
the checks). The Terminal line on the download page skips the dialog, because files fetched by `curl` are not
checked by Gatekeeper; the installer prints the same beta notice.

Downloads are counted in the table `mac_downloads` (when, version, which way, nothing about who): `steps` is a
browser on a Mac through the steps page, `terminal` the curl line, `check` our own checks (`?check=1`). The
Health Check rule `mac_downloads_not_connecting` compares a week of `steps` downloads with the Macs that
connected, to notice people who download and do not get through.

`scripts/first-open.sh` (workflow "Mac first open") walks this path on a real Mac: it marks the disk image the
way Safari does, opens the app, clicks through Privacy & Security and takes a picture of every step. Its outputs
go to the `mac-first-open-check` branch, and the pictures on `/mac/open` (`public/mac/open-*.png`) are cut from
them (cropped only, never retouched). Run it again when a new macOS changes the dialogs, and update the page
from what it shows.

Notarizing the app would remove the dialog for everyone. It needs an Apple Developer account: a Developer ID
Application certificate and an App Store Connect API key as repository secrets, then `codesign --options runtime`
and `xcrun notarytool submit` in `build.sh`.

## Releasing a new version

1. Change `VERSION` and push to the `mac-checkin-alarm` branch, or run the "Mac app" workflow by hand with no inputs.
   The build must end with `== 0 failed ==` in `out/e2e.txt` on the `mac-builds` branch.
2. Copy `out/Samwise-<version>.dmg` from `mac-builds` into `public/downloads/`.
3. Update `version`, `file`, `sha256` and `sizeMb` in `lib/mac/release.ts`. Connected Macs then show
   "Update available" in their menu.
4. Open a pull request; after the merge, run the live check.

## Live check

Run the "Mac app" workflow by hand with `live_pair_code` set (and optionally `live_phone` and `live_otp`). It
downloads and installs from samwise.life with the line on the page, connects a temporary test account and waits
for that account's check-in time on the real clock. Make the account first (a made-up name, a phone number that
cannot exist, no trusted people, a check-in time about ten minutes ahead, a row in `mac_pair_codes`), add a
written entry for it when the alarm is up, and delete it afterwards. The workflow's inputs are public, so they
must only ever be codes of such a throwaway account.

## Run it locally

```bash
cd mac
swift test
scripts/build.sh build
open build/Samwise.app --args --no-agent --test-now
```
