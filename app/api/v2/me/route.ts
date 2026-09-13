import { getUser, updateUser } from "@/lib/v2/queries"
import { requireSessionUserId } from "@/lib/v2/session"
import { ok, fail, readJson, handleError } from "@/lib/v2/http"
import { isE164, isLanguage, isName, isTimezone } from "@/lib/v2/validate"

export async function GET() {
  try {
    const userId = await requireSessionUserId()
    const user = await getUser(userId)
    if (!user) return fail("Account not found", 404)
    return ok({ user })
  } catch (err) {
    return handleError(err)
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await requireSessionUserId()
    const { name, phone, timezone, language } = await readJson(req)

    const fields: { name?: string; phone?: string; timezone?: string; language?: string } = {}
    if (name !== undefined) {
      if (!isName(name)) return fail("Enter your name")
      fields.name = name
    }
    if (phone !== undefined) {
      if (!isE164(phone)) return fail("Phone must be in E.164 format, e.g. +573001234567")
      fields.phone = phone
    }
    if (timezone !== undefined) {
      if (!isTimezone(timezone)) return fail("Select a valid timezone")
      fields.timezone = timezone
    }
    if (language !== undefined) {
      if (!isLanguage(language)) return fail("Select a supported call language")
      fields.language = language
    }

    const user = await updateUser(userId, fields)
    if (!user) return fail("Account not found", 404)
    return ok({ user })
  } catch (err) {
    return handleError(err)
  }
}
