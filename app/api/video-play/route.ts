import { query } from "@/lib/v2/db"
import { fail, readJson } from "@/lib/v2/http"
import { cleanSrc } from "@/lib/v2/src-tag"

const VIDEOS = new Set(["first-week", "clinician-plan"])
const PAGE = /^\/[a-z0-9/_-]{0,60}$/

/** One row per demo video play: page path, video, language, ?src= tag. Nothing personal. */
export async function POST(req: Request) {
  const b = await readJson(req)
  const video = typeof b.video === "string" && VIDEOS.has(b.video) ? b.video : null
  const page = typeof b.page === "string" && PAGE.test(b.page) ? b.page : null
  const lang = b.lang === "es" ? "es" : b.lang === "en" ? "en" : null
  if (!video || !page || !lang) return fail("Bad request")
  try {
    await query("INSERT INTO video_plays (page, video, lang, src) VALUES ($1, $2, $3, $4)", [page, video, lang, cleanSrc(b.src)])
  } catch (err) {
    console.error("[video-play]", err)
  }
  return new Response(null, { status: 204 })
}
