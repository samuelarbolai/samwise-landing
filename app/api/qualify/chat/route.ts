import { google } from "@ai-sdk/google"
import {
  convertToModelMessages,
  streamText,
  tool,
  type UIMessage,
} from "ai"
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
// function evaluates qualified vs DQ vs safety_flagged server-side.
// Rationale: handoffs in the AI SDK would require statefulness this
// route doesn't need for the fallback path.

const SUBMIT_QUALIFICATION_URL = process.env.SUBMIT_QUALIFICATION_URL!

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, language, name, email } = (await req.json()) as {
    messages: UIMessage[]
    language: "es" | "en"
    name: string
    email: string
  }
  const prospectName = (name ?? "").trim() || "friend"
  const prospectEmail = (email ?? "").trim()

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

In text mode there is no handoff. When the conversation is complete (gates failed, safety flagged, OR P2 captured), call submitQualification EXACTLY ONCE with the full payload (P1+safety+P2 — P2 fields may be empty if the user disqualified or was safety-flagged).` :
      `${intake}

---

Si — Y SOLO SI — las tres puertas de Prioridad 1 pasan (decision_taken=Y, behaviour_clarity=clear, motivation_clarity=clear) Y safety está limpio, cambia a la segunda etapa:

${capture}

En modo texto NO hay handoff. Cuando la conversación esté completa (puertas falladas, safety flaggeado, O P2 capturado), llama submitQualification UNA SOLA VEZ con el payload completo (P1+safety+P2 — los campos de P2 pueden estar vacíos si el usuario fue descalificado o flaggeado por safety).`

  const modelMessages = await convertToModelMessages(messages)
  const result = streamText({
    model: google("gemini-2.5-flash"),
    system,
    messages: modelMessages,
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
            outcome: "qualified" | "disqualified" | "safety_flagged"
            prospectKey: string
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
