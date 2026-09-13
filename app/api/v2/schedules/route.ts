import { listSchedules, createSchedule } from "@/lib/v2/queries"
import { requireSessionUserId } from "@/lib/v2/session"
import { ok, fail, readJson, handleError } from "@/lib/v2/http"
import { isHHMM, toPgTime } from "@/lib/v2/validate"

export async function GET() {
  try {
    const userId = await requireSessionUserId()
    return ok({ schedules: await listSchedules(userId) })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireSessionUserId()
    const { call_time } = await readJson(req)
    if (!isHHMM(call_time)) return fail("Call time must be a valid 24h time, e.g. 07:30")

    const schedule = await createSchedule(userId, toPgTime(call_time))
    return ok({ schedule }, 201)
  } catch (err) {
    return handleError(err)
  }
}
