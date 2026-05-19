"use client"
import { useEffect, useRef } from "react"

export function MessageInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  disabled: boolean
  placeholder: string
}) {
  const taRef = useRef<HTMLTextAreaElement>(null)

  // Autosize the textarea up to ~6 lines.
  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 6 * 22)}px`
  }, [value])

  return (
    <form
      className="qualify-chat-input"
      onSubmit={(e) => {
        e.preventDefault()
        onSend()
      }}
    >
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label={placeholder}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label={placeholder}
      >
        ↵
      </button>
    </form>
  )
}
