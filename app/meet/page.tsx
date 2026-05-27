import { MeetRoot } from "./meet-root"

export const dynamic = "force-static"

// User-side walk-in surface. Single permanent URL — samwise.life/meet.
// No booking, no Cal, no scheduling. Lobby asks for name + email +
// language; on submit, /api/walk-in/init mints a LiveKit room, writes
// the walkIn doc to Firestore, and emails Samuel a join link. The
// user goes straight into the call (alone) and sees the
// "Samuel will be with you shortly" overlay until he joins.
export default function MeetPage() {
  return <MeetRoot />
}
