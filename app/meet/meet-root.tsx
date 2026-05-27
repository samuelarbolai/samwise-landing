"use client"

import { useState } from "react"
import { MeetLobby, type MeetInitResponse } from "./lobby"
import { MeetCallRoom } from "./call-room"
import "./meet.css"

// In-page state machine: lobby → call. No navigation; the init response
// is held in state and handed to the call-room when the user submits.
export function MeetRoot() {
  const [init, setInit] = useState<MeetInitResponse | null>(null)
  if (!init) return <MeetLobby onJoined={setInit} />
  return <MeetCallRoom init={init} />
}
