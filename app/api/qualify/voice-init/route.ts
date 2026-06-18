import { AccessToken, AgentDispatchClient } from "livekit-server-sdk"

// Mints a LiveKit access token + creates an AgentDispatch for the
// qualification-agent worker. Called by the landing's voice room
// on mount.

const LIVEKIT_URL = process.env.LIVEKIT_URL!
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!
// The qualification conversation runs as a flow inside the existing
// `ritual-agent` worker (alongside `call` and `onboarding`). The flow
// is selected via dispatch metadata `flow: "qualification"`. No new
// LiveKit agent name to provision.
const AGENT_NAME = process.env.RITUAL_AGENT_NAME || "ritual-agent"

export const maxDuration = 30

function randomId(prefix: string): string {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return `${prefix}-${hex}`
}

function samwiseAppBase(): string {
  const base = process.env.NEXT_PUBLIC_SAMWISE_APP_URL
  return base ? base.replace(/\/$/, "") : "http://localhost:3000"
}

export async function POST(req: Request) {
  const { language, name, email, audience } = (await req.json()) as {
    language: "es" | "en"
    name: string
    email: string
    audience?: "user" | "therapist"
  }
  // Therapists run the mirrored `qualification-therapist` flow (different
  // opener + 4 questions + always-books close); everyone else runs the
  // default user qualification.
  const isTherapist = audience === "therapist"
  if (language !== "es" && language !== "en") {
    return Response.json({ error: "invalid language" }, { status: 400 })
  }
  const prospect_name = (name ?? "").trim()
  const prospect_email = (email ?? "").trim()
  if (!prospect_name) {
    return Response.json({ error: "name required" }, { status: 400 })
  }
  if (!prospect_email) {
    return Response.json({ error: "email required" }, { status: 400 })
  }

  const roomName = randomId("qualify")
  const identity = randomId("prospect")

  // Token grants the prospect Connect + publish/subscribe in this room.
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    ttl: 60 * 30, // 30 min — well past any reasonable session
  })
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })
  const token = await at.toJwt()

  // Fire the "qualifying session started" notification to Samuel in
  // parallel with the agent dispatch. Server-to-server; best-effort —
  // a notify failure must never block the prospect's session.
  const notifyPromise = fetch(`${samwiseAppBase()}/api/notify/qualify-start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: prospect_name, email: prospect_email, language }),
  }).catch((err) => {
    console.error("[voice-init] qualify-start notify failed", err)
  })

  // Dispatch the agent into this room with our metadata payload.
  const dispatch = new AgentDispatchClient(
    LIVEKIT_URL.replace(/^wss?:\/\//, "https://"),
    LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET,
  )
  await dispatch.createDispatch(roomName, AGENT_NAME, {
    metadata: JSON.stringify(
      isTherapist
        ? {
            flow: "qualification-therapist",
            language,
            prospect_name,
            prospect_email,
          }
        : {
            flow: "qualification",
            language,
            persona: "nova",
            prospect_name,
            prospect_email,
          },
    ),
  })

  // Ensure the notify request is flushed before the serverless function
  // returns (un-awaited fetches can be dropped on Vercel). Already caught.
  await notifyPromise

  return Response.json({
    token,
    url: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    roomName,
  })
}
