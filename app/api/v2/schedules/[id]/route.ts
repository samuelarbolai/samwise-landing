import { updateSchedule, deleteSchedule } from "@/lib/v2/queries"
import { requireSessionUserId } from "@/lib/v2/session"
import { ok, fail, readJson, handleError } from "@/lib/v2/http"
import { isHHMM, toPgTime } from "@/lib/v2/validate"

type Ctx = { params: Promise<{ id: string }> }

function parseId(raw: string): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const userId = await requireSessionUserId()
    const id = parseId((await params).id)
    if (id === null) return fail("Not found", 404)

    const { call_time, active } = await readJson(req)
    const fields: { call_time?: string; active?: boolean } = {}

    if (call_time !== undefined) {
      if (!isHHMM(call_time)) return fail("Call time must be a valid 24h time, e.g. 07:30")
      fields.call_time = toPgTime(call_time)
    }
    if (active !== undefined) {
      if (typeof active !== "boolean") return fail("`active` must be true or false")
      fields.active = active
    }

    const schedule = await updateSchedule(userId, id, fields)
    // Rows owned by another user match nothing — indistinguishable from missing.
    if (!schedule) return fail("Not found", 404)
    return ok({ schedule })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireSessionUserId()
    const id = parseId((await params).id)
    if (id === null) return fail("Not found", 404)

    if (!(await deleteSchedule(userId, id))) return fail("Not found", 404)
    return ok({ ok: true })
  } catch (err) {
    return handleError(err)
  }
}
