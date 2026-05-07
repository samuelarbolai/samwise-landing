# current-plan.md — Frodo Hand-Vocabulary Variants (mid-fi sketch, two variants)

## Plan Summary

Replace the failed `app/frodo-scene/` direction with TWO new variants that share a single visual spine. The spine: a continuous thread runs the length of the page, periodically resolving into a stylised hand at each of the 5 narrative beats. The viewer is Frodo; the viewer is never drawn. The hand is the protagonist. High-contrast poster-like aesthetic — deep black on warm-tinted off-white, one luminous accent.

The two variants differ only in the *relationship between text and gesture*:

- `app/frodo-immerse/` — Copy is part of the gesture itself. The hand holds, writes, carries, releases the words. Text positions sit on or with the hand at each section.
- `app/frodo-apple/` — Scene is a quiet stage on one side; copy is the speaker on the other. Asymmetric two-column layout with very large headline type per beat, generous whitespace, Apple product-page energy.

The previous `app/frodo-scene/`, `app/frodo-literal/`, and `app/frodo-abstract/` stay in place for now (user comparison). After the user picks a winning lane, losing folders get deleted.

## The 5 Hand Vocabulary Beats

| # | Section | Hand atom | Connecting motion |
|---|---|---|---|
| 1 | The Problem | A hand reaches DOWN into darkness (a dark disc/void at lower-right). The hand emerges from off-screen above. | Thread enters from top, descends into the void. |
| 2 | The Big Help | A hand GRASPS another (a clasp). Two hand silhouettes meeting at a wrist-grip. | Thread rises out of the S1 void into the clasp. |
| 3 | Schedule (We Start) | Two hands MEETING at a single point (palms touching). The Fit Assessment link sits on this meeting. | Thread continues from S2 clasp into the meeting. |
| 4 | The Relapse | A hand CATCHES a falling shape (a small dark disc / mark in mid-fall). | Thread descends as the disc falls; the hand intercepts. |
| 5 | The Master | An open palm RELEASING into light (the star sits in the open palm). | Thread fades as the star ascends out of the palm. |

The thread is a single SVG `<path>` with `stroke-dasharray` driven by document scroll progress: as the user scrolls, the line draws itself. Each hand silhouette is fully rendered at all times (the hands are the page's visual anchors); only the thread between them animates.

## Plan Architecture (Flow)

1. User navigates to `/frodo-immerse` or `/frodo-apple`.
2. Page mounts: a single page-tall SVG renders the thread + 5 hand silhouettes.
3. As the user scrolls, the thread "draws itself" via stroke-dashoffset interpolated from `useScroll()`.
4. **Immerse variant:** copy elements are absolutely positioned over each hand region. Each section's text is anchored to its hand silhouette (the hand "holds" the words).
5. **Apple variant:** copy lives in a separate column with one large hero phrase per section ("Held.", "Sacred.", "Prepared.", etc.) plus the existing body copy at body size. Asymmetric: scene right, copy left on desktop; stacked on mobile.
6. `prefers-reduced-motion`: the thread renders fully drawn, no scroll-progress animation. Reduced-motion viewers see a complete poster.

## Plan Structure (Directories and files)

```
samwise-landing/
├── app/
│   ├── page.tsx                    # UNCHANGED
│   ├── layout.tsx                  # UNCHANGED
│   ├── globals.css                 # UNCHANGED
│   ├── held*/                      # UNCHANGED
│   ├── frodo-literal/              # UNCHANGED (older variant)
│   ├── frodo-abstract/             # UNCHANGED (older variant)
│   ├── frodo-scene/                # UNCHANGED FOR NOW (the rejected attempt; delete after user confirms new direction)
│   ├── frodo-immerse/              # NEW — text is part of the gesture
│   │   ├── page.tsx
│   │   ├── thread.tsx              # full-height SVG: thread + 5 hand silhouettes
│   │   ├── hands.ts                # 5 hand-silhouette path data + key Y positions
│   │   └── tokens.ts               # OKLCH palette, easings
│   └── frodo-apple/                # NEW — scene as quiet stage, copy as the speaker
│       ├── page.tsx
│       ├── thread.tsx              # same SVG as immerse but renders as a sticky scene column
│       ├── hands.ts                # same data as immerse (duplicated to keep folders deletable)
│       └── tokens.ts               # same as immerse
└── current-plan.md                 # THIS FILE
```

`motion` is reused. No new dependencies.

The hand path data and tokens are intentionally **duplicated** between the two variant folders so each variant is independently deletable (per project convention).

## Color Strategy (poster-like)

Restrained-but-graphic. High contrast. From `tokens.ts`:

```ts
export const COLORS = {
  bg:      "oklch(0.97 0.008 70)",     // warm-tinted off-white
  ink:     "oklch(0.12 0.010 250)",    // deep near-black, slight cool
  void:    "oklch(0.05 0.005 250)",    // the deepest mark (the disc Frodo falls toward)
  star:    "oklch(0.92 0.015 80)",     // the single luminous accent (warm gold-white)
  thread:  "oklch(0.18 0.008 250)",    // the connective line, just above ink so it reads
  paper:   "oklch(0.98 0.005 70)",     // for inset surfaces (apertures), one step lighter than bg
} as const;
```

This is the "poster" answer the user picked: off-white background, deep-black silhouettes, single luminous accent (the star).

## Modifications (in phases and steps)

### Phase 1 / Step 1 — Hand silhouette path data (`hands.ts`)

Five SVG path strings, each describing a stylised hand silhouette suitable for a poster. The hands are simple, iconic, ~120-180px tall in a 800-wide viewBox. Designed by hand.

For each hand we also record:
- `y`: the vertical center of the hand on the page-tall SVG (relative to a 4000-tall viewBox).
- `x`: horizontal position.
- `linkInY`, `linkOutY`: where the connective thread enters and exits this hand region.
- `copyAnchor`: where the copy column should align for this section in the Immerse variant.

Code (same in both variants):

```ts
export type Beat = {
  id: "s1" | "s2" | "s3" | "s4" | "s5";
  hand: string;       // SVG path data
  void?: string;      // optional dark disc / mark (S1, S4)
  star?: { cx: number; cy: number; r: number };
  cx: number; cy: number;
  linkInY: number;
  linkOutY: number;
  copyAnchor: { x: number; y: number; align: "left" | "right" };
};

export const HAND_VIEWBOX = { w: 800, h: 4000 } as const;

export const BEATS: Beat[] = [
  // S1 — A hand reaches DOWN into darkness. Hand enters top-right.
  {
    id: "s1",
    cx: 600, cy: 520,
    hand: "M 540 380 Q 545 320 590 305 Q 615 305 625 340 L 645 410 Q 660 440 655 470 Q 645 510 605 520 Q 565 525 540 510 Q 520 490 525 460 Z",
    void: "M 660 660 m -60 0 a 60 60 0 1 0 120 0 a 60 60 0 1 0 -120 0",
    linkInY: 200,
    linkOutY: 760,
    copyAnchor: { x: 60, y: 460, align: "left" },
  },
  // S2 — A hand GRASPS another (clasp). Two hand-silhouettes meeting at a grip.
  {
    id: "s2",
    cx: 400, cy: 1200,
    hand:
      // upper hand from above:
      "M 320 1080 Q 330 1130 360 1150 L 410 1180 Q 440 1190 460 1180 Q 480 1170 470 1150 L 430 1110 Q 400 1080 360 1075 Z " +
      // lower hand from below:
      "M 480 1280 Q 470 1230 440 1210 L 390 1180 Q 360 1170 340 1180 Q 320 1190 330 1210 L 370 1250 Q 400 1280 440 1285 Z",
    linkInY: 1000,
    linkOutY: 1380,
    copyAnchor: { x: 540, y: 1200, align: "left" },
  },
  // S3 — Two hands MEETING at a point. Palm-touch.
  {
    id: "s3",
    cx: 400, cy: 1900,
    hand:
      "M 240 1860 Q 280 1820 340 1830 Q 380 1840 395 1880 L 395 1920 Q 380 1950 340 1955 Q 280 1965 240 1925 Z " +
      "M 560 1860 Q 520 1820 460 1830 Q 420 1840 405 1880 L 405 1920 Q 420 1950 460 1955 Q 520 1965 560 1925 Z",
    linkInY: 1700,
    linkOutY: 2080,
    copyAnchor: { x: 60, y: 1900, align: "left" },
  },
  // S4 — A hand CATCHES a falling shape.
  {
    id: "s4",
    cx: 360, cy: 2700,
    hand: "M 280 2740 Q 290 2680 340 2670 L 420 2680 Q 470 2690 480 2730 L 470 2780 Q 450 2820 410 2830 L 320 2820 Q 280 2790 280 2740 Z",
    void: "M 380 2620 m -22 0 a 22 22 0 1 0 44 0 a 22 22 0 1 0 -44 0",
    linkInY: 2400,
    linkOutY: 2880,
    copyAnchor: { x: 540, y: 2700, align: "left" },
  },
  // S5 — Open palm RELEASING into light.
  {
    id: "s5",
    cx: 400, cy: 3500,
    hand: "M 280 3540 Q 280 3460 340 3440 L 460 3440 Q 520 3460 520 3540 L 510 3580 Q 480 3620 400 3625 Q 320 3620 290 3580 Z",
    star: { cx: 400, cy: 3360, r: 14 },
    linkInY: 3260,
    linkOutY: 3800,
    copyAnchor: { x: 60, y: 3500, align: "left" },
  },
];

// The connective thread: a single path connecting all linkInY/linkOutY through curves.
// It enters the page at top, descends past S1's void, rises into S2's clasp,
// continues into S3's meeting, descends to S4's catch, then ascends to S5's palm.
export const THREAD_PATH =
  "M 600 0 " +
  "L 600 200 " +
  "Q 600 280 600 380 " +                          // descends to S1
  "Q 600 720 660 760 " +                          // through S1 region
  "Q 700 880 500 1000 " +                         // sweeps left into S2
  "Q 400 1100 400 1380 " +                        // through S2 clasp
  "Q 400 1600 400 1700 " +                        // straight to S3
  "Q 400 2000 400 2080 " +                        // through S3 meeting
  "Q 400 2300 360 2400 " +                        // descends to S4
  "Q 360 2700 360 2880 " +                        // through S4 catch
  "Q 360 3200 400 3260 " +                        // ascends to S5
  "Q 400 3500 400 3800 " +                        // through S5 palm
  "L 400 4000";                                   // exits bottom
```

### Phase 1 / Step 2 — `tokens.ts` (both variants, identical content)

```ts
export const COLORS = {
  bg:      "oklch(0.97 0.008 70)",
  ink:     "oklch(0.12 0.010 250)",
  void:    "oklch(0.05 0.005 250)",
  star:    "oklch(0.92 0.015 80)",
  thread:  "oklch(0.18 0.008 250)",
  paper:   "oklch(0.98 0.005 70)",
} as const;

export const EASE = {
  outQuart: [0.25, 1, 0.5, 1] as const,
  outQuint: [0.22, 1, 0.36, 1] as const,
  outExpo:  [0.16, 1, 0.3, 1]  as const,
} as const;
```

### Phase 1 / Step 3 — `thread.tsx` (both variants, identical structure)

A single SVG sized to fill its container (`width: 100%; height: 100%`) with `viewBox="0 0 800 4000"` and `preserveAspectRatio="xMidYMin meet"` so the entire composition scales down/up cleanly without being cropped. Renders:

1. The dashed connective `<path>` whose `strokeDasharray` is interpolated by document scroll progress (so the line "draws" as the user scrolls).
2. The 5 hand silhouettes as solid `<path fill={COLORS.ink}>` (always present, like a poster).
3. The S1 and S4 dark `<circle>` voids.
4. The S5 star as a small `<circle>` with a soft halo (the single luminous accent).

```tsx
"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { BEATS, HAND_VIEWBOX, THREAD_PATH } from "./hands";
import { COLORS } from "./tokens";

export function Thread() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  // The thread's total length (approximated). For a 4000-tall path it's ~4000px.
  // We use a high pathLength to normalize: setting pathLength="1" lets us
  // treat dashoffset as a 0..1 value.
  const dashOffset = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <svg
      viewBox={`0 0 ${HAND_VIEWBOX.w} ${HAND_VIEWBOX.h}`}
      preserveAspectRatio="xMidYMin meet"
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-hidden
    >
      {/* Voids (S1, S4) */}
      {BEATS.filter((b) => b.void).map((b) => (
        <path key={`void-${b.id}`} d={b.void!} fill={COLORS.void} />
      ))}

      {/* Connective thread, drawn progressively */}
      <motion.path
        d={THREAD_PATH}
        stroke={COLORS.thread}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        pathLength="1"
        strokeDasharray="1 1"
        style={{ strokeDashoffset: reduced ? 0 : dashOffset }}
      />

      {/* Hand silhouettes (always rendered) */}
      {BEATS.map((b) => (
        <path key={b.id} d={b.hand} fill={COLORS.ink} />
      ))}

      {/* S5 star + halo */}
      {BEATS.filter((b) => b.star).map((b) => (
        <g key={`star-${b.id}`}>
          <circle cx={b.star!.cx} cy={b.star!.cy} r={b.star!.r * 2.2} fill={COLORS.star} opacity={0.18} />
          <circle cx={b.star!.cx} cy={b.star!.cy} r={b.star!.r} fill={COLORS.star} />
        </g>
      ))}
    </svg>
  );
}
```

### Phase 2 — Immerse variant (`app/frodo-immerse/page.tsx`)

The page is a positioned grid. The thread SVG fills the background of the entire page (full-height, behind the copy). Each section's copy is absolutely positioned to sit AT the hand's `copyAnchor`. Copy is monospaced or serif at body size; the hand "holds" the words because their X/Y positions overlap the hand's region.

Layout:
- Container: `position: relative`, `min-height: max(4000px, 5 * 100dvh)`. The 4000px ensures the SVG renders at full viewBox; sections also dictate scroll height.
- SVG: `position: absolute`, fills container, `z-index: 0`.
- Copy: positioned relative to the SVG via percent-of-page-height to match the hand positions.

```tsx
"use client";

import { Thread } from "./thread";
import { BEATS, HAND_VIEWBOX } from "./hands";
import { COLORS } from "./tokens";

const sectionContent: Record<string, { heading?: string; body: React.ReactNode }> = {
  s1: {
    body: (
      <>
        <p>
          We are a team of mental health professionals, spiritual guidance practitioners and
          technology experts that want a definitive solution to overcome the toughest, untreated
          and most insidious behavioural challenges we have faced in our lives, the lives of our
          loved ones and in the lives of our patients:
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "16px 0" }}>
          <li>→ Screens addiction.</li>
          <li>→ Need for approval or impulsive love seeking behaviour.</li>
          <li>→ Addiction to porn.</li>
          <li>→ Social media addiction.</li>
          <li>→ Destructive relationships.</li>
        </ul>
        <p>
          We are building a solution. We call it <strong>Samwise</strong>. A system that helps you
          act against your own biology to be able to do what you need to do.
        </p>
      </>
    ),
  },
  s2: { body: null }, // silent
  s3: {
    heading: "Schedule your call",
    body: (
      <>
        <p>
          <a href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment" className="cta">
            Fit Assessment
          </a>
          <br />
          <em>Start here if it's your first time.</em>
        </p>
      </>
    ),
  },
  s4: {
    heading: "What if it doesn't work the first time?",
    body: (
      <p>
        We offer an optimization call to dive deep into why the ritual is not working, and we
        make a new version of it. This is where most of our value is delivered.
      </p>
    ),
  },
  s5: {
    body: (
      <>
        <p>
          The Samwise program has been designed with the close advice of{" "}
          <strong>Dr. Ana María Reyes Tirado</strong>.
        </p>
        <p>Specialist in Neurofeedback of New Wind Academy, USA.</p>
        <p>Clinical Director of Fundación Syncronía.</p>
      </>
    ),
  },
};

export default function FrodoImmersePage() {
  return (
    <div
      className="immerse-root"
      style={{ background: COLORS.bg, color: COLORS.ink, position: "relative" }}
    >
      {/* Background SVG: fills the entire page height. */}
      <div className="immerse-svg">
        <Thread />
      </div>

      {/* Copy positioned at each hand's copyAnchor. */}
      <div className="immerse-copy">
        {BEATS.map((b) => {
          const c = sectionContent[b.id];
          if (!c?.body && !c?.heading) {
            // silent section: still occupies vertical space (S2)
            return <div key={b.id} className="immerse-block immerse-silent" data-id={b.id} />;
          }
          const yPercent = (b.copyAnchor.y / HAND_VIEWBOX.h) * 100;
          const align = b.copyAnchor.align;
          return (
            <div
              key={b.id}
              className={`immerse-block immerse-${align}`}
              style={{ top: `${yPercent}%` }}
              data-id={b.id}
            >
              {c.heading && <h3>{c.heading}</h3>}
              {c.body}
            </div>
          );
        })}
      </div>

      <style>{`
        .immerse-root {
          position: relative;
          min-height: 5000px; /* 5x typical viewport heights, ensures the SVG renders large */
        }
        .immerse-svg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .immerse-svg > svg {
          width: 100%;
          height: 100%;
        }
        .immerse-copy {
          position: relative;
          z-index: 1;
        }
        .immerse-block {
          position: absolute;
          width: 320px;
          font-size: 15px;
          line-height: 1.55;
        }
        .immerse-block.immerse-left {
          left: 24px;
          transform: translateY(-50%);
        }
        .immerse-block.immerse-right {
          right: 24px;
          transform: translateY(-50%);
        }
        .immerse-block.immerse-silent {
          height: 1px;
        }
        .immerse-block h3 {
          font-size: 1.1rem;
          margin: 0 0 8px;
        }
        .immerse-block .cta {
          color: inherit;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        @media (min-width: 1024px) {
          .immerse-block {
            width: 380px;
            font-size: 16px;
          }
          .immerse-block.immerse-left {
            left: max(48px, calc((100% - 800px) / 2 - 60px));
          }
          .immerse-block.immerse-right {
            right: max(48px, calc((100% - 800px) / 2 - 60px));
          }
        }
      `}</style>
    </div>
  );
}
```

The Immerse variant uses absolute positioning on copy blocks anchored to the hand `cy` percent (relative to the 4000px-tall SVG viewBox). The copy sits beside its hand, so visually the hand and the words are paired. The thread connects them all.

### Phase 3 — Apple variant (`app/frodo-apple/page.tsx`)

Asymmetric two-column layout. Scene (the same Thread component) is sticky on the right (desktop) or fixed top band (mobile, like before). Copy column on the left has very large headlines per section ("Held.", "Sacred.", "Prepared.", "Caught.", "Released.") plus the body copy at body size.

Apple-style means: per section, ONE big phrase, then quiet body copy. Generous whitespace. Each section is at least 100dvh tall. The reader scrolls and gets one clear emotional landing per section.

```tsx
"use client";

import { Thread } from "./thread";
import { COLORS } from "./tokens";

export default function FrodoApplePage() {
  return (
    <div style={{ background: COLORS.bg, color: COLORS.ink, position: "relative" }}>
      <main className="apple-main">
        <article className="apple-copy">
          <section>
            <h1 className="apple-hero">A definitive solution.</h1>
            <p>
              We are a team of mental health professionals, spiritual guidance practitioners and
              technology experts that want a definitive solution to overcome the toughest,
              untreated and most insidious behavioural challenges:
            </p>
            <ul>
              <li>Screens addiction.</li>
              <li>Need for approval or impulsive love seeking behaviour.</li>
              <li>Addiction to porn.</li>
              <li>Social media addiction.</li>
              <li>Destructive relationships.</li>
            </ul>
            <p>
              We are building Samwise. A system that helps you act against your own biology to be
              able to do what you need to do.
            </p>
          </section>

          <section className="apple-silent">
            <h1 className="apple-hero">Held.</h1>
          </section>

          <section>
            <h1 className="apple-hero">Begin.</h1>
            <p>
              <a href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment" className="cta">
                Fit Assessment
              </a>
              <br />
              <em>Start here if it's your first time.</em>
            </p>
          </section>

          <section>
            <h1 className="apple-hero">Caught.</h1>
            <p>
              If it does not work at first and you have a relapse, we offer an optimization call
              to dive deep into why the ritual is not working, and we make a new version of it.
              This is where most of our value is delivered.
            </p>
          </section>

          <section>
            <h1 className="apple-hero">You can rest.</h1>
            <p>
              The Samwise program has been designed with the close advice of{" "}
              <strong>Dr. Ana María Reyes Tirado</strong>.
            </p>
            <p>Specialist in Neurofeedback of New Wind Academy, USA. Clinical Director of Fundación Syncronía.</p>
          </section>
        </article>

        <aside className="apple-scene" aria-hidden>
          <Thread />
        </aside>
      </main>

      <style>{`
        .apple-main {
          display: block;
          position: relative;
          min-height: 100dvh;
        }
        .apple-scene {
          position: fixed;
          inset: 0 0 auto 0;
          height: 50dvh;
          z-index: 10;
          pointer-events: none;
        }
        .apple-copy {
          position: relative;
          z-index: 1;
          padding: calc(50dvh + 32px) 24px 80px;
          max-width: 720px;
          margin: 0 auto;
          line-height: 1.55;
        }
        .apple-copy section {
          min-height: 100dvh;
          padding: 60px 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .apple-copy section.apple-silent {
          min-height: 80dvh;
        }
        .apple-hero {
          font-size: clamp(40px, 8vw, 72px);
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.05;
          margin: 0 0 24px;
        }
        .apple-copy p { font-size: 17px; }
        .apple-copy ul {
          list-style: none;
          padding: 0;
          margin: 16px 0;
        }
        .apple-copy ul li {
          font-size: 17px;
          padding: 4px 0;
        }
        .apple-copy .cta {
          color: inherit;
          text-decoration: underline;
          text-underline-offset: 4px;
          font-size: 17px;
        }

        @media (min-width: 1024px) {
          .apple-main {
            display: grid;
            grid-template-columns: minmax(0, 560px) 1fr;
            grid-template-areas: "copy scene";
          }
          .apple-scene {
            grid-area: scene;
            position: sticky;
            inset: auto;
            top: 0;
            height: 100dvh;
          }
          .apple-copy {
            grid-area: copy;
            max-width: 560px;
            padding: 80px 56px;
            margin: 0;
          }
          .apple-hero {
            font-size: clamp(56px, 6vw, 96px);
          }
        }
      `}</style>
    </div>
  );
}
```

### Phase 4 — Browser pass

Open `pnpm dev` and walk both `/frodo-immerse` and `/frodo-apple` at desktop and mobile. Watch:
- The thread draws progressively as scroll advances.
- Hands and voids are clearly readable poster shapes.
- Copy is paired with the right hand (immerse) or speaks alongside the scene (apple).
- The star at S5 is the only luminous element on the page.
- `prefers-reduced-motion`: thread is fully drawn from page-load.

### Phase 5 — Critique-and-fix

After visual inspection, expect to iterate hand path data — these mid-fi shapes are the riskiest part. If a hand reads as "blob" instead of "hand", refine the path or supplement with a wrist line / inner contour mark.

### After implementation

1. Update `context-for-code-agent.md` to list `frodo-immerse` and `frodo-apple`.
2. Mark "New Landing Page Variant: TODO" status in master Vibe doc.
3. Once user picks a winner, delete the losing variant folders (and optionally `frodo-scene/`).
