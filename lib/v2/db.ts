import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

// Lazy so a missing DATABASE_URL fails at request time, not at build time.
let _sql: NeonQueryFunction<false, false> | null = null

export function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("DATABASE_URL is not set")
    _sql = neon(url)
  }
  return _sql
}

/**
 * Postgres int8/bigint arrives as a STRING, because bigint can exceed
 * Number.MAX_SAFE_INTEGER. Every id in this schema is an identity column
 * counting from 1, so Number is safe — and leaving it a string silently
 * breaks anything comparing an id to a number (it once produced a session
 * JWT carrying uid:"5", which then failed every auth check).
 *
 * The driver's `types` option cannot fix this globally: `neon()` destructures
 * a fixed option list and ignores `types` at construction, accepting it only
 * per-query. So ids are coerced here, at the edge of every read.
 */
export function toId(v: unknown): number {
  return Number(v)
}

export function toNullableId(v: unknown): number | null {
  return v === null || v === undefined ? null : Number(v)
}

/**
 * Every value reaches Postgres as a bound $n parameter — either through
 * Neon's tagged template or through this helper. No caller in lib/v2 or
 * app/api/v2 concatenates a value into SQL text.
 */
export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const rows = await getSql().query(text, params)
  return rows as T[]
}

/**
 * Builds `col = $n` fragments for a dynamic UPDATE. Keys are literal column
 * names supplied by our own code (never request data); values stay bound.
 */
export function buildSetClause(
  fields: Record<string, unknown>,
  startIndex = 1,
): { clause: string; values: unknown[] } {
  const keys = Object.keys(fields)
  return {
    clause: keys.map((k, i) => `${k} = $${startIndex + i}`).join(", "),
    values: keys.map((k) => fields[k]),
  }
}
