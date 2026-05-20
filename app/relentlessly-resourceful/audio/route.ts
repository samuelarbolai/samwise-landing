import { promises as fs } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
import os from "node:os"
import { TRANSCRIPT, VOICE_ID } from "../audio-transcript"

export const runtime = "nodejs"

const MODEL_ID = "sonic-2"
const LANGUAGE = "es"

const CACHE_KEY = createHash("sha1")
  .update(`${MODEL_ID}|${VOICE_ID}|${LANGUAGE}|${TRANSCRIPT}`)
  .digest("hex")
  .slice(0, 16)

const CACHE_PATH = path.join(os.tmpdir(), `rr-audio-${CACHE_KEY}.mp3`)

async function readCache(): Promise<Buffer | null> {
  try {
    const buf = await fs.readFile(CACHE_PATH)
    return buf.byteLength > 0 ? buf : null
  } catch {
    return null
  }
}

export async function GET() {
  const cached = await readCache()
  if (cached) {
    return new Response(cached, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(cached.byteLength),
        "Accept-Ranges": "bytes",
        "X-Cache": "HIT",
      },
    })
  }

  const apiKey = process.env.CARTESIA_API_KEY
  if (!apiKey) {
    return new Response("CARTESIA_API_KEY not configured", { status: 500 })
  }

  const upstream = await fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Cartesia-Version": "2024-11-13",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: MODEL_ID,
      transcript: TRANSCRIPT,
      voice: { mode: "id", id: VOICE_ID },
      output_format: { container: "mp3", sample_rate: 44100, bit_rate: 128000 },
      language: LANGUAGE,
    }),
  })

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "")
    return new Response(`Cartesia ${upstream.status}: ${detail}`, { status: 502 })
  }

  // Tee the stream: one branch pipes to the client (plays as it arrives);
  // the other branch accumulates and writes to disk so subsequent requests
  // skip the Cartesia round-trip entirely.
  const [forClient, forCache] = upstream.body.tee()

  ;(async () => {
    const reader = forCache.getReader()
    const chunks: Uint8Array[] = []
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) chunks.push(value)
      }
      const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)))
      if (buf.byteLength > 0) await fs.writeFile(CACHE_PATH, buf)
    } catch {
      // Disk caching is best-effort; never fail the client response on it.
    }
  })()

  const headers: Record<string, string> = {
    "Content-Type": "audio/mpeg",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Cache": "MISS-STREAM",
  }
  const upstreamCL = upstream.headers.get("content-length")
  if (upstreamCL) headers["Content-Length"] = upstreamCL

  return new Response(forClient, { status: 200, headers })
}
