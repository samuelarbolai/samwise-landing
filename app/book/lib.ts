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
  /** UTC ms — stable sort key, used by Confirm's whenLabel. */
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

  // en-CA returns "YYYY-MM-DD" — stable across browsers.
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
