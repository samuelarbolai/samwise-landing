import { ImageResponse } from "next/og"
import { query } from "@/lib/v2/db"

// Weekly check-in report image, opened from the "See my week" button of the WhatsApp
// template samwise_weekly_checkins (via /report/<token>). n8n "Samwise Weekly Ritual Report" computes each user's week,
// stores it in Neon weekly_reports with a random token, and sends this URL to Telnyx.
// The token is the only key (no user id or data in the URL) and expires after 14 days.
// Design follows "Samuel's ritual month" graph, cut to one week. Words follow the plain-wording glossary (2026-11-14).

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const W = 1080
const H = 1350
const C = {
  bg: "#f7f5f1", fg: "#1f1d1a", mu: "#6b665e", none: "#e3dfd7",
  written: "#c2641e", call: "#1f5f3f", slip: "#9b1c31", answered: "#3f6f9f", past: "#d9b597",
}

type Lang = "en" | "es"
type Report = {
  lang: Lang
  range: string
  first_name?: string
  pushes: string[] // "morning" | "midday" | "night" | "checkin" (or an HH:MM label)
  grid: number[][] // [push][day 0..6]: 0 none, 1 written, 2 done on a call
  slips: [number, number][] // [push, day]
  calls: [number, number][] // [placed, answered] per day
  trend: { label: string; done: number }[]
  done: number
  total: number
  answered?: number // check-ins where the call reached the person (added 2026-11-16)
  slip_count: number
  alert_count: number
  line: string | null
  zero: boolean
}

// Spanish word for "slip": one place. Glossary default "desliz" until Samuel picks (desliz or recaída).
const ES_SLIP = { one: "Desliz", many: "Deslices" }

const T: Record<Lang, Record<string, string | string[]>> = {
  en: {
    title: "Your week of check-ins", of: "of", done: "check-ins done", answered: "answered", answered1: "answered",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    morning: "Morning", midday: "Midday", night: "Night", checkin: "Check-in",
    written: "Journal entry", oncall: "Done on a call", notdone: "Not done", slip: "Slip",
    calls: "Calls you picked up", trend: "Check-ins done, last 4 weeks",
    slips: "Slips you told Samwise", alerts: "Times Samwise called your trusted people",
    zero: "No check-ins logged this week. One is enough to start again.",
  },
  es: {
    title: "Tu semana de chequeos", of: "de", done: "chequeos hechos", answered: "contestados", answered1: "contestado",
    days: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    morning: "Mañana", midday: "Mediodía", night: "Noche", checkin: "Chequeo",
    written: "Entrada del cuaderno", oncall: "Hecho en la llamada", notdone: "No hecho", slip: ES_SLIP.one,
    calls: "Llamadas que contestaste", trend: "Chequeos hechos, últimas 4 semanas",
    slips: `${ES_SLIP.many} que le contaste a Samwise`, alerts: "Veces que Samwise llamó a tus personas de confianza",
    zero: "Esta semana no quedó ningún chequeo registrado. Con uno basta para volver a empezar.",
  },
}

async function font(family: string): Promise<ArrayBuffer> {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Satori)" },
  })).text()
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]
  if (!src) throw new Error(`font ${family}`)
  return (await fetch(src)).arrayBuffer()
}

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params
  if (!/^[a-f0-9]{32}$/.test(token)) return new Response("Not found", { status: 404 })
  const rows = await query<{ data: Report }>(
    "select data from weekly_reports where token = $1 and created_at > now() - interval '14 days'",
    [token],
  )
  if (!rows.length) return new Response("Not found", { status: 404 })
  const r = rows[0].data
  const t = T[r.lang === "es" ? "es" : "en"]
  const days = t.days as string[]

  const [serif, sans, sansMed] = await Promise.all([
    font("Source+Serif+4:wght@600"),
    font("IBM+Plex+Sans:wght@400"),
    font("IBM+Plex+Sans:wght@500"),
  ])

  const cellColor = (v: number) => (v === 1 ? C.written : v === 2 ? C.call : C.none)
  const maxCalls = Math.max(3, ...r.calls.map((c) => c[1]))
  const maxTrend = Math.max(1, ...r.trend.map((x) => x.done))
  const rowH = r.pushes.length === 1 ? 84 : 56
  const legend: [string, string, boolean][] = [
    [C.written, t.written as string, false], [C.call, t.oncall as string, false],
    [C.none, t.notdone as string, false], [C.slip, t.slip as string, true],
  ]

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, background: C.bg, color: C.fg, display: "flex", flexDirection: "column", padding: "64px 72px", fontFamily: "Plex" }}>
        <div style={{ fontFamily: "Serif", fontSize: 64, lineHeight: 1.1 }}>{t.title as string}</div>
        <div style={{ fontSize: 32, color: C.mu, marginTop: 6 }}>{r.range}</div>

        {r.zero ? (
          <div style={{ fontFamily: "Serif", fontSize: 50, lineHeight: 1.2, margin: "36px 0 28px", maxWidth: 900 }}>{t.zero as string}</div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", margin: "36px 0 28px" }}>
            <div style={{ fontFamily: "Serif", fontSize: 120, lineHeight: 1 }}>{String(r.done)}</div>
            <div style={{ fontSize: 34, color: C.mu, marginLeft: 16, marginBottom: 14 }}>
              {`${t.of} ${r.total} ${t.done}` + (r.answered !== undefined ? ` · ${r.answered} ${r.answered === 1 ? t.answered1 : t.answered}` : "")}
            </div>
          </div>
        )}

        <div style={{ display: "flex", marginLeft: 158 }}>
          {days.map((d) => (
            <div key={d} style={{ width: 96, marginRight: 8, textAlign: "center", justifyContent: "center", display: "flex", fontSize: 26, color: C.mu }}>{d}</div>
          ))}
        </div>
        {r.grid.map((row, p) => (
          <div key={p} style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
            <div style={{ width: 158, fontSize: 26, color: C.mu }}>{(t[r.pushes[p]] as string | undefined) ?? r.pushes[p]}</div>
            {row.map((v, d) => (
              <div key={d} style={{ width: 96, height: rowH, marginRight: 8, borderRadius: 10, background: cellColor(v), display: "flex", justifyContent: "flex-end", padding: 8 }}>
                {r.slips.some(([sp, sd]) => sp === p && sd === d) ? (
                  <div style={{ width: 24, height: 24, borderRadius: 12, background: C.slip }} />
                ) : null}
              </div>
            ))}
          </div>
        ))}
        <div style={{ display: "flex", fontSize: 24, color: C.mu, margin: "18px 0 32px" }}>
          {legend.map(([color, label, round]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", marginRight: 28 }}>
              <div style={{ width: 22, height: 22, borderRadius: round ? 11 : 5, background: color, marginRight: 8 }} />
              {label}
            </div>
          ))}
        </div>

        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, marginRight: 56 }}>
            <div style={{ fontSize: 24, color: C.mu, marginBottom: 12 }}>{t.calls as string}</div>
            <div style={{ display: "flex", alignItems: "flex-end", height: 150 }}>
              {r.calls.map(([placed, ans], i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", marginRight: 10, fontSize: 22, color: C.mu }}>
                  <div style={{ width: "100%", height: Math.max(4, (ans / maxCalls) * 90), background: C.answered, borderRadius: 6, marginBottom: 6 }} />
                  {`${ans}/${placed}`}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ fontSize: 24, color: C.mu, marginBottom: 12 }}>{t.trend as string}</div>
            <div style={{ display: "flex", alignItems: "flex-end", height: 150 }}>
              {r.trend.map((w, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", marginRight: 12, fontSize: 22, color: C.mu }}>
                  <div style={{ width: "100%", height: Math.max(4, (w.done / maxTrend) * 80), background: i === r.trend.length - 1 ? C.written : C.past, borderRadius: 6, marginBottom: 6 }} />
                  <div>{String(w.done)}</div>
                  <div>{w.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 36, borderTop: `2px solid ${C.none}`, paddingTop: 24, fontSize: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>{t.slips as string}</div><div style={{ fontFamily: "Serif", fontSize: 36 }}>{String(r.slip_count)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>{t.alerts as string}</div><div style={{ fontFamily: "Serif", fontSize: 36 }}>{String(r.alert_count)}</div>
          </div>
        </div>
        {r.line ? <div style={{ fontSize: 28, marginTop: 24 }}>{r.line}</div> : null}
        <div style={{ position: "absolute", bottom: 48, left: 72, fontSize: 22, color: C.mu, fontFamily: "PlexMed" }}>Samwise · samwise.life</div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Serif", data: serif, weight: 600 },
        { name: "Plex", data: sans, weight: 400 },
        { name: "PlexMed", data: sansMed, weight: 500 },
      ],
      headers: { "Cache-Control": "private, max-age=3600" },
    },
  )
}
