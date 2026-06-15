"use client"

// TEMPORARY local-preview harness for the demo-call story visuals.
// Mounts RitualStory directly (no LiveKit / no agent) with a stage switcher,
// wrapped in the same .qualify-root → .qualify-stage chrome the real call uses
// so layout matches production. Delete this folder when done.
import { useState } from "react"
import { RitualStory, type StoryStage } from "@/app/meet/story/ritual-story"
import type { VariablesState } from "@/app/qualify/components/variables-panel"
import type { Lang } from "@/lib/qualify/strings"
import "@/app/qualify/qualify.css"

const STAGES: StoryStage[] = [
  "hidden",
  "doc",
  "promise",
  "loop",
  "mechanism",
  "experience",
]

// Sample captured notes — behaviour_to_change feeds the descending curve label.
const SAMPLE: VariablesState = {
  behaviour_to_change: "checking my phone first thing",
  core_motivation: "to be present with my kids",
  problem_duration_self_reported: "about three years",
  life_stage_context: "new parent, working full-time",
}

export default function StoryPreviewPage() {
  const [stage, setStage] = useState<StoryStage>("promise")
  const [lang, setLang] = useState<Lang>("en")

  return (
    <div className="qualify-root" style={{ minHeight: "100vh" }}>
      <header
        className="qualify-header"
        style={{ display: "flex", gap: 12, alignItems: "center", padding: 16 }}
      >
        <label>
          stage{" "}
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as StoryStage)}
          >
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
      <main className="qualify-stage">
        <RitualStory lang={lang} stage={stage} variables={SAMPLE} />
      </main>
    </div>
  )
}
