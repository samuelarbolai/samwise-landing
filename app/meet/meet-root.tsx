"use client"

import { MeetLobby } from "./lobby"
import "./meet.css"

// The walk-in entry. The lobby collects who's joining, creates the room, then
// REDIRECTS to the stable /meet/[walkInId] URL — so a reload or reopened tab
// rejoins the same session (in-page state would be lost on reload). The call
// itself renders at /meet/[id], shared with scheduled bookings.
export function MeetRoot() {
  return <MeetLobby />
}
