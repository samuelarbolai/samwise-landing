import { listContacts, createContact } from "@/lib/v2/queries"
import { requireSessionUserId } from "@/lib/v2/session"
import { ok, fail, readJson, handleError } from "@/lib/v2/http"
import { isE164, isLanguage, isName } from "@/lib/v2/validate"

const MAX_RELATIONSHIP = 60

export async function GET() {
  try {
    const userId = await requireSessionUserId()
    return ok({ contacts: await listContacts(userId) })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireSessionUserId()
    const { name, phone, relationship, language } = await readJson(req)

    if (!isName(name)) return fail("Enter the contact's name")
    if (!isE164(phone)) return fail("Phone must be in E.164 format, e.g. +573001234567")
    if (!isLanguage(language)) return fail("Select a supported call language")

    let rel: string | null = null
    if (relationship !== undefined && relationship !== null && relationship !== "") {
      if (typeof relationship !== "string" || relationship.trim().length > MAX_RELATIONSHIP) {
        return fail("Relationship is too long")
      }
      rel = relationship.trim()
    }

    // user_id comes from the session — a client-supplied one is ignored.
    const contact = await createContact(userId, { name, phone, relationship: rel, language })
    return ok({ contact }, 201)
  } catch (err) {
    return handleError(err)
  }
}
