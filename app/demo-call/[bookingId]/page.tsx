import { CallRoot } from "./call-root"

export const dynamic = "force-dynamic"

// User-side surface for the human-to-human Demo Call.
// URL contract: samwise.life/demo-call/{calBookingUid}
//   — link substituted into the Cal.com confirmation email template
//   (per current-plan.md Step 0.1).
export default async function DemoCallUserPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  return <CallRoot bookingId={bookingId} />
}
