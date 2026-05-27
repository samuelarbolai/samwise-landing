import { BookRoot } from "./book-root"

export const dynamic = "force-static"

// Samwise-branded booking surface. Reads Samuel's calendar
// availability from Google Calendar (via samwise-app's /api/book/slots),
// renders a from-scratch picker (month grid → time slots → confirm →
// done). Bilingual via ?lang=es. No Cal embed, no cal.com domain in the
// user's URL bar at any point.
export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const { lang } = await searchParams
  const resolvedLang = lang === "es" ? "es" : "en"
  return <BookRoot lang={resolvedLang} />
}
