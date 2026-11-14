import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { query } from "@/lib/v2/db"

// Opened from the "See my week" button of the WhatsApp template samwise_weekly_report.
// Shows the image from /api/report-image/<token>. The token is the only key; 14-day expiry.
export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Your ritual week · Samwise", robots: { index: false, follow: false } }

export default async function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[a-f0-9]{32}$/.test(token)) notFound()
  const rows = await query<{ lang: string }>(
    "select data->>'lang' as lang from weekly_reports where token = $1 and created_at > now() - interval '14 days'",
    [token],
  )
  if (!rows.length) notFound()
  const es = rows[0].lang === "es"
  return (
    <main style={{ minHeight: "100vh", background: "#f7f5f1", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/report-image/${token}`}
        alt={es ? "Tu semana de ritual" : "Your ritual week"}
        style={{ width: "100%", maxWidth: 540, height: "auto", borderRadius: 12 }}
      />
      <p style={{ color: "#6b665e", fontSize: 15, maxWidth: 540, marginTop: 16, textAlign: "center" }}>
        {es ? "Respóndele a Samwise en WhatsApp si quieres hablar de tu semana." : "Reply to Samwise on WhatsApp if you want to talk about your week."}
      </p>
    </main>
  )
}
