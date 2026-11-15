// Fonts for the old held-* experiment pages, loaded in the browser from Google Fonts.
// They used next/font/google, which downloads the fonts while Vercel builds; that download
// failed two production builds on 2026-11-15 and blocked unrelated merges. Nothing is fetched at build time now.

type HeldFont = { className: string; variable: string }

function heldFont(slug: string): HeldFont {
  return { className: `hf-${slug}`, variable: `hfv-${slug}` }
}

export const Cormorant_Garamond = (_options?: unknown): HeldFont => heldFont("cormorant")
export const JetBrains_Mono = (_options?: unknown): HeldFont => heldFont("jetbrains")
export const Italiana = (_options?: unknown): HeldFont => heldFont("italiana")
export const Cinzel = (_options?: unknown): HeldFont => heldFont("cinzel")
export const EB_Garamond = (_options?: unknown): HeldFont => heldFont("ebgaramond")

const HREF =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Italiana&family=JetBrains+Mono:wght@200;300;400&display=swap"

const CSS = `
.hf-cormorant { font-family: "Cormorant Garamond", Georgia, serif; }
.hf-jetbrains { font-family: "JetBrains Mono", ui-monospace, monospace; }
.hf-italiana { font-family: "Italiana", Georgia, serif; }
.hf-cinzel { font-family: "Cinzel", Georgia, serif; }
.hf-ebgaramond { font-family: "EB Garamond", Georgia, serif; }
`

/** Render once on each held-* page. */
export function HeldFonts() {
  return (
    <>
      <link rel="stylesheet" href={HREF} />
      <style>{CSS}</style>
    </>
  )
}
