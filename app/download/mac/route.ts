import { after, NextResponse } from "next/server"
import { MAC_RELEASE } from "@/lib/mac/release"
import { query } from "@/lib/v2/db"

// Answered per request: the redirect is built from the address and the headers that were sent.
export const dynamic = "force-dynamic"

const STEPS_PAGE = "/mac/open?dl=1"
const ROBOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp|monitor/i

/**
 * A link that always points at the current Samwise for Mac disk image.
 *
 * A browser that asks for it is sent to /mac/open first. macOS refuses a browser download of this
 * beta until the person allows it by hand, so that page shows how and then starts the download
 * itself, with ?from=open. Whatever link led here, a person who downloads sees the steps.
 * Anything else (curl in the one-line installer, the checks) gets the disk image straight away.
 *
 * Each download is counted in mac_downloads: when, which version and which way. Nothing about who.
 */
export function GET(req: Request) {
  const url = new URL(req.url)
  const fromSteps = url.searchParams.get("from") === "open"
  const accept = req.headers.get("accept") ?? ""
  const agent = req.headers.get("user-agent") ?? ""
  const headers = { "Cache-Control": "no-store", Vary: "Accept" }

  if (!fromSteps && accept.includes("text/html")) {
    return NextResponse.redirect(new URL(STEPS_PAGE, req.url), { status: 302, headers })
  }

  const via = url.searchParams.has("check")
    ? "check"
    : ROBOT.test(agent)
      ? "other"
      : fromSteps
        ? /Macintosh/.test(agent)
          ? "steps"
          : "other"
        : /^curl\//i.test(agent)
          ? "terminal"
          : "other"
  after(() => countDownload(via))
  return NextResponse.redirect(new URL(MAC_RELEASE.file, req.url), { status: 302, headers })
}

/**
 * via: steps = a browser on a Mac, through the steps page; terminal = the one-line installer;
 * check = our own checks; other = the rest (a phone or a PC, a robot, another tool).
 */
async function countDownload(via: string) {
  try {
    await query("INSERT INTO mac_downloads (version, via, env) VALUES ($1, $2, $3)", [
      MAC_RELEASE.version,
      via,
      process.env.VERCEL_ENV ?? "development",
    ])
  } catch {
    // Counting must never get in the way of a download.
  }
}
