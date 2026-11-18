import { createHash, randomBytes, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { query, toId } from "@/lib/v2/db"
import { MAC_RELEASE, MAC_UPDATE_URL } from "./release"

/**
 * Server side of Samwise for Mac (the check-in alarm in mac/).
 *
 * A Mac is connected to one Samwise account by a device token. The token is shown to the
 * Mac once and only its SHA-256 is stored (mac_devices.token_hash). Everything a token can
 * read or change is scoped to its own user id.
 *
 * What a connected Mac may do: read its user's check-in times, today's check-in state,
 * their own opening words and open tasks (GET /api/mac/config), tick one of those tasks,
 * and report what the alarm did (POST /api/mac/events). Nothing else.
 */

/** Shown on the alarm so a missed call can be returned. Same number as the calls and the chat. */
export const SAMWISE_NUMBER = "+1 507 920 1622"
/** Minutes between a missed check-in call and the call to trusted people (Call Ended Handler). */
export const GRACE_MINUTES = 30

/** Every answer may carry personal words, so none of them may be cached anywhere. */
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } })
}

export function refuse(message: string, status = 400) {
  return json({ error: message }, status)
}

export function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex")
}

export function sameText(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function digitsOf(v: unknown): string {
  return typeof v === "string" ? v.replace(/\D/g, "").slice(0, 20) : ""
}

/** Pairing codes are typed by hand: case, dashes and spaces do not matter, and O/I/L read as 0/1/1. */
export function cleanPairCode(v: unknown): string {
  if (typeof v !== "string") return ""
  return v
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1")
    .slice(0, 32)
}

function text(v: unknown, max: number, pattern: RegExp): string | null {
  if (typeof v !== "string") return null
  const t = v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max)
  return t && pattern.test(t) ? t : null
}

export type DeviceInfo = {
  installId: string | null
  deviceName: string | null
  appVersion: string | null
  osVersion: string | null
}

export function deviceInfo(body: Record<string, unknown>): DeviceInfo {
  return {
    installId: text(body.install_id, 64, /^[A-Za-z0-9-]+$/),
    deviceName: text(body.device_name, 80, /./),
    appVersion: text(body.app_version, 20, /^[0-9A-Za-z.+-]+$/),
    osVersion: text(body.os_version, 20, /^[0-9A-Za-z.+-]+$/),
  }
}

export type Device = { id: number; userId: number }

/**
 * The Mac behind this request, or null. Also notes that the Mac was just seen, and the version it
 * names in its User-Agent, so an app updated in place shows its new version before it reports any event.
 */
export async function deviceFromRequest(req: Request): Promise<Device | null> {
  const header = (req.headers.get("authorization") ?? "").trim()
  const m = /^Bearer\s+(swm_[A-Za-z0-9_-]{43})$/.exec(header)
  if (!m) return null
  const [row] = await query<{ id: string; user_id: string }>(
    `UPDATE mac_devices SET last_seen_at = now(), app_version = COALESCE($2, app_version)
     WHERE token_hash = $1 AND revoked_at IS NULL
     RETURNING id, user_id`,
    [sha256(m[1]), appVersionFromRequest(req)],
  )
  return row ? { id: toId(row.id), userId: toId(row.user_id) } : null
}

/**
 * Connects a Mac to a user and returns its new token. Connecting the same install again
 * replaces its old token, and a user keeps at most five connected Macs (the oldest go).
 */
export async function connectDevice(userId: number, info: DeviceInfo): Promise<{ token: string; device: Device }> {
  const token = "swm_" + randomBytes(32).toString("base64url")
  const [row] = await query<{ id: string }>(
    `WITH gone AS (
       UPDATE mac_devices SET revoked_at = now()
       WHERE user_id = $1 AND revoked_at IS NULL AND install_id IS NOT NULL AND install_id = $3
     )
     INSERT INTO mac_devices (user_id, token_hash, install_id, device_name, app_version, os_version, last_seen_at)
     VALUES ($1, $2, $3, $4, $5, $6, now())
     RETURNING id`,
    [userId, sha256(token), info.installId, info.deviceName, info.appVersion, info.osVersion],
  )
  await query(
    `UPDATE mac_devices SET revoked_at = now()
     WHERE user_id = $1 AND revoked_at IS NULL
       AND id NOT IN (SELECT id FROM mac_devices WHERE user_id = $1 AND revoked_at IS NULL ORDER BY id DESC LIMIT 5)`,
    [userId],
  )
  return { token, device: { id: toId(row.id), userId } }
}

/** The Samwise user with this WhatsApp number. A number typed without its country code still matches when only one account ends with it. */
export async function userByPhoneDigits(digits: string): Promise<{
  id: number; name: string; phone: string; language: string; timezone: string
} | null> {
  if (digits.length < 8 || digits.length > 15) return null
  const rows = await query<{ id: string; name: string; phone: string; language: string; timezone: string }>(
    `SELECT id, name, phone, COALESCE(language, 'en') AS language, COALESCE(timezone, 'America/Bogota') AS timezone
     FROM users
     WHERE regexp_replace(phone, '[^0-9]', '', 'g') = $1
        OR (length($1) >= 10 AND right(regexp_replace(phone, '[^0-9]', '', 'g'), length($1)) = $1)
     ORDER BY (regexp_replace(phone, '[^0-9]', '', 'g') = $1) DESC, (COALESCE(role, 'user') = 'clinician'), id
     LIMIT 2`,
    [digits],
  )
  if (rows.length === 0) return null
  const exact = rows[0].phone.replace(/\D/g, "") === digits
  if (!exact && rows.length > 1) return null
  const r = rows[0]
  return { id: toId(r.id), name: r.name, phone: r.phone, language: r.language, timezone: r.timezone }
}

// ── What the Mac shows ──────────────────────────────────────────────────────

type Push = "morning" | "midday" | "night"

type ConfigRow = {
  u: {
    name: string
    language: string
    tz: string
    doc_id: string | null
    doc_tabs: Record<string, string> | null
    texts: Record<string, string> | null
  } | null
  trusted: boolean
  checkins: { time: string; push: Push }[]
  slots: {
    id: string
    done: boolean
    done_source: string | null
    will_call: boolean
    call_placed: boolean
    call_open: boolean
    call_missed: boolean
    call_unfinished: boolean
    tell_at: string | null
    told_at: string | null
  }[]
  tasks: { id: number; title: string; detail: string | null }[]
}

/**
 * The person's own opening words for a time of day: what they wrote before the first heading of
 * their written ritual. The text comes from users.ritual_text_cache, which numbers each part as
 * "N. Heading (note)". Only part 1 is used, and only when it is the opening.
 */
export function openingWords(textOfPush: string | null | undefined): string | null {
  if (!textOfPush) return null
  const lines = textOfPush.split(/\r?\n/)
  let start = -1
  let end = lines.length
  for (let i = 0; i < lines.length; i++) {
    if (start === -1) {
      const first = /^1\.\s+(.*)$/.exec(lines[i])
      if (!first) continue
      if (!/opening statement|before the first heading/i.test(first[1])) return null
      start = i + 1
    } else if (/^\d+\.\s+.*\)\s*$/.test(lines[i])) {
      end = i
      break
    }
  }
  if (start === -1) return null
  let body = lines.slice(start, end).join("\n").replace(/\n{3,}/g, "\n\n").trim()
  if (!body) return null
  if (body.length > 900) {
    const cut = body.slice(0, 900)
    const stop = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(". "))
    body = (stop > 500 ? cut.slice(0, stop + 1) : cut).trim() + " …"
  }
  return body
}

function docUrl(docId: string | null, tab?: string | null): string | null {
  if (!docId || !/^[A-Za-z0-9_-]{20,}$/.test(docId)) return null
  const base = `https://docs.google.com/document/d/${docId}/edit`
  return tab && /^[A-Za-z0-9._-]+$/.test(tab) ? `${base}?tab=${tab}` : base
}

/** The app's version as it names itself on every request: "Samwise-Mac/1.0.4". */
export function appVersionFromRequest(req: Request): string | null {
  const m = /^Samwise-Mac\/([0-9A-Za-z.+-]{1,20})$/.exec((req.headers.get("user-agent") ?? "").trim())
  return m ? m[1] : null
}

/** From 1.0.4 on, the app tells the person when Samwise is about to tell the trusted people. Older apps cannot. */
export function warnsBeforeAlert(appVersion: string | null): boolean {
  const m = /^(\d{1,4})\.(\d{1,4})\.(\d{1,4})/.exec(appVersion ?? "")
  if (!m) return false
  const [major, minor, patch] = [Number(m[1]), Number(m[2]), Number(m[3])]
  return major > 1 || (major === 1 && (minor > 0 || patch >= 4))
}

/**
 * Everything the alarm needs for one user, in one query.
 *
 * It mirrors how Samwise decides about a check-in call (n8n "Ritual Call Dispatch"):
 * - the time of day ("push") is morning before 11:00, midday before 18:00, night after;
 * - a morning or midday call is skipped when a written entry for that time of day already
 *   exists that day (ritual_entries), so that check-in is done; the night close always calls;
 * - no call is placed for a user without active trusted people;
 * - calls are queued at 00:01 Bogota, so a time added later that day gets no call that day.
 * A check-in counts as done by phone when a check-in call was answered (30 s or more, or the
 * person called in) from 10 minutes before the time up to 4 hours after, that call did not end
 * by booking a callback, and Samwise counts it: not rated negative and not scored under 5. That
 * last part is the rule by which n8n "Call Ended Handler" and "Support Call Dispatcher" decide to
 * tell the trusted people. Until 1.0.4 it was missing here, so the Mac could say "Check-in done."
 * after a call that Samwise then told the trusted people about.
 *
 * For such a call, and for a call nobody answered, `tell_at` is when the trusted people are told:
 * the dispatcher runs 30 minutes after the call's result, and the result comes 5 minutes after
 * the call ends, so it is the end of the call plus 35 minutes (measured over 98 alerts: 13 s
 * later at the median, 39 s at most), or the dispatcher's 18:00 backup run when that is earlier.
 * It is only given while that is still ahead and nothing has settled it: a later call that
 * counts, the person calling in, or a written entry.
 * `call_open` is true from the moment Samwise's call is placed until its result is saved, so the
 * Mac can stay quiet while the person is on the phone.
 * Whenever `tell_at` is given, either `call_missed` (nobody picked up at the check-in time) or
 * `call_unfinished` (any other call that does not count) is true, so the Mac always has a reason
 * to show with the time.
 *
 * `appVersion` is the app's own version, from its User-Agent. For an app that knows the warning
 * (1.0.4 on), each time it is told that an alert is ahead a mark `alert_ahead_sent` is kept, so
 * the daily Health Check can see a Mac that was told in time and never told the person.
 */
export async function loadConfig(device: Device, appVersion: string | null = null) {
  const [row] = await query<ConfigRow>(
    `WITH u AS (
       SELECT id, name, COALESCE(language, 'en') AS language, COALESCE(timezone, 'America/Bogota') AS tz,
              ritual_doc_id, ritual_doc_tabs, ritual_text_cache
       FROM users WHERE id = $1
     ), trusted AS (
       SELECT EXISTS (SELECT 1 FROM support_contacts c WHERE c.user_id = $1 AND c.active) AS yes
     ), sched AS (
       SELECT s.call_time, s.created_at,
         CASE WHEN extract(hour FROM s.call_time) < 11 THEN 'morning'
              WHEN extract(hour FROM s.call_time) < 18 THEN 'midday' ELSE 'night' END AS push
       FROM call_schedules s WHERE s.user_id = $1 AND s.active
     ), slot0 AS (
       SELECT to_char(d.day, 'YYYY-MM-DD') || 'T' || to_char(s.call_time, 'HH24:MI') AS id,
         d.day::date AS local_date, s.push, s.created_at,
         ((to_char(d.day, 'YYYY-MM-DD') || ' ' || s.call_time::text)::timestamp AT TIME ZONE u.tz) AS due_at
       FROM u CROSS JOIN sched s
       CROSS JOIN LATERAL generate_series(
         ((now() AT TIME ZONE u.tz)::date - 1)::timestamp,
         ((now() AT TIME ZONE u.tz)::date + 1)::timestamp, interval '1 day') AS d(day)
     ), slot AS (
       -- A call belongs to the check-in it follows: never to an earlier one once the next has come.
       SELECT s0.*, lead(s0.due_at) OVER (ORDER BY s0.due_at) AS next_due FROM slot0 s0
     ), calls AS (
       -- The person's check-in calls, judged the way the Support Call Dispatcher judges them.
       SELECT l.call_id, l.called_at, l.direction, l.status, l.call_success,
         COALESCE(l.duration_seconds, 0) AS secs,
         EXISTS (SELECT 1 FROM ritual_callbacks cb WHERE cb.source_call_id = l.call_id) AS booked,
         COALESCE(l.call_success = false OR l.sentiment = 'negative' OR l.score < 5, false) AS bad,
         COALESCE(l.call_success AND COALESCE(l.sentiment, '') <> 'negative' AND (l.score IS NULL OR l.score >= 5), false) AS good
       FROM call_logs l
       WHERE l.user_id = $1 AND l.call_type = 'ritual' AND l.called_at > now() - interval '3 days'
     ), pending AS (
       -- Calls the trusted people are still going to be told about, with the time that happens:
       -- the end of the call plus 35 minutes, or the dispatcher's 18:00 Bogota backup run when that
       -- comes first (it covers calls placed 15:00 to 17:30 whose result is in by then).
       SELECT c.called_at,
         LEAST(c.ended_at + interval '35 minutes',
               CASE WHEN c.called_at BETWEEN bk.at - interval '3 hours' AND bk.at - interval '30 minutes'
                     AND c.ended_at + interval '6 minutes' <= bk.at THEN bk.at END) AS tell_at
       FROM (SELECT c0.*, c0.called_at + make_interval(secs => c0.secs::double precision) AS ended_at FROM calls c0) c
       CROSS JOIN LATERAL (
         SELECT (((c.called_at AT TIME ZONE 'America/Bogota')::date + time '18:00') AT TIME ZONE 'America/Bogota') AS at) bk
       WHERE c.bad AND NOT c.booked
         AND NOT EXISTS (SELECT 1 FROM calls g WHERE g.called_at > c.called_at AND g.good)
         AND NOT EXISTS (SELECT 1 FROM calls i WHERE i.called_at > c.called_at AND i.direction = 'inbound')
         AND NOT EXISTS (SELECT 1 FROM ritual_entries e
                         WHERE e.user_id = $1 AND e.created_at > c.called_at - interval '3 hours')
         AND NOT EXISTS (SELECT 1 FROM call_logs s
                         WHERE s.user_id = $1 AND s.call_type = 'support' AND s.called_at >= c.called_at)
     ), facts AS (
       SELECT sl.*,
         EXISTS (SELECT 1 FROM ritual_entries r
                 WHERE r.user_id = $1 AND r.push = sl.push AND r.local_date = sl.local_date) AS entry_exists,
         EXISTS (SELECT 1 FROM call_logs l
                 WHERE l.user_id = $1 AND l.call_type = 'ritual' AND l.direction IS DISTINCT FROM 'inbound'
                   AND l.called_at BETWEEN sl.due_at - interval '2 minutes' AND sl.due_at + interval '15 minutes') AS call_placed,
         EXISTS (SELECT 1 FROM call_logs l
                 WHERE l.user_id = $1 AND l.call_type = 'ritual' AND l.direction IS DISTINCT FROM 'inbound'
                   AND l.called_at BETWEEN sl.due_at - interval '2 minutes' AND sl.due_at + interval '15 minutes'
                   AND l.call_success = false) AS call_failed,
         EXISTS (SELECT 1 FROM call_logs l
                 WHERE l.user_id = $1 AND l.call_type = 'ritual' AND l.direction IS DISTINCT FROM 'inbound'
                   AND l.called_at BETWEEN sl.due_at - interval '2 minutes' AND sl.due_at + interval '15 minutes'
                   AND l.status IS NULL AND l.called_at > now() - interval '90 minutes') AS call_open,
         EXISTS (SELECT 1 FROM calls c
                 WHERE c.good AND NOT c.booked AND (c.secs >= 30 OR c.direction = 'inbound')
                   AND c.called_at >= sl.due_at - interval '10 minutes' AND c.called_at < sl.due_at + interval '4 hours') AS reached,
         EXISTS (SELECT 1 FROM calls c
                 WHERE c.bad AND c.call_success AND NOT c.booked
                   AND c.called_at >= sl.due_at - interval '10 minutes' AND c.called_at < sl.due_at + interval '4 hours'
                   AND (sl.next_due IS NULL OR c.called_at < sl.next_due - interval '10 minutes')) AS answered_bad,
         (SELECT min(p.tell_at) FROM pending p
          WHERE p.called_at >= sl.due_at - interval '10 minutes' AND p.called_at < sl.due_at + interval '4 hours'
            AND (sl.next_due IS NULL OR p.called_at < sl.next_due - interval '10 minutes')) AS tell_at,
         (SELECT min(s.called_at) FROM call_logs s
          WHERE s.user_id = $1 AND s.call_type = 'support' AND s.called_at < sl.due_at + interval '6 hours'
            AND s.called_at >= (SELECT min(c.called_at) FROM calls c
                                WHERE c.bad AND NOT c.booked
                                  AND c.called_at >= sl.due_at - interval '10 minutes' AND c.called_at < sl.due_at + interval '4 hours'
                                  AND (sl.next_due IS NULL OR c.called_at < sl.next_due - interval '10 minutes'))) AS told_at
       FROM slot sl
     ), seen AS (
       -- One mark per Mac and check-in when the Mac asks at check-in time: proof it was on and online then.
       -- The daily Health Check compares these marks with what the Mac said it showed.
       INSERT INTO mac_app_events (user_id, device_id, kind, occurrence, at)
       SELECT $1, $2, 'seen', f.id, f.due_at FROM facts f
       WHERE now() >= f.due_at AND now() < f.due_at + interval '10 minutes'
       ON CONFLICT (device_id, kind, occurrence, at) DO NOTHING
     ), sent AS (
       -- One mark per Mac, check-in and alert when Samwise tells the Mac that the trusted people are going
       -- to be told: proof the Mac knew in time (received_at says when). The daily Health Check compares
       -- these marks with what the Mac said it showed ('alert_ahead_seen', 'call_missed_seen').
       INSERT INTO mac_app_events (user_id, device_id, kind, occurrence, at)
       SELECT $1, $2, 'alert_ahead_sent', f.id, f.tell_at FROM facts f
       WHERE $3::boolean AND (SELECT yes FROM trusted) AND NOT f.reached AND f.tell_at > now()
       ON CONFLICT (device_id, kind, occurrence, at) DO NOTHING
     )
     SELECT
       (SELECT jsonb_build_object('name', name, 'language', language, 'tz', tz, 'doc_id', ritual_doc_id,
                                  'doc_tabs', ritual_doc_tabs, 'texts', ritual_text_cache) FROM u) AS u,
       (SELECT yes FROM trusted) AS trusted,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('time', to_char(call_time, 'HH24:MI'), 'push', push) ORDER BY call_time)
                 FROM sched), '[]'::jsonb) AS checkins,
       COALESCE((SELECT jsonb_agg(jsonb_build_object(
           'id', f.id,
           'done', ((f.push <> 'night' AND f.entry_exists) OR f.reached),
           'done_source', CASE WHEN f.reached THEN 'call' WHEN f.push <> 'night' AND f.entry_exists THEN 'written' END,
           'will_call', ((SELECT yes FROM trusted) AND NOT (f.push <> 'night' AND f.entry_exists)
                         AND f.created_at < ((f.due_at AT TIME ZONE 'America/Bogota')::date::timestamp AT TIME ZONE 'America/Bogota') + interval '1 minute'),
           'call_placed', f.call_placed,
           'call_open', (f.call_open AND NOT f.reached),
           'call_missed', (f.call_failed AND NOT f.reached AND NOT f.answered_bad),
           'call_unfinished', (NOT f.reached AND (f.answered_bad
                               OR (NOT f.call_failed AND (SELECT yes FROM trusted) AND COALESCE(f.tell_at > now(), false)))),
           'tell_at', CASE WHEN (SELECT yes FROM trusted) AND NOT f.reached AND f.tell_at > now()
                           THEN to_char(f.tell_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') END,
           'told_at', to_char(f.told_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
         ) ORDER BY f.id) FROM facts f), '[]'::jsonb) AS slots,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('id', t.id, 'title', t.title, 'detail', t.detail) ORDER BY t.sort, t.id)
                 FROM user_tasks t WHERE t.user_id = $1 AND t.status = 'open'), '[]'::jsonb) AS tasks`,
    [device.userId, device.id, warnsBeforeAlert(appVersion)],
  )
  if (!row?.u) return null

  const u = row.u
  const texts = u.texts ?? {}
  const checkins = row.checkins.map((c) => {
    const words = openingWords(texts[c.push] ?? texts.midday ?? texts.morning ?? texts.night)
    return {
      time: c.time,
      // An empty title: these are the person's own words, and Samwise does not name them.
      words: words ? [{ title: "", body: words }] : [],
      journal_url: docUrl(u.doc_id, u.doc_tabs?.[c.push]),
    }
  })

  return {
    user: { first_name: u.name.trim().split(/\s+/)[0] ?? "", language: u.language, timezone: u.tz },
    checkins,
    slots: row.slots,
    tasks: row.tasks.map((t) => ({ id: Number(t.id), title: t.title, detail: t.detail ?? "" })),
    support: { active: row.trusted, grace_minutes: GRACE_MINUTES },
    journal_url: docUrl(u.doc_id),
    samwise_number: SAMWISE_NUMBER,
    latest_version: MAC_RELEASE.version,
    download_url: MAC_UPDATE_URL,
    show_words_right_away: false,
  }
}
