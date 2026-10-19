// Cartesia sends one webhook per conversation turn (call_turn) plus call_started,
// post_call_analysis and the end events, with no way to choose which. Every request
// that reaches n8n counts against its monthly execution quota, so this route drops
// everything except the end events that n8n "Call Ended Handler" acts on.
const CALL_ENDED_HOOK = "https://samuelgiraldoconcha.app.n8n.cloud/webhook/cartesia-call-eval"
const FORWARDED_TYPES = new Set(["call_completed", "call_failed"])

export async function POST(req: Request) {
  const raw = await req.text()
  let type: unknown
  try {
    type = (JSON.parse(raw) as { type?: unknown }).type
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 })
  }
  if (typeof type !== "string" || !FORWARDED_TYPES.has(type)) {
    return Response.json({ ok: true, forwarded: false })
  }

  const secret = req.headers.get("x-webhook-secret")
  const res = await fetch(CALL_ENDED_HOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(secret ? { "X-Webhook-Secret": secret } : {}) },
    body: raw,
    signal: AbortSignal.timeout(15000),
  }).catch(() => null)

  // A non-2xx makes Cartesia retry the end event, which is what we want if n8n was down.
  if (!res?.ok) return Response.json({ ok: false, forwarded: false }, { status: 502 })
  return Response.json({ ok: true, forwarded: true })
}
