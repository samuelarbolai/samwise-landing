"use client"

import { useState } from "react"

// Lets the person send their private journal link to whoever they choose (phone share sheet, or copy).
export function ShareButton({ label, copied, title }: { label: string; copied: string; title: string }) {
  const [done, setDone] = useState(false)
  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setDone(true)
      setTimeout(() => setDone(false), 2500)
    } catch {
      // The person closed the share sheet; nothing to do.
    }
  }
  return (
    <button
      type="button"
      onClick={share}
      style={{
        background: "#1f1d1a", color: "#f7f5f1", border: 0, borderRadius: 999, padding: "10px 18px",
        fontSize: 15, cursor: "pointer",
      }}
    >
      {done ? copied : label}
    </button>
  )
}
