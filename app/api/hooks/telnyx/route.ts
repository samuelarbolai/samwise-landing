// Telnyx posts every messaging event to the profile webhook, including the sent and
// delivered notices for each message Samwise sends. Every request that reaches n8n
// counts against its monthly execution quota, so this route forwards only incoming
// messages (WhatsApp and SMS) to n8n "Samwise WhatsApp Chat".
const CHAT_HOOK = "https://samuelgiraldoconcha.app.n8n.cloud/webhook/telnyx-whatsapp"
const FORWARDED_TYPES = new Set(["message.received"])
const FORWARDED_HEADERS = ["telnyx-signature-ed25519", "telnyx-timestamp", "webhook-id", "webhook-signature", "webhook-timestamp"]

export async function POST(req: Request) {
  const raw = await req.text()
  let type: unknown
  try {
    type = (JSON.parse(raw) as { data?: { event_type?: unknown } }).data?.event_type
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 })
  }
  if (typeof type !== "string" || !FORWARDED_TYPES.has(type)) {
    return Response.json({ ok: true, forwarded: false })
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  for (const name of FORWARDED_HEADERS) {
    const value = req.headers.get(name)
    if (value) headers[name] = value
  }
  const res = await fetch(CHAT_HOOK, {
    method: "POST",
    headers,
    body: raw,
    signal: AbortSignal.timeout(15000),
  }).catch(() => null)

  // A non-2xx makes Telnyx retry the incoming message, which is what we want if n8n was down.
  if (!res?.ok) return Response.json({ ok: false, forwarded: false }, { status: 502 })
  return Response.json({ ok: true, forwarded: true })
}
