import { destroySession } from "@/lib/v2/session"
import { ok, handleError } from "@/lib/v2/http"

export async function POST() {
  try {
    await destroySession()
    return ok({ ok: true })
  } catch (err) {
    return handleError(err)
  }
}
