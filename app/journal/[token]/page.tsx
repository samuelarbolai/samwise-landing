import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { query } from "@/lib/v2/db"
import { ShareButton } from "./share-button"

// Private journal page for people without a Google account (2026-11-18, Sales audit AUDIT-5).
// Their journal doc is kept by Samwise (they write on paper and send photos); this page lets them open it
// and share it themselves. Content comes from Neon journal_links.blocks, a snapshot of the doc that the
// n8n ritual_doc tool refreshes (after each photo entry and before each check-in call).
// The 32-hex token is the only key. The person can ask Samwise in the chat for a new link; the old one then stops working.
export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Journal · Samwise",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
  openGraph: { title: "Samwise", description: "A private journal link." },
}

type Block = [string, string]
type Row = { blocks: Block[] | null; synced_at: string | null; language: string | null; timezone: string | null }

const T = {
  en: {
    note: "Private link. Anyone who has it can read this journal, so share it only with people you trust. To stop this link working, ask Samwise on WhatsApp for a new one.",
    share: "Share my journal", copied: "Link copied", updated: "Updated", empty: "Nothing here yet. Send Samwise a photo of your handwritten page on WhatsApp and it will appear here.",
    title: "My journal",
  },
  es: {
    note: "Enlace privado. Quien lo tenga puede leer este cuaderno, así que compártelo solo con personas de confianza. Para que este enlace deje de funcionar, pídele a Samwise uno nuevo por WhatsApp.",
    share: "Compartir mi cuaderno", copied: "Enlace copiado", updated: "Actualizado", empty: "Todavía no hay nada aquí. Envíale a Samwise por WhatsApp una foto de tu página escrita a mano y aparecerá aquí.",
    title: "Mi cuaderno",
  },
}

// Link previews (WhatsApp, iMessage, Telegram) fetch the page too; they are not counted as opens.
const PREVIEW_BOT = /whatsapp|facebookexternalhit|telegrambot|slackbot|twitterbot|discordbot|linkedinbot|applebot|googlebot|bingbot|skypeuripreview|bot\b|crawler|spider/i

const S: Record<string, React.CSSProperties> = {
  T: { fontFamily: "Georgia, 'Source Serif 4', serif", fontWeight: 700, fontSize: 30, lineHeight: 1.2, margin: "8px 0 16px" },
  H1: { fontFamily: "Georgia, 'Source Serif 4', serif", fontWeight: 700, fontSize: 24, lineHeight: 1.25, margin: "28px 0 8px" },
  H2: { fontFamily: "Georgia, 'Source Serif 4', serif", fontWeight: 700, fontSize: 19, lineHeight: 1.3, margin: "22px 0 6px" },
  B: { fontWeight: 600, margin: "12px 0 2px" },
  P: { margin: "2px 0" },
  I: { fontStyle: "italic", fontSize: 13, color: "#736d64", margin: "4px 0" },
}

export default async function JournalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[a-f0-9]{32}$/.test(token)) notFound()
  const rows = await query<Row>(
    `select j.blocks, j.synced_at, u.language, u.timezone
       from journal_links j join users u on u.id = j.user_id
      where j.token = $1`,
    [token],
  )
  if (!rows.length) notFound()
  const r = rows[0]
  const ua = (await headers()).get("user-agent") || ""
  if (!PREVIEW_BOT.test(ua)) {
    // Usage metric (Health Check / logs/metrics.md): opens by a person, not by link previews.
    await query("update journal_links set open_count = open_count + 1, last_opened_at = now() where token = $1", [token]).catch(() => {})
  }
  const lang = r.language === "es" ? "es" : "en"
  const t = T[lang]
  const blocks = (Array.isArray(r.blocks) ? r.blocks : []).filter((b) => Array.isArray(b) && typeof b[1] === "string" && b[1].trim())
  const updated = r.synced_at
    ? new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
        dateStyle: "medium", timeStyle: "short", timeZone: r.timezone || "America/Bogota",
      }).format(new Date(r.synced_at))
    : null

  return (
    <main lang={lang} style={{ minHeight: "100vh", background: "#f7f5f1", color: "#1f1d1a", padding: "24px 16px 64px" }}>
      <article style={{ maxWidth: 680, margin: "0 auto", fontSize: 17, lineHeight: 1.55 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: "#6b665e" }}>Samwise{updated ? ` · ${t.updated} ${updated}` : ""}</span>
          <ShareButton label={t.share} copied={t.copied} title={t.title} />
        </div>
        <p role="note" style={{ fontSize: 14, color: "#6b665e", background: "#efebe4", borderRadius: 10, padding: "10px 12px", margin: "0 0 20px" }}>
          {t.note}
        </p>
        {blocks.length === 0 ? (
          <p style={{ color: "#6b665e" }}>{t.empty}</p>
        ) : (
          blocks.map(([kind, text], i) => {
            const style = S[kind] || S.P
            const Tag = kind === "T" ? "h1" : kind === "H1" ? "h2" : kind === "H2" ? "h3" : "p"
            return (
              <Tag key={i} style={{ ...style, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {text}
              </Tag>
            )
          })
        )}
      </article>
    </main>
  )
}
