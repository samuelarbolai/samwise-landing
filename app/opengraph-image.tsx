import { ImageResponse } from 'next/og'

// Editorial poster for link unfurls (Slack / WhatsApp / iMessage / Twitter / etc.).
// Restraint over reach: just the brand mark — the Eärendil star (the nav .nav-star
// sparkle) and the "Samwise" wordmark in Fraunces italic 400 (the .brand treatment).
// No tagline, no pitch — the card states the name and lets it stand. SAMWISE.LIFE
// sits at the foot as a quiet colophon, not a call to action.
export const alt = 'Samwise'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const INK = '#000000'
const INK_MUTE = '#555555'
const GOLD = '#D4A85A'
const BG = '#FFFFFF'

// Fetch a Google Font binary for ImageResponse (Satori can't read CSS @font-face).
async function loadGoogleFont(family: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`
  const css = await (await fetch(url)).text()
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]
  if (!src) throw new Error(`Could not load font: ${family}`)
  return (await fetch(src)).arrayBuffer()
}

export default async function Image() {
  const wordmark = 'Samwise'
  const domain = 'SAMWISE.LIFE'

  const [frauncesItalic, manrope] = await Promise.all([
    // wordmark — matches .brand: italic, opsz 36, weight 400
    loadGoogleFont('Fraunces:ital,opsz,wght@1,36,400', wordmark),
    loadGoogleFont('Manrope:wght@600', domain),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '92px 0',
        }}
      >
        {/* Eärendil star — the landing's floating nav sparkle (thin gold sparkle). */}
        <svg width={42} height={42} viewBox="0 0 24 24" fill={GOLD}>
          <path d="M12 0 Q13 11, 24 12 Q13 13, 12 24 Q11 13, 0 12 Q11 11, 12 0 Z" />
        </svg>

        {/* wordmark — Fraunces italic 400, the .brand treatment. The card's whole statement. */}
        <div
          style={{
            fontFamily: 'FrauncesItalic',
            fontStyle: 'italic',
            fontSize: 156,
            fontWeight: 400,
            color: INK,
            letterSpacing: '-0.01em',
            lineHeight: 1,
          }}
        >
          {wordmark}
        </div>

        {/* domain colophon — Manrope small-caps, quiet wayfinding (not a CTA). */}
        <div
          style={{
            fontFamily: 'Manrope',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.22em',
            color: INK_MUTE,
          }}
        >
          {domain}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'FrauncesItalic', data: frauncesItalic, style: 'italic', weight: 400 },
        { name: 'Manrope', data: manrope, style: 'normal', weight: 600 },
      ],
    }
  )
}
