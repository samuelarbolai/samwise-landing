import { updateContact, deleteContact } from "@/lib/v2/queries"
import { requireSessionUserId } from "@/lib/v2/session"
import { ok, fail, readJson, handleError } from "@/lib/v2/http"
import { isE164, isLanguage, isName } from "@/lib/v2/validate"

const MAX_RELATIONSHIP = 60

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

    const { name, phone, relationship, active, language } = await readJson(req)
    const fields: {
      name?: string
      phone?: string
      relationship?: string | null
      active?: boolean
      language?: string
    } = {}

    if (name !== undefined) {
      if (!isName(name)) return fail("Enter the contact's name")
      fields.name = name
    }
    if (phone !== undefined) {
      if (!isE164(phone)) return fail("Phone must be in E.164 format, e.g. +573001234567")
      fields.phone = phone
    }
    if (relationship !== undefined) {
      if (relationship === null || relationship === "") {
        fields.relationship = null
      } else if (typeof relationship !== "string" || relationship.trim().length > MAX_RELATIONSHIP) {
        return fail("Relationship is too long")
      } else {
        fields.relationship = relationship.trim()
      }
    }
    if (active !== undefined) {
      if (typeof active !== "boolean") return fail("`active` must be true or false")
      fields.active = active
    }
    if (language !== undefined) {
      if (!isLanguage(language)) return fail("Select a supported call language")
      fields.language = language
    }

    const contact = await updateContact(userId, id, fields)
    if (!contact) return fail("Not found", 404)
    return ok({ contact })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const userId = await requireSessionUserId()
    const id = parseId((await params).id)
    if (id === null) return fail("Not found", 404)

    if (!(await deleteContact(userId, id))) return fail("Not found", 404)
    return ok({ ok: true })
  } catch (err) {
    return handleError(err)
  }
}
