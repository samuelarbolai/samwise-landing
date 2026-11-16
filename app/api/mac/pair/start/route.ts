import { randomInt } from "node:crypto"
import { after } from "next/server"
import { query } from "@/lib/v2/db"
import { readJson, handleError } from "@/lib/v2/http"
import { PHONE_CODE_HOOK } from "@/lib/v2/phone"
import { digitsOf, json, pause, refuse, userByPhoneDigits } from "@/lib/mac/server"

export const dynamic = "force-dynamic"

/**
 * Connect a Mac, step 1 of 2: sends a 6-digit code to the WhatsApp number of an existing
 * Samwise account. It reuses the sign-up code path (phone_codes + n8n "Samwise Phone Code"),
 * with the same limits per number (one code per 30 seconds, five per hour, sign-up codes
 * included) plus six Mac codes per day. Each code is one WhatsApp message and one n8n run.
 *
 * The answer is the same whether or not the number has an account, and so is the time it
 * takes. Having a Samwise account is private (it says something about a person's recovery),
 * so this endpoint must not tell a stranger which numbers have one. That is also why a
 * number over its limit gets the same answer: nothing new is sent, and the last code still
 * works until it expires.
 */
export async function POST(req: Request) {
  try {
    const { phone } = await readJson(req)
    const digits = digitsOf(phone)
    if (digits.length < 8 || digits.length > 15) {
      return refuse("Enter your WhatsApp number with the country code, like +57 300 123 4567")
    }

    const started = Date.now()
    const user = await userByPhoneDigits(digits)
    if (user) {
      const [recent] = await query<{ last_30s: number; last_hour: number; mac_last_day: number }>(
        `SELECT count(*) FILTER (WHERE created_at > now() - interval '30 seconds')::int AS last_30s,
                count(*) FILTER (WHERE created_at > now() - interval '1 hour')::int AS last_hour,
                count(*) FILTER (WHERE src = 'mac-app')::int AS mac_last_day
         FROM phone_codes WHERE phone = $1 AND created_at > now() - interval '24 hours'`,
        [user.phone],
      )
      if (recent.last_30s === 0 && recent.last_hour < 5 && recent.mac_last_day < 6) {
        const code = String(randomInt(0, 1_000_000)).padStart(6, "0")
        // user_id and setup_done_at are set from the start: this is an existing account, not a sign-up in progress.
        const [row] = await query<{ id: string }>(
          `INSERT INTO phone_codes (phone, code, name, language, timezone, src, user_id, setup_done_at)
           VALUES ($1, $2, $3, $4, $5, 'mac-app', $6, now())
           RETURNING id`,
          [user.phone, code, user.name, user.language, user.timezone, user.id],
        )
        const id = Number(row.id)
        // The send is started here and finishes after the answer has gone out: waiting for it would
        // make the answer slower for real accounts, and that difference would give them away.
        // A failed send is saved on the row by n8n and reported by the daily Health Check (signup_code_not_sent).
        const send = fetch(PHONE_CODE_HOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action: "send" }),
          signal: AbortSignal.timeout(15000),
        })
          .then(async (res) => {
            const sent = res.ok ? ((await res.json().catch(() => ({}))) as { sent?: boolean }).sent : false
            if (!sent) console.error("[mac pair] code not sent for phone_codes id", id)
          })
          .catch(() => console.error("[mac pair] code hook not reached for phone_codes id", id))
        after(send)
      }
    }

    // Same answer and the same wait in every case.
    const floor = 1500 + randomInt(0, 700)
    const spent = Date.now() - started
    if (spent < floor) await pause(floor - spent)
    return json({ sent: true })
  } catch (err) {
    return handleError(err)
  }
}
