import { after } from "next/server"
import {
  convertToModelMessages,
  streamText,
  tool,
  type UIMessage,
} from "ai"
import { propagateAttributes } from "@langfuse/tracing"
import { langfuseSpanProcessor } from "@/instrumentation"
import { buildQualificationPrompt } from "@/lib/qualify/qualification-prompt"
import {
  EndCallArgsSchema,
  SetVariablesArgsSchema,
} from "@/lib/qualify/schema"

// Text-mode fallback for /qualify. Voice mode is the primary path
// (LiveKit room + ritual-agent's flows/qualification worker); this route
// runs only when the user clicked "I'd rather type".
//
// Mirrors the voice flow's tool surface:
//   - setVariables: live notes — the chat client observes tool calls in
//     the streamed parts and updates <VariablesPanel> in real time. The
//     execute returns nothing useful, only acknowledgement; the UI keys
//     off the tool's INPUT (which has the values the agent committed).
//   - endCall: signals the user's conversation is done. Inside execute
//     we build the transcript from the request's `messages`, POST it to
//     the extractQualification cloud function (same path as voice mode's
//     submitIfNotYet), and return the outcome so the chat client can swap
//     to <FinalScreen>.
//
// Why fire extraction inside the tool execute (vs. from the client after
// stream completion):
//   - The tool runs server-side where the messages and env vars already
//     live. Doing it from the client would require a second round-trip
//     POST + auth + risk loss if the user closes the tab.
//   - We DO lose the assistant's closing-line text from the transcript
//     (it streams AFTER endCall fires). The extraction LLM doesn't need
//     the goodbye line to produce structured fields; acceptable tradeoff.

const EXTRACT_QUALIFICATION_URL = process.env.EXTRACT_QUALIFICATION_URL

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, language, name, email, sessionId } =
    (await req.json()) as {
      messages: UIMessage[]
      language: "es" | "en"
      name: string
      email: string
      sessionId?: string
    }
  const prospectName = (name ?? "").trim() || "friend"
  const prospectEmail = (email ?? "").trim()
  const langfuseUserId = prospectEmail || prospectName

  const system = buildQualificationPrompt(language, prospectName, "text")

  const modelMessages = await convertToModelMessages(messages)
  const result = await propagateAttributes(
    {
      ...(sessionId ? { sessionId } : {}),
      userId: langfuseUserId,
    },
    async () =>
      streamText({
        model: "google/gemini-2.5-flash",
        system,
        messages: modelMessages,
        experimental_telemetry: {
          isEnabled: true,
          functionId: "qualify-chat",
          metadata: {
            language,
            prospectEmail,
            prospectName,
          },
        },
        tools: {
          setVariables: tool({
            description:
              "Write to your notes — the user sees these appear on screen as poster-style cards. Each parameter is a variable; supply only the ones you have a verbatim user quote for in this turn. Calls overwrite, so you can update a value later if the user clarifies. Multiple variables can be committed in a single call.",
            inputSchema: SetVariablesArgsSchema,
            execute: async (updates) => {
              // The chat client renders the panel from the tool call's
              // INPUT (observed in the stream), not from the output. We
              // still return the committed names so it's visible in
              // Langfuse traces what landed where.
              const committed = Object.entries(updates)
                .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
                .map(([k]) => k)
              return { committed }
            },
          }),

          endCall: tool({
            description:
              "Signal that the conversation is complete. You MUST write your closing line BEFORE calling this. Takes no arguments. After this returns, the conversation ends and the extraction system processes the transcript.",
            inputSchema: EndCallArgsSchema,
            execute: async () => {
              if (!EXTRACT_QUALIFICATION_URL) {
                console.warn("[qualify-chat] EXTRACT_QUALIFICATION_URL not set — skipping extraction")
                return { ok: false, outcome: "disqualified" as const }
              }
              const transcript = messagesToTranscript(messages)
              try {
                const resp = await fetch(EXTRACT_QUALIFICATION_URL, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    transcript,
                    prospect_name: prospectName,
                    prospect_email: prospectEmail || undefined,
                    language,
                  }),
                })
                if (!resp.ok) {
                  console.error("[qualify-chat] extractQualification non-OK", resp.status)
                  return { ok: false, outcome: "disqualified" as const }
                }
                const data = (await resp.json()) as {
                  ok: boolean
                  outcome: "qualified" | "disqualified"
                  docId: string
                  prospectKey: string
                }
                return { ok: true, outcome: data.outcome }
              } catch (err) {
                console.error("[qualify-chat] extractQualification failed", err)
                return { ok: false, outcome: "disqualified" as const }
              }
            },
          }),
        },
      }),
  )

  after(async () => {
    await langfuseSpanProcessor.forceFlush()
  })

  return result.toUIMessageStreamResponse()
}

// Convert UIMessage[] into the transcript shape the extraction CF expects:
// [{ role: 'user' | 'assistant', content: string }]. Concatenate all text
// parts within each message; drop tool calls / tool results / non-text
// parts (the extraction LLM works from the conversational content, not
// the tool plumbing).
function messagesToTranscript(
  messages: UIMessage[],
): Array<{ role: "user" | "assistant"; content: string }> {
  const turns: Array<{ role: "user" | "assistant"; content: string }> = []
  for (const m of messages) {
    if (m.role !== "user" && m.role !== "assistant") continue
    const text = m.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof (p as { text?: unknown }).text === "string")
      .map((p) => p.text)
      .join("")
      .trim()
    if (!text) continue
    turns.push({ role: m.role, content: text })
  }
  return turns
}
