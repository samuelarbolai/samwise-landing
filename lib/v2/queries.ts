import bcrypt from "bcryptjs"
import { getSql, query, buildSetClause, toId, toNullableId } from "./db"

const BCRYPT_ROUNDS = 12

// Every read goes through one of these so the `id: number` in the types above
// is true at runtime. See `toId` in ./db for why the driver can't do it.
const asUser = (r: PublicUser): PublicUser => ({ ...r, id: toId(r.id) })
const asSchedule = (r: Schedule): Schedule => ({ ...r, id: toId(r.id) })
const asContact = (r: SupportContact): SupportContact => ({ ...r, id: toId(r.id) })
const asCallLog = (r: CallLog): CallLog => ({
  ...r,
  id: toId(r.id),
  contact_id: toNullableId(r.contact_id),
})

export type PublicUser = {
  id: number
  name: string
  phone: string
  email: string | null
  timezone: string
  /** ISO 639-1 — the language the voice agent speaks to THIS user. */
  language: string
}

export type Schedule = {
  id: number
  call_time: string // HH:MM:SS — the user's local wall clock, never converted
  active: boolean
}

export type SupportContact = {
  id: number
  name: string
  phone: string
  relationship: string | null
  active: boolean
  /** ISO 639-1 — independent of the user's own language. */
  language: string
}

export type CallLog = {
  id: number
  call_id: string | null
  status: string | null
  end_reason: string | null
  call_success: boolean | null
  tts_ttfb: number | null
  // numeric columns come back as strings from the driver, to keep precision
  score: string | number | null
  sentiment: string | null
  goal_achieved: boolean | null
  summary: string | null
  called_at: string | null
  // 'ritual' = we called the user. Anything else is outreach placed on their
  // behalf, with contact_id naming the support contact who was phoned.
  call_type: string
  contact_id: number | null
  contact_name: string | null
}

export class DuplicateEmailError extends Error {
  constructor() {
    super("Email already registered")
    this.name = "DuplicateEmailError"
  }
}

// ─── users ───────────────────────────────────────────────────────────────

export async function emailExists(email: string): Promise<boolean> {
  const rows = await query<{ id: number }>(
    `SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1`,
    [email],
  )
  return rows.length > 0
}

export async function createUser(input: {
  name: string
  phone: string
  email: string
  password: string
  timezone: string
  language: string
}): Promise<PublicUser> {
  const hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
  try {
    // `id` is an identity column — never supplied here.
    const rows = await query<PublicUser>(
      `INSERT INTO users (name, phone, email, password_hash, timezone, language)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, phone, email, timezone, language`,
      [input.name.trim(), input.phone, input.email.trim(), hash, input.timezone, input.language],
    )
    return asUser(rows[0])
  } catch (err) {
    // users_email_key. The pre-check can be raced by a second concurrent
    // signup; signup is the paid-funnel conversion point, so this must land
    // as a clean 409 rather than a 500.
    if ((err as { code?: string }).code === "23505") throw new DuplicateEmailError()
    throw err
  }
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const rows = await query<PublicUser & { password_hash: string | null }>(
    `SELECT id, name, phone, email, timezone, language, password_hash
     FROM users WHERE lower(email) = lower($1) LIMIT 1`,
    [email],
  )
  const row = rows[0]
  if (!row?.password_hash) return null
  if (!(await bcrypt.compare(password, row.password_hash))) return null
  const { password_hash: _drop, ...user } = row
  return asUser(user)
}

export async function getUser(userId: number): Promise<PublicUser | null> {
  const rows = await query<PublicUser>(
    `SELECT id, name, phone, email, timezone, language FROM users WHERE id = $1`,
    [userId],
  )
  return rows[0] ? asUser(rows[0]) : null
}

export async function updateUser(
  userId: number,
  fields: Partial<Pick<PublicUser, "name" | "phone" | "timezone" | "language">>,
): Promise<PublicUser | null> {
  const clean: Record<string, unknown> = {}
  if (fields.name !== undefined) clean.name = fields.name.trim()
  if (fields.phone !== undefined) clean.phone = fields.phone
  if (fields.timezone !== undefined) clean.timezone = fields.timezone
  if (fields.language !== undefined) clean.language = fields.language
  if (Object.keys(clean).length === 0) return getUser(userId)

  const { clause, values } = buildSetClause(clean)
  const rows = await query<PublicUser>(
    `UPDATE users SET ${clause} WHERE id = $${values.length + 1}
     RETURNING id, name, phone, email, timezone, language`,
    [...values, userId],
  )
  return rows[0] ? asUser(rows[0]) : null
}

// ─── call_schedules ──────────────────────────────────────────────────────

export async function listSchedules(userId: number): Promise<Schedule[]> {
  const sql = getSql()
  const rows = (await sql`
    SELECT id, call_time, active FROM call_schedules
    WHERE user_id = ${userId} ORDER BY call_time ASC
  `) as Schedule[]
  return rows.map(asSchedule)
}

export async function createSchedule(userId: number, callTime: string): Promise<Schedule> {
  const sql = getSql()
  const rows = (await sql`
    INSERT INTO call_schedules (user_id, call_time)
    VALUES (${userId}, ${callTime}::time)
    RETURNING id, call_time, active
  `) as Schedule[]
  return asSchedule(rows[0])
}

export async function updateSchedule(
  userId: number,
  id: number,
  fields: { call_time?: string; active?: boolean },
): Promise<Schedule | null> {
  const clean: Record<string, unknown> = {}
  if (fields.call_time !== undefined) clean.call_time = fields.call_time
  if (fields.active !== undefined) clean.active = fields.active
  if (Object.keys(clean).length === 0) {
    const rows = await query<Schedule>(
      `SELECT id, call_time, active FROM call_schedules WHERE id = $1 AND user_id = $2`,
      [id, userId],
    )
    return rows[0] ? asSchedule(rows[0]) : null
  }

  const { clause, values } = buildSetClause(clean)
  // Ownership is enforced in the WHERE — a row belonging to another user
  // simply matches nothing and the caller returns 404.
  const rows = await query<Schedule>(
    `UPDATE call_schedules SET ${clause}
     WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}
     RETURNING id, call_time, active`,
    [...values, id, userId],
  )
  return rows[0] ? asSchedule(rows[0]) : null
}

export async function deleteSchedule(userId: number, id: number): Promise<boolean> {
  const rows = await query<{ id: number }>(
    `DELETE FROM call_schedules WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId],
  )
  return rows.length > 0
}

// ─── support_contacts ────────────────────────────────────────────────────
// People the service may phone when the user misses or struggles with their
// calls. `user_id` always comes from the session, never from the client.

export async function listContacts(userId: number): Promise<SupportContact[]> {
  const sql = getSql()
  const rows = (await sql`
    SELECT id, name, phone, relationship, active, language FROM support_contacts
    WHERE user_id = ${userId} ORDER BY id ASC
  `) as SupportContact[]
  return rows.map(asContact)
}

export async function createContact(
  userId: number,
  input: { name: string; phone: string; relationship?: string | null; language: string },
): Promise<SupportContact> {
  const sql = getSql()
  const rows = (await sql`
    INSERT INTO support_contacts (user_id, name, phone, relationship, language)
    VALUES (${userId}, ${input.name.trim()}, ${input.phone}, ${input.relationship ?? null}, ${input.language})
    RETURNING id, name, phone, relationship, active, language
  `) as SupportContact[]
  return asContact(rows[0])
}

export async function updateContact(
  userId: number,
  id: number,
  fields: {
    name?: string
    phone?: string
    relationship?: string | null
    active?: boolean
    language?: string
  },
): Promise<SupportContact | null> {
  const clean: Record<string, unknown> = {}
  if (fields.name !== undefined) clean.name = fields.name.trim()
  if (fields.phone !== undefined) clean.phone = fields.phone
  if (fields.relationship !== undefined) clean.relationship = fields.relationship
  if (fields.active !== undefined) clean.active = fields.active
  if (fields.language !== undefined) clean.language = fields.language
  if (Object.keys(clean).length === 0) {
    const rows = await query<SupportContact>(
      `SELECT id, name, phone, relationship, active, language FROM support_contacts
       WHERE id = $1 AND user_id = $2`,
      [id, userId],
    )
    return rows[0] ? asContact(rows[0]) : null
  }

  const { clause, values } = buildSetClause(clean)
  // Ownership lives in the WHERE — another user's row matches nothing.
  const rows = await query<SupportContact>(
    `UPDATE support_contacts SET ${clause}
     WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}
     RETURNING id, name, phone, relationship, active, language`,
    [...values, id, userId],
  )
  return rows[0] ? asContact(rows[0]) : null
}

export async function deleteContact(userId: number, id: number): Promise<boolean> {
  const rows = await query<{ id: number }>(
    `DELETE FROM support_contacts WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId],
  )
  return rows.length > 0
}

// ─── language_agents (READ-ONLY — never written by this app) ─────────────

/** ISO codes that currently have an active voice agent. */
export async function listActiveAgentLanguages(): Promise<string[]> {
  const sql = getSql()
  const rows = (await sql`
    SELECT language FROM language_agents WHERE active
  `) as { language: string }[]
  return rows.map((r) => r.language)
}

// ─── call_logs (read-only) ───────────────────────────────────────────────

export async function listCallLogs(userId: number, limit = 20): Promise<CallLog[]> {
  const sql = getSql()
  // The join is scoped to the same user_id as the log row, so a contact can
  // never be resolved across accounts even if contact_id were wrong.
  const rows = (await sql`
    SELECT cl.id, cl.call_id, cl.status, cl.end_reason, cl.call_success, cl.tts_ttfb,
           cl.score, cl.sentiment, cl.goal_achieved, cl.summary, cl.called_at,
           cl.call_type, cl.contact_id, sc.name AS contact_name
    FROM call_logs cl
    LEFT JOIN support_contacts sc
      ON sc.id = cl.contact_id AND sc.user_id = cl.user_id
    WHERE cl.user_id = ${userId}
    ORDER BY cl.called_at DESC NULLS LAST, cl.id DESC
    LIMIT ${limit}
  `) as CallLog[]
  return rows.map(asCallLog)
}
