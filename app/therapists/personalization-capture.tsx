"use client"

import { useState } from "react"
import { SEVEN_STEPS } from "./seven-steps"

// The close — a FULLY FUNCTIONAL, on-the-spot personalization capture (no
// backend, no email). The expert picks one of three process paths, fills the
// fields we need to personalize, and on "Assemble" we build a plain-text
// summary shown on screen with a copy-to-clipboard button — Samuel grabs it
// live in the room. Below it, a quiet link to book a 15-minute adoption test.
// Reusable: the future therapist-call surface can mount this unchanged.
//
// SAFETY: never collect bank/card/account numbers here. "Preferred payout
// method" is free text at most; real payout details are arranged off-page.

type ProcessPath = "template" | "own" | "edits"

interface CaptureState {
  name: string
  email: string
  region: string
  languages: string
  price: string
  pace: string
  behaviours: string
  path: ProcessPath
  ownProcess: string
  scriptEdits: string
  firstUser: string
  firstUserBehaviour: string
  firstUserStart: string
  stepFit: string
  noteTools: string
  cadence: string
  notes: string
  agreed: boolean
}

const EMPTY: CaptureState = {
  name: "",
  email: "",
  region: "",
  languages: "",
  price: "",
  pace: "",
  behaviours: "",
  path: "template",
  ownProcess: "",
  scriptEdits: "",
  firstUser: "",
  firstUserBehaviour: "",
  firstUserStart: "",
  stepFit: "",
  noteTools: "",
  cadence: "",
  notes: "",
  agreed: false,
}

const PATH_LABEL: Record<ProcessPath, string> = {
  template: "Use the Samwise template process as-is",
  own: "Bring my own process",
  edits: "Edit the Samwise script here",
}

function buildSummary(s: CaptureState): string {
  const L: string[] = []
  L.push("SAMWISE — THERAPIST SETUP")
  L.push("")
  L.push(`Name: ${s.name || "—"}`)
  L.push(`Email: ${s.email || "—"}`)
  L.push(`Region / time zone: ${s.region || "—"}`)
  L.push(`Session language(s): ${s.languages || "—"}`)
  L.push(`Price (per user / month): ${s.price || "—"}`)
  L.push(`Pace (users / cadence): ${s.pace || "—"}`)
  L.push(`Behaviours worked with: ${s.behaviours || "—"}`)
  L.push("")
  L.push(`Process path: ${PATH_LABEL[s.path]}`)
  if (s.path === "own") L.push(`Their process (link/description): ${s.ownProcess || "—"}`)
  if (s.path === "edits") L.push(`Script changes requested: ${s.scriptEdits || "—"}`)
  L.push("")
  L.push("First user:")
  L.push(`  Who (initials / context): ${s.firstUser || "—"}`)
  L.push(`  Behaviour to change: ${s.firstUserBehaviour || "—"}`)
  L.push(`  Rough start date: ${s.firstUserStart || "—"}`)
  L.push("")
  L.push(`Seven steps — comfort / would adapt: ${s.stepFit || "—"}`)
  L.push(`Current note-taking / tools: ${s.noteTools || "—"}`)
  L.push(`Default agent-call cadence: ${s.cadence || "—"}`)
  L.push(`Anything else to personalize: ${s.notes || "—"}`)
  L.push("")
  L.push(`Revenue model (50% / $25 of $50): ${s.agreed ? "acknowledged" : "not acknowledged"}`)
  return L.join("\n")
}

export function PersonalizationCapture({ bookHref = "/book" }: { bookHref?: string }) {
  const [s, setS] = useState<CaptureState>(EMPTY)
  const [summary, setSummary] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const set = <K extends keyof CaptureState>(k: K, v: CaptureState[K]) =>
    setS((prev) => ({ ...prev, [k]: v }))

  const assemble = () => {
    setSummary(buildSummary(s))
    setCopied(false)
  }

  const copy = async () => {
    if (!summary) return
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="t-cap">
      {/* Process path */}
      <fieldset className="t-cap-field">
        <legend className="t-cap-label">Your process</legend>
        <div className="t-cap-paths">
          {(Object.keys(PATH_LABEL) as ProcessPath[]).map((p) => (
            <label
              key={p}
              className={"t-cap-path" + (s.path === p ? " is-on" : "")}
            >
              <input
                type="radio"
                name="process-path"
                checked={s.path === p}
                onChange={() => set("path", p)}
              />
              {PATH_LABEL[p]}
            </label>
          ))}
        </div>
        {s.path === "own" && (
          <textarea
            className="t-cap-area"
            placeholder="Link to your process document, or describe it."
            value={s.ownProcess}
            onChange={(e) => set("ownProcess", e.target.value)}
          />
        )}
        {s.path === "edits" && (
          <div className="t-cap-edits">
            <p className="t-cap-hint">Our seven steps, for reference:</p>
            <ol className="t-cap-steps-ref">
              {SEVEN_STEPS.map((st) => (
                <li key={st}>{st}</li>
              ))}
            </ol>
            <textarea
              className="t-cap-area"
              placeholder="The specific changes you'd make to the script."
              value={s.scriptEdits}
              onChange={(e) => set("scriptEdits", e.target.value)}
            />
          </div>
        )}
      </fieldset>

      {/* You */}
      <div className="t-cap-grid">
        <Field label="Your name" v={s.name} on={(v) => set("name", v)} />
        <Field label="Email" v={s.email} on={(v) => set("email", v)} type="email" />
        <Field label="Region & time zone" v={s.region} on={(v) => set("region", v)} />
        <Field label="Session language(s)" v={s.languages} on={(v) => set("languages", v)} />
        <Field label="Your price (per user / mo)" v={s.price} on={(v) => set("price", v)} />
        <Field label="Your pace (users / cadence)" v={s.pace} on={(v) => set("pace", v)} />
      </div>

      <FieldArea
        label="Behaviours you work with"
        v={s.behaviours}
        on={(v) => set("behaviours", v)}
        placeholder="e.g. screens, substances, destructive relationships, avoidance."
      />

      {/* First user */}
      <p className="t-cap-section">Your first user</p>
      <div className="t-cap-grid">
        <Field label="Who (initials / context)" v={s.firstUser} on={(v) => set("firstUser", v)} />
        <Field
          label="Behaviour to change"
          v={s.firstUserBehaviour}
          on={(v) => set("firstUserBehaviour", v)}
        />
        <Field
          label="Rough start date"
          v={s.firstUserStart}
          on={(v) => set("firstUserStart", v)}
        />
      </div>

      {/* Fit + practice */}
      <FieldArea
        label="Any of the seven steps you'd adapt or can't commit to?"
        v={s.stepFit}
        on={(v) => set("stepFit", v)}
        placeholder="Tells us where to support you."
      />
      <div className="t-cap-grid">
        <Field
          label="How you take session notes today"
          v={s.noteTools}
          on={(v) => set("noteTools", v)}
        />
        <Field
          label="Default call cadence for your users"
          v={s.cadence}
          on={(v) => set("cadence", v)}
        />
      </div>
      <FieldArea
        label="Anything else we should know to personalize"
        v={s.notes}
        on={(v) => set("notes", v)}
      />

      <label className="t-cap-check">
        <input
          type="checkbox"
          checked={s.agreed}
          onChange={(e) => set("agreed", e.target.checked)}
        />
        <span>
          I understand the revenue model: 50% of the AI revenue, 25 USD per
          month of the 50 USD monthly charge.
        </span>
      </label>

      <button type="button" className="t-cta" onClick={assemble}>
        <span className="t-cta-text">Assemble setup summary</span>
      </button>

      {summary && (
        <div className="t-cap-out">
          <pre className="t-cap-summary">{summary}</pre>
          <button type="button" className="t-cta t-cta--mini" onClick={copy}>
            <span className="t-cta-text">{copied ? "Copied" : "Copy to clipboard"}</span>
          </button>
        </div>
      )}

      <p className="t-cap-or">
        <a className="t-cta t-cta--mini" href={bookHref}>
          <span className="t-cta-text">Or book a quick 15-minute test of adopting Samwise</span>
        </a>
      </p>
    </div>
  )
}

function Field({
  label,
  v,
  on,
  type = "text",
}: {
  label: string
  v: string
  on: (v: string) => void
  type?: string
}) {
  return (
    <label className="t-cap-input">
      <span className="t-cap-input-label">{label}</span>
      <input type={type} value={v} onChange={(e) => on(e.target.value)} />
    </label>
  )
}

function FieldArea({
  label,
  v,
  on,
  placeholder,
}: {
  label: string
  v: string
  on: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="t-cap-input t-cap-input--area">
      <span className="t-cap-input-label">{label}</span>
      <textarea
        className="t-cap-area"
        placeholder={placeholder}
        value={v}
        onChange={(e) => on(e.target.value)}
      />
    </label>
  )
}
