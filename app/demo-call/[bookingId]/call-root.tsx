"use client"

import { useState } from "react"
import { PreJoin, type UserInitResponse } from "./pre-join"
import { CallRoom } from "./call-room"
import "./demo-call.css"

// State orchestrator for the user-side demo-call route. PreJoin handles
// the init fetch + permission grant + Join button; on join we swap to
// CallRoom which constructs the LiveKit Room.
export function CallRoot({ bookingId }: { bookingId: string }) {
  const [init, setInit] = useState<UserInitResponse | null>(null)
  if (!init) return <PreJoin bookingId={bookingId} onJoined={setInit} />
  return <CallRoom init={init} />
}
