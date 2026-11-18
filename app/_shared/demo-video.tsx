"use client"

import { useState } from "react"
import { SRC_KEY, cleanSrc } from "@/lib/v2/src-tag"
import "./demo-video.css"

export type DemoVideoKey = "first-week" | "clinician-plan"
type Lang = "en" | "es"

const LABELS: Record<DemoVideoKey, Record<Lang, { title: string; note: string }>> = {
  "first-week": {
    en: { title: "See how your first week works (1:32)", note: "Demo with fictional people." },
    es: { title: "Mira cómo es tu primera semana (1:32)", note: "Demo con personas ficticias." },
  },
  "clinician-plan": {
    en: { title: "See how it works (40 s)", note: "Demo with fictional people." },
    es: { title: "Mira cómo funciona (40 s)", note: "Demo con personas ficticias." },
  },
}

/** Counts a play (page, video, language, ?src= tag; nothing personal). Never blocks the video. */
function logPlay(video: DemoVideoKey, lang: Lang) {
  let src: string | null = cleanSrc(new URLSearchParams(window.location.search).get("src"))
  try {
    src = src ?? cleanSrc(window.sessionStorage.getItem(SRC_KEY))
  } catch {
    // Storage blocked: count the play without a tag.
  }
  const body = JSON.stringify({ page: window.location.pathname, video, lang, src })
  fetch("/api/video-play", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {})
}

/**
 * A vertical demo video behind a poster and a play button: nothing but the poster
 * loads until the visitor taps, and it never autoplays.
 */
export function DemoVideo({ video, lang, className, compact }: { video: DemoVideoKey; lang: Lang; className?: string; compact?: boolean }) {
  const [playing, setPlaying] = useState<string | null>(null)
  const t = LABELS[video][lang]
  const file = `/videos/${video}-${lang}`
  const play = () => {
    setPlaying(file)
    logPlay(video, lang)
  }

  // Compact: one short row (thumbnail + title) so a form below stays in view until the visitor taps.
  if (compact && playing !== file) {
    return (
      <button type="button" className={`dv-row ${className ?? ""}`} onClick={play}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dv-row__thumb" src={`${file}.jpg`} alt="" loading="lazy" width={54} height={96} />
        <span className="dv-row__text">
          <b>{t.title}</b>
          <span>{t.note}</span>
        </span>
        <span className="dv-row__play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
        </span>
      </button>
    )
  }

  return (
    <figure className={`dv ${className ?? ""}`}>
      <div className="dv-frame">
        {playing === file ? (
          <video className="dv-media" src={`${file}.mp4`} poster={`${file}.jpg`} controls autoPlay playsInline preload="metadata" />
        ) : (
          <button
            type="button"
            className="dv-poster"
            aria-label={t.title}
            onClick={play}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="dv-media" src={`${file}.jpg`} alt="" loading="lazy" width={540} height={960} />
            <span className="dv-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="dv-caption">
        <b>{t.title}</b> <span>{t.note}</span>
      </figcaption>
    </figure>
  )
}
