# current-plan.md — /book device-timezone auto-detect

> Supersedes the prior pre-warmed-opener + end-of-call-hold plan
> (shipped on `/qualify`).
>
> Single coordinated change: the `/book` calendar UI on
> `samwise-landing` displays availability in the **user's device
> timezone** (auto-detected via `Intl`), with Bogotá shown as a
> small clarifier next to the chosen time. The server stays
> Bogotá-canonical — slots are still computed against Samuel's
> Bogotá-local working hours and the submit payload still sends
> `day` + `slot` in Bogotá-local. Only the client display changes.

## Plan Summary

| Surface | What changes |
|---|---|
| `samwise-landing/app/book/book-root.tsx` | Detect device timezone once on mount via `Intl.DateTimeFormat().resolvedOptions().timeZone`. After fetching slots, transform the Bogotá-canonical day/slot pairs into device-local groupings (`LocalDay[]`) using a new helper. Pass `deviceTz` + the transformed days through to children. On submit, still send the original Bogotá day+slot from the chosen slot's preserved fields. |
| `samwise-landing/app/book/lib.ts` (new) | One pure helper: `bogotaSlotToLocal({ bogotaDay, bogotaSlot, deviceTz })` → `{ localDay, localHHmm, startMs }`. One re-grouper: `groupByLocalDay(serverDays, deviceTz)` → `LocalDay[]`. One short-tz formatter: `formatShortTimeZone(deviceTz)` → e.g. "GMT-5" or "EST". |
| `samwise-landing/app/book/month-grid.tsx` | Take `LocalDay[]` instead of `DaySlots[]`. Day keys are device-local YYYY-MM-DD. Replace the hardcoded `"Times shown in Bogotá time."` / `"Horas en hora de Bogotá."` sub-line with a device-local label that uses the auto-detected tz name + offset. |
| `samwise-landing/app/book/time-slots.tsx` | Take `LocalSlot[]` instead of `string[]`. Display the precomputed `localHHmm` directly (drop the inline HH:mm parsing). When passing the selected slot back up, pass the full `LocalSlot` so `Confirm` can read its preserved Bogotá day/slot. |
| `samwise-landing/app/book/confirm.tsx` | Take the full `LocalSlot` + `deviceTz`. Format `whenLabel` against the device tz (today's `whenLabel` uses `timeZone: "UTC"` which silently mis-renders for any non-UTC user — incidental bug fixed here). Underneath the local-time line, render a small Bogotá-clarifier line so the prospect knows what time it is on Samuel's side. On submit, send the slot's preserved `bogotaDay` + `bogotaSlot`. |
| `samwise-landing/app/book/book.css` | One small rule for the new `.book-tz-bogota-clarifier` line — same register as `.book-sub`, half-step smaller. |

### Decisions locked (from clarification)

| Decision | Choice |
|---|---|
| Scope | **Only the `/qualify` booking flow** (this is the only calendar UI shipped today). The pattern is captured in this plan so the next calendar UI inherits it. |
| Server contract | **Unchanged.** Server keeps returning Bogotá-canonical day+slot. Submit payload keeps sending Bogotá-canonical day+slot. All re-grouping + display conversion happens on the client. |
| Timezone source | `Intl.DateTimeFormat().resolvedOptions().timeZone` — captured once on mount via `useState` initializer (stable for the session). |
| Cross-midnight re-grouping | A Bogotá-morning slot can fall on the *previous* device-local day for Asia/Oceania, and a Bogotá-evening slot can fall on the *next* device-local day for Europe. The transformer re-groups by the device-local day key, so the month grid shows the user's days, not Bogotá's. |
| Display tz name | Short form via `Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })` → e.g. "GMT-5" / "EST" / "CET". Falls back to the raw IANA string if `Intl` can't resolve it. |
| Bogotá clarifier on Confirm | Small line under the local-time `book-sub`: `"Samuel is in Bogotá — 10:00 AM there"` / `"Samuel está en Bogotá — 10:00 AM allá"`. Renders only when device tz ≠ `America/Bogota` (no clarifier needed for Bogotá users). |
| Existing UTC-format bug in `whenLabel` | Fixed as part of this change — `Confirm` currently builds a UTC date from a Bogotá HH:mm and formats it with `timeZone: "UTC"`, which is wrong for every non-UTC user including current Bogotá-side prospects. The new device-local formatter replaces it cleanly. |

### Out of scope

- Server-side changes to `/api/book/slots` and `/api/book/create`.
  The slot-window math stays Bogotá-anchored; the submit payload
  stays Bogotá day+slot. Future timezone-aware features (e.g.
  serving different working hours per region) are not in this
  plan.
- Any change to `samwise-app`'s in-product booking surface —
  there isn't one shipped yet. When it ships, it inherits this
  same pattern (call out in the spawned task).
- Changing the locale of `Intl.DateTimeFormat` calls. English
  users still get `en-US` style, Spanish users still get `es-CO`
  style. Only the `timeZone` argument is being swapped.
- Reduced-motion or accessibility changes. The existing CSS
  already handles those.
- Showing both timezones side-by-side on the month grid. The
  clarifier appears only on the Confirm step where it's load-
  bearing for the prospect to know what time it is on Samuel's
  side.

## Plan Architecture (Flow)

```
Today:
  page mount → GET /api/book/slots → { days: BogotáDay[], timeZone: "America/Bogota" }
  MonthGrid displays Bogotá days
  TimeSlots displays Bogotá HH:mm
  Confirm formats whenLabel as UTC (silent bug)
  onSubmit → POST /api/book/create { day, slot, ... } where day/slot are Bogotá-local

New:
  page mount → detect deviceTz once (Intl)
            → GET /api/book/slots → { days: BogotáDay[], timeZone: "America/Bogota" }
            → groupByLocalDay(serverDays, deviceTz) → LocalDay[]
  MonthGrid displays device-local days, tz name + offset shown
  TimeSlots displays device-local HH:mm
  Confirm formats whenLabel against deviceTz; clarifier shows Bogotá HH:mm
  onSubmit → POST /api/book/create { day: bogotaDay, slot: bogotaSlot, ... }
            (same Bogotá-canonical payload server expects)
```

## Plan Structure (Directories and files)

```
samwise-landing/app/book/
├── book-root.tsx       # detects deviceTz, transforms server → LocalDay[]
├── lib.ts              # NEW — bogotaSlotToLocal, groupByLocalDay,
│                       #       formatShortTimeZone
├── month-grid.tsx      # takes LocalDay[], shows deviceTz in sub-line
├── time-slots.tsx      # takes LocalSlot[], displays localHHmm
├── confirm.tsx         # device-local whenLabel + Bogotá clarifier
├── done.tsx            # unchanged
├── book.css            # one new rule: .book-tz-bogota-clarifier
└── page.tsx            # unchanged
```

## Modifications (in phases and steps)

### Phase 1 / Step 1 — Create `app/book/lib.ts`

- **In-file location:** new file at `samwise-landing/app/book/lib.ts`.
- **Should not be modified:** nothing else in this step.
- **Code:**
  ```ts
  // Pure client-side transforms between the server's Bogotá-canonical
  // slot data and the user's device-local display. Server contract is
  // unchanged: the API returns { days: [{ day: YYYY-MM-DD, slots:
  // ["HH:mm", ...] }] } in America/Bogota; we re-key by device-local
  // day and pre-format the device-local HH:mm. Every LocalSlot carries
  // its original Bogotá day/slot so the submit payload stays canonical.

  import type { DaySlots } from "./book-root"

  // Colombia has no DST, fixed UTC-5.
  const BOGOTA_OFFSET = "-05:00"

  export interface LocalSlot {
    /** Server-canonical YYYY-MM-DD (Bogotá-local) — sent back on submit. */
    bogotaDay: string
    /** Server-canonical HH:mm (Bogotá-local) — sent back on submit. */
    bogotaSlot: string
    /** YYYY-MM-DD in the device tz. */
    localDay: string
    /** HH:mm (24h) in the device tz — display only. */
    localHHmm: string
    /** UTC ms — stable sort key. */
    startMs: number
  }

  export interface LocalDay {
    /** YYYY-MM-DD in the device tz. */
    localDay: string
    slots: LocalSlot[]
  }

  export function bogotaSlotToLocal(args: {
    bogotaDay: string
    bogotaSlot: string
    deviceTz: string
  }): LocalSlot {
    const iso = `${args.bogotaDay}T${args.bogotaSlot}:00${BOGOTA_OFFSET}`
    const startMs = new Date(iso).getTime()
    const start = new Date(startMs)

    // en-CA gives "YYYY-MM-DD" — stable across browsers.
    const dayFmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: args.deviceTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    const localDay = dayFmt.format(start)

    // en-GB + hour12:false guarantees "HH:mm".
    const timeFmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: args.deviceTz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    const localHHmm = timeFmt.format(start)

    return {
      bogotaDay: args.bogotaDay,
      bogotaSlot: args.bogotaSlot,
      localDay,
      localHHmm,
      startMs,
    }
  }

  export function groupByLocalDay(
    serverDays: DaySlots[],
    deviceTz: string,
  ): LocalDay[] {
    const byLocalDay = new Map<string, LocalSlot[]>()

    for (const sd of serverDays) {
      for (const bogotaSlot of sd.slots) {
        const local = bogotaSlotToLocal({
          bogotaDay: sd.day,
          bogotaSlot,
          deviceTz,
        })
        const bucket = byLocalDay.get(local.localDay) ?? []
        bucket.push(local)
        byLocalDay.set(local.localDay, bucket)
      }
    }

    // Sort slot lists by startMs; sort days by their first slot.
    const result: LocalDay[] = []
    for (const [localDay, slots] of byLocalDay) {
      slots.sort((a, b) => a.startMs - b.startMs)
      result.push({ localDay, slots })
    }
    result.sort((a, b) => a.slots[0]!.startMs - b.slots[0]!.startMs)
    return result
  }

  /**
   * Short, human-friendly form of the tz: "GMT-5" / "EST" / "CET" /
   * etc. Falls back to the raw IANA name if Intl can't resolve a
   * short form for the given zone.
   */
  export function formatShortTimeZone(deviceTz: string): string {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: deviceTz,
        timeZoneName: "short",
      }).formatToParts(new Date())
      const part = parts.find((p) => p.type === "timeZoneName")
      return part?.value ?? deviceTz
    } catch {
      return deviceTz
    }
  }
  ```
- **Explanation:** Pure functions, no side effects. The transformer
  uses the fixed Bogotá offset (Colombia has no DST so this is safe;
  the existing server code at `samwise-app/lib/book/availability.ts`
  uses the same hardcoded `-05:00`). `en-CA` + 2-digit + numeric is
  the cross-browser-stable way to get `YYYY-MM-DD` out of `Intl`.
  `en-GB` + `hour12: false` is the cross-browser-stable way to get
  `HH:mm`. `groupByLocalDay` handles the cross-midnight case: a Tokyo
  user looking at a 6 AM Bogotá slot sees it on the previous local
  day, transparently.

### Phase 1 / Step 2 — Rewire `book-root.tsx`

- **In-file location:** `samwise-landing/app/book/book-root.tsx`.
- **Should not be modified:** the API URLs, the `getSlotsUrl` /
  `getCreateUrl` helpers, the `BookingResult` shape, the JSX
  structure of the header / stage.
- **Code:**
  ```tsx
  "use client"

  import { useEffect, useState } from "react"
  import type { Lang } from "@/lib/qualify/strings"
  import { MonthGrid } from "./month-grid"
  import { TimeSlots } from "./time-slots"
  import { Confirm } from "./confirm"
  import { Done } from "./done"
  import {
    groupByLocalDay,
    type LocalDay,
    type LocalSlot,
  } from "./lib"
  import "./book.css"

  export interface DaySlots {
    day: string
    slots: string[]
  }

  export interface SlotsResponse {
    days: DaySlots[]
    timeZone: string
  }

  export interface BookingResult {
    calEventId: string
    scheduledFor: string
    joinUrl: string
  }

  type View =
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "month"; days: LocalDay[] }
    | { kind: "slots"; days: LocalDay[]; localDay: string }
    | {
        kind: "confirm"
        days: LocalDay[]
        slot: LocalSlot
      }
    | { kind: "done"; result: BookingResult }

  function getSlotsUrl(): string {
    const base = process.env.NEXT_PUBLIC_SAMWISE_APP_URL
    if (!base) return "http://localhost:3000/api/book/slots"
    return `${base.replace(/\/$/, "")}/api/book/slots`
  }

  function getCreateUrl(): string {
    const base = process.env.NEXT_PUBLIC_SAMWISE_APP_URL
    if (!base) return "http://localhost:3000/api/book/create"
    return `${base.replace(/\/$/, "")}/api/book/create`
  }

  function detectDeviceTz(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch {
      return "America/Bogota"
    }
  }

  export function BookRoot({ lang }: { lang: Lang }) {
    const [deviceTz] = useState<string>(detectDeviceTz)
    const [view, setView] = useState<View>({ kind: "loading" })

    useEffect(() => {
      let cancelled = false
      ;(async () => {
        try {
          const res = await fetch(getSlotsUrl(), { method: "GET" })
          if (!res.ok) {
            const body = (await res.json().catch(() => ({}))) as {
              error?: string
            }
            throw new Error(body.error ?? `slots failed (${res.status})`)
          }
          const data = (await res.json()) as SlotsResponse
          if (cancelled) return
          const localDays = groupByLocalDay(data.days, deviceTz)
          setView({ kind: "month", days: localDays })
        } catch (err) {
          if (cancelled) return
          setView({
            kind: "error",
            message:
              err instanceof Error ? err.message : "Could not load availability",
          })
        }
      })()
      return () => {
        cancelled = true
      }
    }, [deviceTz])

    const headerBackHref = "/"

    return (
      <main className="book-root" lang={lang}>
        <header className="book-header">
          <a
            href={headerBackHref}
            className="book-brand"
            aria-label="Samwise"
          >
            Samwise
            <span className="book-brand-star" aria-hidden="true">
              ✦
            </span>
          </a>
        </header>

        <section className="book-stage">
          {view.kind === "loading" && (
            <p className="book-status">
              {lang === "es" ? "Cargando…" : "Loading…"}
            </p>
          )}

          {view.kind === "error" && (
            <div className="book-error-block">
              <p className="book-lead">
                {lang === "es" ? "Algo salió mal." : "Something went wrong."}
              </p>
              <p className="book-sub">{view.message}</p>
            </div>
          )}

          {view.kind === "month" && (
            <MonthGrid
              lang={lang}
              days={view.days}
              deviceTz={deviceTz}
              onSelectDay={(localDay) =>
                setView({ kind: "slots", days: view.days, localDay })
              }
            />
          )}

          {view.kind === "slots" && (
            <TimeSlots
              lang={lang}
              localDay={view.localDay}
              slots={
                view.days.find((d) => d.localDay === view.localDay)?.slots ??
                []
              }
              deviceTz={deviceTz}
              onBack={() => setView({ kind: "month", days: view.days })}
              onSelectSlot={(slot) =>
                setView({ kind: "confirm", days: view.days, slot })
              }
            />
          )}

          {view.kind === "confirm" && (
            <Confirm
              lang={lang}
              slot={view.slot}
              deviceTz={deviceTz}
              onBack={() =>
                setView({
                  kind: "slots",
                  days: view.days,
                  localDay: view.slot.localDay,
                })
              }
              onSubmit={async ({ name, email }) => {
                const res = await fetch(getCreateUrl(), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    day: view.slot.bogotaDay,
                    slot: view.slot.bogotaSlot,
                    name,
                    email,
                    language: lang,
                  }),
                })
                if (!res.ok) {
                  const body = (await res.json().catch(() => ({}))) as {
                    error?: string
                  }
                  throw new Error(
                    body.error ?? `booking failed (${res.status})`,
                  )
                }
                const result = (await res.json()) as BookingResult
                setView({ kind: "done", result })
              }}
            />
          )}

          {view.kind === "done" && <Done lang={lang} result={view.result} />}
        </section>
      </main>
    )
  }
  ```
- **Explanation:** Three meaningful diffs from today's file:
  - Detect `deviceTz` once via a `useState` initializer (stable for
    the session; reading `Intl` on every render is wasteful and
    pointless).
  - After `fetch`, run `groupByLocalDay` immediately. Downstream
    components never see raw server data.
  - On submit, send `slot.bogotaDay` + `slot.bogotaSlot` (preserved
    on the `LocalSlot`) so the server side is untouched.

### Phase 1 / Step 3 — Update `month-grid.tsx`

- **In-file location:** `samwise-landing/app/book/month-grid.tsx`.
- **Should not be modified:** the 6×7 grid math (`buildGridCells`,
  `firstOfMonth`, `monthLabel`), the weekday header, the
  `book-month-nav` arrow logic.
- **Code (diff-ish — only the load-bearing parts):**
  ```tsx
  import type { LocalDay } from "./lib"
  import { formatShortTimeZone } from "./lib"

  interface MonthGridProps {
    lang: Lang
    days: LocalDay[]
    deviceTz: string
    onSelectDay: (localDay: string) => void
  }

  const STRINGS = {
    en: {
      lead: "Pick a day.",
      sub: (tz: string) => `Times shown in your local time (${tz}).`,
      // ...other strings unchanged
    },
    es: {
      lead: "Elige un día.",
      sub: (tz: string) => `Horas en tu hora local (${tz}).`,
      // ...other strings unchanged
    },
  } as const

  export function MonthGrid({ lang, days, deviceTz, onSelectDay }: MonthGridProps) {
    const s = STRINGS[lang]
    const availableSet = useMemo(
      () => new Set(days.map((d) => d.localDay)),
      [days],
    )
    const firstAvailable = days[0]?.localDay
    // ...rest unchanged, just s/d.day/d.localDay/ everywhere

    const shortTz = formatShortTimeZone(deviceTz)

    return (
      <div className="book-month">
        <div className="book-month-head">
          <p className="book-lead">{s.lead}</p>
          <p className="book-sub">{s.sub(shortTz)}</p>
        </div>
        {/* ...rest of JSX unchanged, except the cell onClick passes the localDay */}
      </div>
    )
  }
  ```
- **Explanation:** Only the prop shape, the `sub` string, and the
  field name `day → localDay` change. The grid math itself stays.

### Phase 1 / Step 4 — Update `time-slots.tsx`

- **In-file location:** `samwise-landing/app/book/time-slots.tsx`.
- **Should not be modified:** the `dayLabel` formatter (it operates
  on a YYYY-MM-DD string + builds a UTC date — works the same for
  the device-local day key), the visual `.book-slot` markup.
- **Code (load-bearing parts):**
  ```tsx
  import type { LocalSlot } from "./lib"

  interface TimeSlotsProps {
    lang: Lang
    localDay: string
    slots: LocalSlot[]
    deviceTz: string
    onBack: () => void
    onSelectSlot: (slot: LocalSlot) => void
  }

  function timeLabel(localHHmm: string, lang: Lang): string {
    const [h, m] = localHHmm.split(":").map(Number)
    if (lang === "es") {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    }
    const period = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${h12}:${String(m).padStart(2, "0")} ${period}`
  }

  // In JSX:
  //   slots.map((slot) => (
  //     <li key={slot.startMs}>
  //       <button onClick={() => onSelectSlot(slot)} ...>
  //         <span ...>{timeLabel(slot.localHHmm, lang)}</span>
  //       </button>
  //     </li>
  //   ))
  ```
- **Explanation:** `localHHmm` is already device-local. The
  `dayLabel` function operating on `localDay` is fine — it
  formats a calendar date with no timezone involved (the date
  parts are taken as-is from the YYYY-MM-DD string).

### Phase 1 / Step 5 — Update `confirm.tsx`

- **In-file location:** `samwise-landing/app/book/confirm.tsx`.
- **Should not be modified:** the form structure, the validation
  rules, the email regex, the submit button.
- **Code (load-bearing parts):**
  ```tsx
  import type { LocalSlot } from "./lib"

  interface ConfirmProps {
    lang: Lang
    slot: LocalSlot
    deviceTz: string
    onBack: () => void
    onSubmit: (args: { name: string; email: string }) => Promise<void>
  }

  // Format the slot's absolute UTC ms against the device tz.
  function whenLabel(slot: LocalSlot, deviceTz: string, lang: Lang): string {
    return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
      timeZone: deviceTz,
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: lang === "en",
    }).format(new Date(slot.startMs))
  }

  // Small Bogotá clarifier, shown only when the device tz isn't already Bogotá.
  function bogotaClarifier(
    slot: LocalSlot,
    deviceTz: string,
    lang: Lang,
  ): string | null {
    if (deviceTz === "America/Bogota") return null
    const bogotaHHmm = formatBogotaHHmm(slot, lang)
    return lang === "es"
      ? `Samuel está en Bogotá — ${bogotaHHmm} allá.`
      : `Samuel is in Bogotá — ${bogotaHHmm} there.`
  }

  function formatBogotaHHmm(slot: LocalSlot, lang: Lang): string {
    const [h, m] = slot.bogotaSlot.split(":").map(Number)
    if (lang === "es") {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    }
    const period = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${h12}:${String(m).padStart(2, "0")} ${period}`
  }

  // In JSX, replace the existing whenLabel call:
  //   <p className="book-sub">{whenLabel(slot, deviceTz, lang)}</p>
  //   {bogotaClarifier(slot, deviceTz, lang) && (
  //     <p className="book-tz-bogota-clarifier">
  //       {bogotaClarifier(slot, deviceTz, lang)}
  //     </p>
  //   )}
  ```
- **Explanation:** Fixes the existing UTC bug (today's `whenLabel`
  formats the slot with `timeZone: "UTC"`, which renders 14:00
  Bogotá as 14:00 UTC = wrong everywhere except for users whose
  device tz happens to be UTC). New version uses the slot's
  `startMs` (the actual UTC instant) and formats it against the
  device tz. Clarifier line only renders for non-Bogotá users.

### Phase 1 / Step 6 — `book.css` clarifier rule

- **In-file location:** `samwise-landing/app/book/book.css`, after
  the existing `.book-sub` rule.
- **Should not be modified:** every other rule in the file.
- **Code:**
  ```css
  .book-tz-bogota-clarifier {
    font-family: var(--font-fraunces, Georgia, serif);
    font-style: italic;
    font-size: 0.8125rem; /* half-step down from .book-sub */
    color: #6b6b6b;
    margin-top: 4px;
  }
  ```
- **Explanation:** Matches the register of `.book-sub` but
  visually subordinate so the local-time line stays primary.
  Italic Fraunces aligns with the existing editorial register
  on `/book`.

### Testing phase

- **Local test (golden path):**
  1. Run the dev server: `pnpm --filter samwise-landing dev` (port
     3001 if 3000 is taken by `samwise-app`).
  2. Visit `/book?lang=en`. Confirm month grid shows the user's
     local days, the sub-line reads "Times shown in your local
     time (GMT-5)" (or whatever the local short tz is), and slot
     HH:mm matches what the user would expect for their tz.
  3. Pick a slot. Confirm screen reads e.g. "Wednesday, May 28,
     10:00 AM" in local time + the Bogotá clarifier underneath.
  4. Submit. Verify (a) the booking succeeds, (b) the Firestore
     record + Google Calendar event are created at the correct
     Bogotá-local time (the original day + slot the user picked,
     converted through Bogotá).
  5. Test Spanish: `/book?lang=es`. Confirm the sub-line reads
     "Horas en tu hora local (GMT-5)" + the clarifier reads
     "Samuel está en Bogotá — 10:00 AM allá."
- **Local test (timezone variation):**
  6. In Chrome DevTools, override the timezone to `Asia/Tokyo`.
     Reload `/book`. The sub-line should now read `(GMT+9)`,
     slot times should be Tokyo-local, and at least one Bogotá
     6 AM slot (Bogotá 6 AM = Tokyo 8 PM previous day) should
     appear on the previous local day in the month grid.
  7. Repeat with `Europe/Berlin` to validate next-day spillover
     in the other direction (Bogotá 5:30 PM = Berlin 12:30 AM
     next day).
  8. Repeat with `America/Bogota` — verify the clarifier line
     does NOT render, since deviceTz === Bogotá.
- **Integration test:** N/A — server contract is unchanged. Smoke
  test against the deployed `samwise-app` API is sufficient.
- **Update README:** N/A for the landing page (no README in
  `app/book`).

### After implementation

- **Update `context-for-code-agent.md`:** add an entry under the
  `app/book` section documenting (a) the device-tz auto-detect
  pattern, (b) that the server contract stays Bogotá-canonical,
  (c) the `lib.ts` helpers as the canonical place for any future
  tz-related transforms.
- **Mark task DONE in master Vibe doc Projects tab:** manual user
  step.

---

# Companion task — Demo Call Phase 17 (live referral reach-out)

> This task lives in the Demo Call Doc, NOT in any code file. It is
> tracked here because it was bundled with the calendar plan in the
> same user request, and so the next session can see both pieces
> together until they ship.

## Plan Summary

Replace Phase 17's per-name data-extraction loop (why / willingness /
blocker / how-can-we-help) with a per-name **live-reach-out** loop.
The prospect either reaches out to the referral in the call, on the
highest available medium (phone > voice note > text), OR we cleanly
let that name go. No follow-up dates, no "I'll message them later."
The shape mirrors Phase 12's close-or-no policy: single explicit
invitation, silence, accept yes or no with equal dignity, no second
pitch.

Phase 16 (R/T/A/G that lands on names) stays unchanged.

Persuasion is driven by the negotiation skill techniques:
**accusation audit** to disarm the awkwardness (Beat 1),
**calibrated question** to surface the highest medium (Beat 2),
**label + no-oriented ask** to give the prospect both safety to
refuse AND the felt-sense that they're arriving at the yes
themselves (Beat 3), then a clean YES/NO branch (Beat 4).

The prep doc (`before_the_call.md`, Drive id
`14ZNKJu-g7MqWrVE6akZWLz3fBTI-6Atnt6TvZYR-V30`) gets a coordinated
sweep per the propagation rule.

## Doc edits

### Edit 1 — Demo Call Doc, Phase 17 replacement

Replace the existing Phase 17 (per-name 4-question loop + the open
"how we can help" item + the rep-improvises close) with the new
4-beat live-reach-out loop. Full new phase content drafted in this
plan's appendix below; copy verbatim into the Doc.

### Edit 2 — Demo Call Doc, Phase 16 housekeeping

Tiny touch on Phase 16's **Guide** beat — the existing close line
on Guide currently says "for each name surfaced... run the 4-question
loop." Update the trailing sentence so it points to the new live
reach-out loop instead.

### Edit 3 — `before_the_call.md`, Section 0

Update the "two valid outcomes" list to reflect the still_disqualified
branch's two valid outcomes:
  - (a) at least one live referral reach-out completed in this call,
  - (b) a clean dignity close with no referral homework.

### Edit 4 — `before_the_call.md`, Section 3i (mandatory beats)

Add a paragraph for Phase 17's live-or-let-it-go policy. The
failure mode the rep is filtering for: the rep's own instinct to
soften the policy by promising a callback later. That softening is
what produces the long-tail of referrals that never happen.

### Edit 5 — `before_the_call.md`, Section 1 (pre-call setup)

Add one line to the logistics checklist for still_disqualified
prospects: "Be ready to host a 30s–2min hand-off — Phase 17 may
result in a live call to a referral. If you're brought in mid-call,
introduce yourself briefly with Phase 1's framing."

## Drafted Phase 17 content (verbatim to paste into the Doc)

```markdown
## Phase 17 — Rebound: live referral reach-out (one name at a time)

[CONDITION: fit_state=still_disqualified]

**Goal:** For each name surfaced in Phase 16's Guide beat, run a
four-beat live-reach-out loop. The prospect either reaches out to the
referral **in this call**, on the highest available medium (phone >
voice note > text), OR we cleanly let that name go. No follow-up
dates. No "I'll send them a message later." The rule: if it doesn't
happen now, it doesn't count.

⚠️ Frame this as a kindness to the prospect, never as a rule we are
enforcing on them. Carrying referral outreach as homework is the kind
of thing that hangs over a person for weeks and almost never gets
done with the energy that exists in this call. We are giving them the
option to either do it right now while the recognition is fresh OR
let it go. Both are honest. What we don't do is leave them with a
list.

☞ Mirror the close-or-no policy from Phase 12. Single explicit
invitation per name, silence, accept yes or no with equal dignity,
no second pitch, no chasing. The register is the same as the Borrero
exit in Phase 13: *we are not chasing them.*

### Beat 1 — Frame the policy as a kindness (accusation audit, run ONCE at the top)

☞ Set the frame before the first name so the shape of what's coming
is on the table. Run this once, not before every name. This is also
the accusation-audit move: by naming the awkwardness ("you probably
think I'm about to give you homework") before the prospect does, the
register stays trust-direction instead of pressure-direction.

[SAY] Antes de arrancar con los nombres, quiero proponerte el formato — y prefiero que lo escuches antes para que después no haya sorpresas.

Lo que de verdad funciona con las referencias es cuando se hacen ahora, en caliente, mientras vos y yo seguimos en la misma línea. Lo que no funciona — y prefiero ser honesto en eso — es llevarte una lista de personas a las que escribirles después. Eso casi siempre termina siendo una carga que se queda colgando, no una conexión que se hace.

Entonces lo que te propongo es esto: por cada persona que mencionaste, vemos juntos cuál sería la forma más fuerte de hablarle, y si te late, la contactás ahora conmigo en la línea. Si para alguno sentís que no es el momento, lo dejamos pasar sin culpa y seguimos con el siguiente. ¿Te suena? [/SAY]

☞ Wait for explicit "sí" before moving to the first name. If the
prospect declines the whole frame — i.e. they're not willing to do
ANY live reach-out — do NOT push. Skip directly to "After all names"
below. The policy is voluntary; the second the rep starts pushing,
the register breaks.

### Beat 2 — Calibrated question on the highest medium (per name)

☞ Goal: the prospect proposes the medium themselves. Do NOT name
"phone call" first — that turns this into a sales ask and triggers
defense. Lead with an open, calibrated question and let the answer
surface.

[SAY] Empezamos con [Nombre]. ¿Cuál es la forma más fuerte que tenés de hablarle a esta persona? [/SAY]

☞ Tactical silence. At least 4 full seconds. Do not fill it.

☞ If they propose a phone call directly → move to Beat 3.

☞ If they propose a text / WhatsApp message → mirror gently with
upward inflection, then a follow-up calibrated question that opens
the door to voice without pressuring:

[SAY] ¿Un mensaje? [/SAY]

[SAY] ¿Y si fuera algo importante de verdad — algo que no querés que se te malinterprete — cómo le hablarías? [/SAY]

☞ If the prospect shifts to a voice note or a call after that
calibrated question, that's the answer. If they hold to text, accept
it — a text on the spot still counts as live reach-out. The bar is
"happens in this call," not "must be a phone call."

### Beat 3 — Label + no-oriented ask

☞ Now name the obvious move as a **label** (not as an ask):

[SAY] Parece que el momento más honesto para hacer esto es ahora — mientras lo tenés fresco, y mientras yo estoy en la línea para que no tengas que explicar todo solo. [/SAY]

☞ Brief pause. Then the no-oriented ask — phrased so refusing is
easy and face-saving:

[SAY] ¿Sería una locura intentarlo ahora? [/SAY]

⚠️ **Tactical silence after this question.** At least 4 full seconds.
This is the load-bearing pause of the whole phase. Do NOT fill it.
The prospect either gives some version of "no, vamos" → Beat 4a, or
some version of "ahora no" → Beat 4b. Both are clean. Filling the
silence is what turns this into a sales close.

### Beat 4a — YES: walk it through live

☞ The prospect agreed. Your job now is to make the live outreach
feel low-friction. Give them ownership of the words — the line they
say must be theirs.

[SAY] Genial. Antes de marcar — ¿qué le decís? ¿Cómo le presentás esto? [/SAY]

☞ Let them draft the line in their own voice. Don't ghostwrite. If
they ask for help: offer one short framing in their register, then
hand it back. If the line isn't theirs it won't land on the other
side.

☞ When the prospect is ready, they make the call (or send the
message) live. While they're on the line with the referral, stay
quiet on your end — no script-coaching mid-call, no whispered cues.
If the prospect brings you in as a hand-off, introduce yourself
briefly and use Phase 1's framing (30 minutes, evaluation direction,
what we do).

☞ When they finish:

[SAY] Gracias por hacerlo. ¿Cómo te sentiste? [/SAY]

**Capture into {{rep_notes}}:** for this name — `name | medium |
outcome (connected / left message / declined) | any follow-up the
referral themselves asked for`.

☞ Move to the next name. Repeat from Beat 2 — do NOT re-run Beat 1.

### Beat 4b — NO: dignity exit on this name

☞ The prospect declined to reach out now. Accept it cleanly. NO
second pitch. NO "are you sure." NO scheduling a callback to do it
later.

⚠️ Resist the urge to soften the policy. *"OK, no te preocupes,
mandale un mensaje después y nos avisás"* is exactly what we are NOT
doing — it's the failure mode this whole phase exists to prevent.
The referral closes here, dignified, with the prospect's autonomy
intact.

[SAY] Está perfecto. Esa la dejamos pasar. [/SAY]

**Mark in {{rep_notes}}:** this name = declined, do not follow up.

☞ Move directly to the next name. Repeat from Beat 2 — do NOT re-run
Beat 1.

### After all names

☞ Whether the loop produced live reach-outs or not, close the same
way. Same register as Phase 12's "no" close — warm, dignified, no
chasing.

[SAY] Gracias por la conversación, [nombre del prospecto]. La puerta queda abierta — si en algún momento esto cambia para vos, sabés dónde encontrarme. [/SAY]

**Mark outcome = disqualified. Note in {{rep_notes}}:** which names
reached out live, which were declined, anything noteworthy about how
the referral conversations went. Do NOT set per-referral follow-up
dates — the policy is that referrals close in this call.
```

## After implementation

- Update `context-for-code-agent.md` for the script repo equivalent
  (script work uses Google Docs; no in-repo state). The
  `samwise-script-work` skill itself may need a short addition
  noting "Phase 17 is now a live-reach-out loop, not a data-
  capture loop" — the user can add that to the skill memory if it
  proves load-bearing across future sessions.
- Mark task DONE in master Vibe doc Projects tab: manual user step.
