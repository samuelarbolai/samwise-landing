import { createUser, emailExists, createSchedule, DuplicateEmailError } from "@/lib/v2/queries"
import { createSession } from "@/lib/v2/session"
import { ok, fail, readJson, handleError } from "@/lib/v2/http"
import {
  isE164,
  isEmail,
  isHHMM,
  isLanguage,
  isName,
  isPassword,
  isTimezone,
  toPgTime,
} from "@/lib/v2/validate"

export async function POST(req: Request) {
  try {
    const body = await readJson(req)
    const { name, phone, email, password, timezone, language, call_time } = body

    if (!isName(name)) return fail("Enter your name")
    if (!isE164(phone)) return fail("Phone must be in E.164 format, e.g. +573001234567")
    if (!isEmail(email)) return fail("Enter a valid email address")
    if (!isPassword(password)) return fail("Password must be at least 8 characters")
    if (!isTimezone(timezone)) return fail("Select a valid timezone")
    if (!isLanguage(language)) return fail("Select a supported call language")
    if (call_time !== undefined && call_time !== "" && !isHHMM(call_time)) {
      return fail("Call time must be a valid 24h time, e.g. 07:30")
    }

    if (await emailExists(email)) return fail("That email is already registered", 409)

    const user = await createUser({ name, phone, email, password, timezone, language })

    if (typeof call_time === "string" && isHHMM(call_time)) {
      await createSchedule(user.id, toPgTime(call_time))
    }

    await createSession(user.id)
    return ok({ user }, 201)
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return fail("That email is already registered", 409)
    }
    return handleError(err)
  }
}
