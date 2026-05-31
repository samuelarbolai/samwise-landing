"use client"

// THROWAWAY local harness for the prospect-facing Ritual Story visuals.
// No LiveKit / no second party — switch stage + language by hand.
// Run: `pnpm dev` in samwise-landing, open http://localhost:3000/meet/story-test
// DELETE app/meet/story-test/ when done (it's a dev aid, not shipped).
import { useState } from "react"
import { RitualStory, type StoryStage } from "../story/ritual-story"
import { VariablesPanel } from "@/app/qualify/components/variables-panel"
import "@/components/call/call.css"

// Sample captured notes — seeds the panel cards + the doc spine's active
// "Problem & Solution" section + the promise curve's old-pattern label.
const sampleVars = {
  behaviour_to_change: "doomscrolling hasta las 2am en vez de dormir",
  core_motivation: "ser un papá presente para mis hijas",
  why_alternatives_failed: "cuando se acabó el plan, todo se desvaneció",
  symbolic_anchor_description: "la filosofía estoica, sobre todo Marco Aurelio",
  alternatives_tried: "apps de productividad, un coach",
}

const STAGES: StoryStage[] = ["promise", "experience", "loop", "hidden"]

const ctrlBtn = (active: boolean): React.CSSProperties => ({
  padding: "4px 10px",
  borderRadius: 6,
  border: active ? "1px solid #000" : "1px solid #ccc",
  background: active ? "#000" : "#fff",
  color: active ? "#fff" : "#000",
  cursor: "pointer",
  font: "inherit",
})

export default function StoryTest() {
  const [stage, setStage] = useState<StoryStage>("promise")
  const [lang, setLang] = useState<"en" | "es">("es")

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Dev control bar — NOT part of the real prospect view. */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          padding: "12px 20px",
          borderBottom: "1px solid #e0e0e0",
          background: "#fff",
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
        }}
      >
        <strong
          style={{
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontSize: 11,
            color: "#555",
          }}
        >
          Story harness
        </strong>
        {STAGES.map((s) => (
          <button key={s} onClick={() => setStage(s)} style={ctrlBtn(stage === s)}>
            {s}
          </button>
        ))}
        <span style={{ width: 1, height: 18, background: "#e0e0e0" }} />
        {(["es", "en"] as const).map((l) => (
          <button key={l} onClick={() => setLang(l)} style={ctrlBtn(lang === l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* The actual prospect-facing notes column. */}
      <div
        lang={lang}
        style={{ padding: "40px 24px", maxWidth: 520, margin: "0 auto" }}
      >
        <aside className="demo-call-room-notes" aria-label="notes">
          <VariablesPanel lang={lang} variables={sampleVars} />
          <RitualStory lang={lang} stage={stage} variables={sampleVars} />
        </aside>
      </div>
    </div>
  )
}
