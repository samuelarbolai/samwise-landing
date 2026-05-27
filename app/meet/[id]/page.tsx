import { ScheduledMeetClient } from "./scheduled-meet-client"

export const dynamic = "force-dynamic"

// User-side surface for a SCHEDULED meeting (from /book → Google
// Calendar). The prospect follows the link in their confirmation
// email and lands here at call time. Sibling to /meet (the walk-in
// lobby) — Next.js routes /meet and /meet/[id] separately.
export default async function ScheduledMeetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ScheduledMeetClient id={id} />
}
