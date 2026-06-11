"use client"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useEffect, useMemo, useRef, useState } from "react"
import { STRINGS, type Lang } from "@/lib/qualify/strings"
import { MessageList } from "./components/message-list"
import { MessageInput } from "./components/message-input"
import type { Outcome } from "./components/final-screen"
import {
  VariablesPanel,
  type VariableKey,
  type VariablesState,
} from "./components/variables-panel"

const VALID_VARIABLE_KEYS: Set<string> = new Set<VariableKey>([
  "behaviour_to_change",
  "core_motivation",
  "problem_duration_self_reported",
  "life_stage_context",
])

export function QualifyChat({
  lang,
  name,
  email,
  onOutcome,
}: {
  lang: Lang
  name: string
  email: string
  onOutcome: (outcome: Outcome) => void
}) {
  const s = STRINGS[lang]

  // Stable session identifier for this whole chat — generated once when
  // the component mounts. The server attaches it to every Langfuse span
  // so the multi-turn conversation appears as ONE session in the
  // Langfuse UI instead of N disconnected traces.
  const sessionId = useMemo(() => crypto.randomUUID(), [])

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/qualify/chat",
        body: () => ({ language: lang, name, email, sessionId }),
      }),
    [lang, name, email, sessionId],
  )

  const { messages, sendMessage, status } = useChat({ transport })

  const [draft, setDraft] = useState("")

  // Live notes — mirrors voice-room's variables state. Updated by sniffing
  // setVariables tool-call INPUTs in the streamed message parts. Renders
  // into <VariablesPanel> beside the chat.
  const [variables, setVariables] = useState<VariablesState>({})

  // Pending outcome — set when the agent's endCall tool returns. We defer
  // the screen swap until the assistant's closing line has fully streamed,
  // signalled by `status === 'ready'` (the stream is done).
  const pendingOutcomeRef = useRef<Outcome | null>(null)

  // Sniff streamed message parts for tool activity:
  //   - tool-setVariables (input-available | output-available) → merge the
  //     INPUT values into variables state. We read from input so the panel
  //     fills as the agent commits, not after a server round-trip.
  //   - tool-endCall (output-available) → stash the outcome; the second
  //     effect below swaps screens once the stream finishes.
  useEffect(() => {
    let nextVariables: VariablesState | null = null
    for (const m of messages) {
      for (const part of m.parts) {
        if (
          part.type === "tool-setVariables" &&
          (part.state === "input-available" || part.state === "output-available") &&
          part.input &&
          typeof part.input === "object"
        ) {
          const updates = part.input as Record<string, unknown>
          for (const [k, v] of Object.entries(updates)) {
            if (typeof v !== "string" || v.trim().length === 0) continue
            if (!VALID_VARIABLE_KEYS.has(k)) continue
            if (!nextVariables) nextVariables = { ...variables }
            nextVariables[k as VariableKey] = v
          }
        } else if (
          part.type === "tool-endCall" &&
          part.state === "output-available" &&
          part.output &&
          typeof part.output === "object"
        ) {
          const out = (part.output as { outcome?: unknown }).outcome
          if (
            (out === "qualified" || out === "disqualified") &&
            !pendingOutcomeRef.current
          ) {
            pendingOutcomeRef.current = out
          }
        }
      }
    }
    if (nextVariables) setVariables(nextVariables)
    // `variables` intentionally not in deps: we read it inside the loop
    // only to seed the nextVariables snapshot; React's setState will
    // schedule a re-render with the merged result, which re-runs this
    // effect against the same messages, producing a no-op the second
    // time (no new tool inputs to merge).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  // When the stream finishes and we have a pending outcome, swap screens.
  useEffect(() => {
    if (pendingOutcomeRef.current && status === "ready") {
      const out = pendingOutcomeRef.current
      pendingOutcomeRef.current = null
      onOutcome(out)
    }
  }, [status, onOutcome])

  const handleSend = () => {
    const text = draft.trim()
    if (!text || status === "submitted" || status === "streaming") return
    setDraft("")
    sendMessage({ text })
  }

  return (
    <div className="qualify-chat-layout">
      <div className="qualify-chat">
        <MessageList messages={messages} status={status} />
        <div className="qualify-chat-input-dock">
          <MessageInput
            value={draft}
            onChange={setDraft}
            onSend={handleSend}
            disabled={status === "submitted" || status === "streaming"}
            placeholder={lang === "es" ? "Escribe…" : "Type…"}
          />
        </div>
        {status === "error" && (
          <div className="qualify-chat-error">{s.error_generic}</div>
        )}
      </div>
      <VariablesPanel lang={lang} variables={variables} />
    </div>
  )
}
