import { query } from "@/lib/v2/db"
import { readJson, handleError } from "@/lib/v2/http"
import { deviceFromRequest, deviceInfo, json, refuse } from "@/lib/mac/server"

export const dynamic = "force-dynamic"

const KIND = /^[a-z][a-z_]{0,39}$/
const OCCURRENCE = /^[A-Za-z0-9:T_-]{0,40}$/
const WEEK = 7 * 24 * 3600 * 1000

/**
 * What the alarm did on a connected Mac: shown, typed line, snoozed, skipped, done, and so on.
 * Only event names, the check-in they belong to and small counters. Never what was typed,
 * read or said. These rows are how Samwise notices an alarm that did not show.
 */
export async function POST(req: Request) {
  try {
    const device = await deviceFromRequest(req)
    if (!device) return refuse("This Mac is not connected", 401)

    const body = await readJson(req)
    const list = body.events
    if (!Array.isArray(list)) return refuse("events must be a list")
    if (list.length > 100) return refuse("Too many events in one request", 413)

    const now = Date.now()
    const rows: { kind: string; occurrence: string; detail: Record<string, string>; at: string }[] = []
    for (const item of list) {
      if (!item || typeof item !== "object") continue
      const e = item as Record<string, unknown>
      if (typeof e.kind !== "string" || !KIND.test(e.kind) || e.kind === "seen") continue
      const occurrence = typeof e.occurrence === "string" && OCCURRENCE.test(e.occurrence) ? e.occurrence : ""
      const detail: Record<string, string> = {}
      if (e.detail && typeof e.detail === "object" && !Array.isArray(e.detail)) {
        for (const [k, v] of Object.entries(e.detail as Record<string, unknown>).slice(0, 8)) {
          if (/^[a-z_]{1,30}$/.test(k) && (typeof v === "string" || typeof v === "number")) detail[k] = String(v).slice(0, 60)
        }
      }
      const t = typeof e.at === "string" ? Date.parse(e.at) : NaN
      const at = Number.isFinite(t) && Math.abs(now - t) < WEEK ? new Date(t) : new Date(now)
      rows.push({ kind: e.kind, occurrence, detail, at: at.toISOString() })
    }

    let saved = 0
    if (rows.length > 0) {
      const inserted = await query<{ id: string }>(
        `INSERT INTO mac_app_events (user_id, device_id, kind, occurrence, detail, at)
         SELECT $1, $2, r.kind, r.occurrence, r.detail, r.at
         FROM jsonb_to_recordset($3::jsonb) AS r(kind text, occurrence text, detail jsonb, at timestamptz)
         ON CONFLICT (device_id, kind, occurrence, at) DO NOTHING
         RETURNING id`,
        [device.userId, device.id, JSON.stringify(rows)],
      )
      saved = inserted.length
    }

    const info = deviceInfo(body)
    if (info.appVersion || info.osVersion || info.deviceName) {
      await query(
        `UPDATE mac_devices SET app_version = COALESCE($2, app_version), os_version = COALESCE($3, os_version),
                device_name = COALESCE($4, device_name)
         WHERE id = $1`,
        [device.id, info.appVersion, info.osVersion, info.deviceName],
      )
    }
    return json({ ok: true, saved })
  } catch (err) {
    return handleError(err)
  }
}
