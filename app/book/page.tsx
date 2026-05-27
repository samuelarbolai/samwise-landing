import { BookClient } from "./book-client"

export const dynamic = "force-static"

// Samwise-branded booking surface. Replaces "Samuel sends them a raw
// cal.com URL" with samwise.life/book?lang=en|es. Cal element-click
// modal opens in place when the CTA is tapped — Cal's own UI handles
// the calendar pick + confirmation, then samwise's calDemoBookingWebhook
// fires and the prospect receives the demo-call/[bookingId] link.
export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const { lang } = await searchParams
  const resolvedLang = lang === "es" ? "es" : "en"
  return <BookClient lang={resolvedLang} />
}
