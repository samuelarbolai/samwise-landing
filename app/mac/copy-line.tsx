"use client"

import { useState } from "react"

/** One line to paste into Terminal, with a button that copies it. Clicking the line selects all of it. */
export function CopyLine({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // No clipboard access: the line can still be selected and copied by hand.
    }
  }

  return (
    <div className="mac-cmd">
      <code>{text}</code>
      <button type="button" onClick={copy} aria-live="polite">
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}
