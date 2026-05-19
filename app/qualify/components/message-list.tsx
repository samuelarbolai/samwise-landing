"use client"
import { useEffect, useRef } from "react"
import type { ChatStatus, UIMessage } from "ai"

export function MessageList({
  messages,
  status,
}: {
  messages: UIMessage[]
  status: ChatStatus
}) {
  const tailRef = useRef<HTMLDivElement>(null)

  // Autoscroll on new messages.
  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages.length])

  return (
    <div className="qualify-chat-list" role="log" aria-live="polite">
      {messages.map((m) => {
        // Render the message's text parts. Skip tool-call parts —
        // they don't have user-visible text. Reasoning parts also
        // skipped (Gemini doesn't return them in non-thinking mode).
        const text = m.parts
          .filter((p) => p.type === "text")
          .map((p) => (p as { type: "text"; text: string }).text)
          .join("")

        if (!text && m.role !== "user") return null

        return (
          <div
            key={m.id}
            className={`qualify-chat-msg qualify-chat-msg-${m.role}`}
          >
            {text}
          </div>
        )
      })}
      {(status === "submitted" || status === "streaming") && (
        <div className="qualify-chat-msg qualify-chat-msg-assistant qualify-chat-msg-pending">
          …
        </div>
      )}
      <div ref={tailRef} />
    </div>
  )
}
