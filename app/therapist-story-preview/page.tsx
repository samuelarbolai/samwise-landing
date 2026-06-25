"use client"

// Local preview harness for the therapist demo story visuals (Part C). Mounts
// TherapistDemoStory directly with stage + lang switchers — no LiveKit / no
// call. The go-to surface for iterating on the in-call therapist visuals.
// KEEP it.
import { useState } from "react"
import {
  TherapistDemoStory,
  type TherapistStage,
} from "@/app/meet/therapist-story/therapist-demo-story"
import type { Lang } from "@/lib/qualify/strings"

const STAGES: TherapistStage[] = [
  "hidden",
  "case",
  "ritual",
  "call",
  "arc",
  "collaboration",
  "offer",
]

export default function TherapistStoryPreviewPage() {
  const [stage, setStage] = useState<TherapistStage>("ritual")
  const [lang, setLang] = useState<Lang>("en")
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", padding: 16 }}>
        <label>
          stage{" "}
          <select value={stage} onChange={(e) => setStage(e.target.value as TherapistStage)}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          lang{" "}
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
            <option value="en">en</option>
            <option value="es">es</option>
          </select>
        </label>
      </header>
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 80px" }}>
        <TherapistDemoStory lang={lang} stage={stage} />
      </main>
    </div>
  )
}
