import { after } from "next/server"
import {
  convertToModelMessages,
  streamText,
  tool,
  type UIMessage,
} from "ai"
import { propagateAttributes } from "@langfuse/tracing"
import { langfuseSpanProcessor } from "@/instrumentation"
import { buildCapturePrompt } from "@/lib/qualify/capture-prompt"
import { buildIntakePrompt } from "@/lib/qualify/intake-prompt"
import { QualificationPayloadSchema } from "@/lib/qualify/schema"

// Text-mode fallback for /qualify. Voice mode is the primary path
// (LiveKit room + samwise-backend/qualification-agent worker); this
// route runs only when the user clicked "I'd rather type".
//
// Text mode does NOT replicate the voice path's handoff workflow.
// Both Intake and Capture concerns are stitched into ONE prompt with
// one tool (`submitQualification`) taking the full payload. The cloud
// function evaluates qualified vs disqualified server-side.
// Rationale: handoffs in the AI SDK would require statefulness this
// route doesn't need for the fallback path.

const SUBMIT_QUALIFICATION_URL = process.env.SUBMIT_QUALIFICATION_URL!

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
  // userId in Langfuse — email is what /copilot also uses to find a
  // prospect, so it keeps the two systems aligned. Falls back to the
  // prospect name when email is empty.
  const langfuseUserId = prospectEmail || prospectName

  const intake = buildIntakePrompt(language, prospectName)
  const capture = buildCapturePrompt(language, null)

  // Combined prompt: Intake first, Capture as a "second stage" the
  // model self-enters when the P1+safety gates pass.
  const system =
    language === "en" ?
      `${intake}

---

If, AND ONLY IF, all three Priority-1 gates pass (decision_taken=Y, behaviour_clarity=clear, motivation_clarity=clear) AND safety is clear, switch to the second stage:

${capture}

In text mode there is no handoff. Call submitQualification EXACTLY ONCE with the full payload (P1+safety+P2 — P2 fields may be empty if the user disqualified or was safety-flagged), and ONLY after one of these is true:
  (a) all three Priority-1 gates have been ELICITED from the user (decision_taken Y/N, behaviour_clarity clear/vague, motivation_clarity clear/vague — vague counts; silence does NOT), and P2 capture has been attempted on the qualified path; OR
  (b) safety has been clearly flagged (acute_risk_flag=Y OR ownership_self_reported=external).

Hard rule: do NOT call submitQualification just because the user opened with "I'm just exploring" or sounded reluctant. That answers at most decision_taken — you still must surface behaviour_clarity and motivation_clarity with the user before submitting.` :
      `${intake}

---

Si — Y SOLO SI — las tres puertas de Prioridad 1 pasan (decision_taken=Y, behaviour_clarity=clear, motivation_clarity=clear) Y safety está limpio, cambia a la segunda etapa:

${capture}

En modo texto NO hay handoff. Llama submitQualification UNA SOLA VEZ con el payload completo (P1+safety+P2 — los campos de P2 pueden estar vacíos si el usuario fue descalificado o flaggeado por safety), y SOLO después de que sea cierto uno de estos:
  (a) las tres puertas de Prioridad 1 han sido ELICITADAS del usuario (decision_taken Y/N, behaviour_clarity clear/vague, motivation_clarity clear/vague — vague cuenta; el silencio NO), y se ha intentado la captura de P2 en el camino calificado; O
  (b) safety ha sido claramente flaggeado (acute_risk_flag=Y O ownership_self_reported=external).

Regla dura: NO llames submitQualification solo porque el usuario abrió con "solo estoy explorando" o sonó reacio. Eso responde como mucho decision_taken — todavía debes surgir behaviour_clarity y motivation_clarity con el usuario antes de enviar.`

  const modelMessages = await convertToModelMessages(messages)
  // propagateAttributes injects sessionId + userId onto every OTel span
  // created inside the callback. The Langfuse OTel processor reads these
  // and groups all turns of this conversation into a single session in
  // the Langfuse UI. Without this wrap, each POST is a disconnected trace.
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
        // experimental_telemetry turns on AI SDK's OTel emission.
        // functionId groups all qualify-chat calls together in Langfuse;
        // metadata gives per-trace context for filtering.
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
      submitQualification: tool({
        description:
          "Submit the full qualification payload at the end of the conversation. Call exactly ONCE.",
        inputSchema: QualificationPayloadSchema,
        execute: async (raw) => {
          // Merge in identifiers from the request body — the LLM does not
          // supply prospect_name / contact_email / language through the
          // tool. contact_email is what makes the qualification doc
          // findable by /copilot's email search.
          const payload = {
            ...raw,
            prospect_name: prospectName,
            language,
            ...(prospectEmail ? { contact_email: prospectEmail } : {}),
          }
          const resp = await fetch(SUBMIT_QUALIFICATION_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
          return (await resp.json()) as {
            ok: boolean
            docId: string
            outcome: "qualified" | "disqualified"
            prospectKey: string
          }
        },
      }),
    },
  }),
  )

  // Serverless gotcha: the function can exit before Langfuse's batch
  // processor flushes its spans, so traces silently disappear. `after()`
  // runs once the response has been sent, then we force the flush.
  after(async () => {
    await langfuseSpanProcessor.forceFlush()
  })

  return result.toUIMessageStreamResponse()
}
