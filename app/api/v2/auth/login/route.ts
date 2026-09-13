import { verifyCredentials } from "@/lib/v2/queries"
import { createSession } from "@/lib/v2/session"
import { ok, fail, readJson, handleError } from "@/lib/v2/http"
import { isEmail } from "@/lib/v2/validate"

export async function POST(req: Request) {
  try {
    const { email, password } = await readJson(req)
    if (!isEmail(email) || typeof password !== "string" || !password) {
      return fail("Enter your email and password", 401)
    }

    const user = await verifyCredentials(email, password)
    // Same message for unknown email and wrong password — no account enumeration.
    if (!user) return fail("Email or password is incorrect", 401)

    await createSession(user.id)
    return ok({ user })
  } catch (err) {
    return handleError(err)
  }
}
