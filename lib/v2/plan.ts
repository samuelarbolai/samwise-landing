import { query } from "./db"

/**
 * A clinician's plan: a few questions a clinician would like a patient's check-in call to ask.
 * The invite link is samwise.life/p/<code>. The patient decides on each question in the chat.
 */
const CODE = /^[a-z0-9]{4,16}$/

export function cleanPlanCode(v: unknown): string | null {
  if (typeof v !== "string") return null
  const c = v.trim().toLowerCase()
  return CODE.test(c) ? c : null
}

export type PlanInvite = { code: string; name: string; clinician: string; questions: string[] }

export async function getPlanInvite(code: unknown): Promise<PlanInvite | null> {
  const c = cleanPlanCode(code)
  if (!c) return null
  const [row] = await query<{ code: string; name: string; clinician: string; questions: string[] | null }>(
    `SELECT p.code, p.name, u.name AS clinician,
            (SELECT array_agg(q.text ORDER BY q.position) FROM clinician_plan_questions q WHERE q.plan_id = p.id AND q.active) AS questions
     FROM clinician_plans p JOIN users u ON u.id = p.clinician_id
     WHERE p.code = $1 AND p.status = 'active'`,
    [c],
  )
  return row ? { code: row.code, name: row.name, clinician: row.clinician, questions: row.questions ?? [] } : null
}
