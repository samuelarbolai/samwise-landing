"use client"

import { useCallback, useState } from "react"
import {
  VideoCallExperience,
  type VideoCallInit,
} from "./video-call-experience"
import {
  VariablesPanel,
  type VariablesState,
  type VariableKey,
} from "@/app/qualify/components/variables-panel"
import { DEMO_CALL_STRINGS } from "@/lib/demo-call/strings"
import type { UserInitResponse } from "./pre-join"

// The set of keys the user is allowed to see. Mirrors the qualify
// VariablesPanel's allowed set (which exports VariableKey). The
// therapist's copilot decides which variables to broadcast via the
// `userVisible: true` flag in demo-call-config.ts on the samwise-app
// side; this set is the defensive client-side filter in case a
// non-user-visible key ever slips through the broadcaster.
const ALLOWED_KEYS = new Set<VariableKey>([
  "behaviour_to_change",
  "core_motivation",
  "problem_duration_self_reported",
  "life_stage_context",
  "symbolic_anchor_description",
  "alternatives_tried",
  "why_alternatives_failed",
])

function isVariableKey(name: string): name is VariableKey {
  return ALLOWED_KEYS.has(name as VariableKey)
}

interface CallRoomProps {
  init: UserInitResponse
}

// User-side in-call surface. Two regions: the video tile (main) and the
// VariablesPanel (right rail on desktop, below on mobile — see
// demo-call.css). The panel hydrates from `demo-call:variable_update`
// data events published by the therapist's copilot when a userVisible
// variable's cleaned value changes.
export function CallRoom({ init }: CallRoomProps) {
  const [variables, setVariables] = useState<VariablesState>({})

  const onDataMessage = useCallback((msg: unknown) => {
    if (
      typeof msg !== "object" ||
      msg === null ||
      !("type" in msg) ||
      (msg as { type?: unknown }).type !== "demo-call:variable_update"
    ) {
      return
    }
    const m = msg as { type: string; name?: unknown; value?: unknown }
    if (typeof m.name !== "string") return
    if (!isVariableKey(m.name)) return
    const value = typeof m.value === "string" ? m.value : ""
    setVariables((prev) => ({ ...prev, [m.name as VariableKey]: value }))
  }, [])

  const lang = init.booking.language
  const s = DEMO_CALL_STRINGS[lang]

  return (
    <div className="demo-call-room">
      <section className="demo-call-room-video">
        <VideoCallExperience
          init={init as VideoCallInit}
          status={{
            connectingLead: s.call_connecting_lead,
            connectingSub: s.call_connecting_sub,
            waitingLead: s.call_waiting_lead,
            waitingSub: s.call_waiting_sub,
            endedLead: s.call_ended_lead,
            endedSub: s.call_ended_sub,
          }}
          onDataMessage={onDataMessage}
        />
      </section>
      <aside
        className="demo-call-room-notes"
        aria-label={s.notes_section_label}
      >
        <VariablesPanel lang={lang} variables={variables} />
      </aside>
    </div>
  )
}
