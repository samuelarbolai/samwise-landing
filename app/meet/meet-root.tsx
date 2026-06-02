"use client"

import { useState } from "react"
import { MeetLobby, type MeetInitResponse } from "./lobby"
import { MeetCallRoom } from "./call-room"
import "./meet.css"

// Walk-in entry. The lobby collects who's joining + creates the room, then
// hands the init back so the call renders IN-PAGE (no navigation) — the Join
// click flows straight into the room, no extra step. The lobby ALSO swaps the
// URL to /meet/[walkInId] via replaceState, so a reload lands on the recovery
// route (/meet/[id], shared with scheduled bookings) and rejoins the same room.
export function MeetRoot() {
  const [init, setInit] = useState<MeetInitResponse | null>(null)
  if (!init) return <MeetLobby onJoined={setInit} />
  return <MeetCallRoom init={init} />
}
