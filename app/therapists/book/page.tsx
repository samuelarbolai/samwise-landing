import { BookRoot } from "@/app/book/book-root"

export const dynamic = "force-static"

// The behavioural-change expert's 15-minute Samwise adoption test — a distinct
// meeting from the prospect Breakthrough Call (different duration, calendar, and
// confirmation copy; see samwise-app/lib/book/meeting-types.ts). This is a thin
// wrapper around the shared /book picker with the meeting type preset to
// "therapist" — no duplicated booking UI or calendar plumbing. English only
// (the therapist journey is English); the close CTA on /therapists links here.
export default function TherapistBookPage() {
  return <BookRoot lang="en" meetingType="therapist" />
}
