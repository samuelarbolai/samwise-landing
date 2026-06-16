import { BookRoot, type MeetingType } from "./book-root"

export const dynamic = "force-static"

// Samwise-branded booking surface. Reads Samuel's calendar
// availability from Google Calendar (via samwise-app's /api/book/slots),
// renders a from-scratch picker (month grid → time slots → confirm →
// done). Bilingual via ?lang=es. Meeting type via ?type=therapist
// (defaults to the Breakthrough Call); the type drives slot duration,
// calendar, and confirmation copy on the samwise-app side.
export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; type?: string }>
}) {
  const { lang, type } = await searchParams
  const resolvedLang = lang === "es" ? "es" : "en"
  const meetingType: MeetingType =
    type === "therapist" ? "therapist" : "breakthrough"
  return <BookRoot lang={resolvedLang} meetingType={meetingType} />
}
