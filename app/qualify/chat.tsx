"use client"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useEffect, useMemo, useRef, useState } from "react"
import { STRINGS, type Lang } from "@/lib/qualify/strings"
import { MessageList } from "./components/message-list"
import { MessageInput } from "./components/message-input"
import type { Outcome } from "./components/final-screen"

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
  // Langfuse UI instead of N disconnected traces. crypto.randomUUID is
  // available in every browser that runs this app.
  const sessionId = useMemo(() => crypto.randomUUID(), [])

  // Pass `language`, `name`, `email`, and `sessionId` in the request
  // body so the API route can pick the right prompt + thread the
  // prospect's identity + group turns under one Langfuse session.
  // AI SDK 6 uses a transport for outbound shaping.
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

  // Sniff tool results for the outcome — but defer the screen swap until
  // the assistant's closing message has fully streamed. Without the defer,
  // the FinalScreen replaces the chat mid-sentence and the user never sees
  // the agent's goodbye.
  const pendingOutcomeRef = useRef<Outcome | null>(null)

  useEffect(() => {
    for (const m of messages) {
      for (const part of m.parts) {
        if (
          part.type === "tool-submitQualification" &&
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
    <div className="qualify-chat">
      <MessageList messages={messages} status={status} />
      <MessageInput
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        disabled={status === "submitted" || status === "streaming"}
        placeholder={lang === "es" ? "Escribe…" : "Type…"}
      />
      {status === "error" && (
        <div className="qualify-chat-error">{s.error_generic}</div>
      )}
    </div>
  )
}
