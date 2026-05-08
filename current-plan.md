# current-plan.md — `/letter` variant: tighten distance, freeze frame, kill schedule, single CTA, redesigned navbar

> Previous plan superseded; adds Phase 5 (navbar redesign with collapse-to-star).

## Plan Summary

Continue iterating on the `/letter` variant of `samwise-landing`. Five discrete changes:

1. **Tighten lede-to-list distance** to canonical's spacing (`editorial-landing-hero` 140px bottom + `editorial-section` 160px top = ~300px gap). Remove the 40vh `voice-challenges-buffer`.
2. **Add a freeze frame** at the moment the last list item finishes revealing — content pins via CSS sticky inside a 200vh-tall section, holds for a beat, then fades out. Then a pause, then `interp+sigs` fades in. Items still reveal one-by-one via natural flow + `.reveal` (canonical timing) BEFORE sticky activates — only the section's invisible scroll height differs from canonical.
3. **Delete the schedule section entirely** — remove the `PinFadeScene`, all schedule copy keys, and the `Schedule` nav link.
4. **Move the cal.com Fit Assessment CTA into Step 1** as a single primary button. From Steps onward, the page reverts to canonical natural-flow with `.reveal` per step.
5. **Redesign the navbar.** Four links: `Us / Try / Advisors / Scientific Evidence`. Default state on page load = only a thin four-pointed sparkle (✦) at top-center, ink black. On hover (desktop) or tap (mobile/touch), the navbar expands horizontally to show brand + links + EN/ES toggle. On hover-out (or tap-out), it collapses back into the star. Smooth ~250ms fade.

End-state of `/letter` choreography:
- Hero `FixedScene` — fades out
- Pause
- Voice/lede `PinFadeScene` — fades in, pins, unpins
- Lede scrolls up; challenges list reveals one-by-one (canonical `.reveal`, IntersectionObserver threshold 0.12)
- Last item revealed → content pins via CSS sticky → freeze hold → opacity fade-out
- Pause
- Interp+sigs `FixedScene` — fades in, holds, fades out
- Pause
- **Steps in canonical natural flow** with `.reveal` per step + single `.cta--primary` CTA in Step 1 → Advisors → Footer

## Plan Architecture (Flow)

User scroll experience (vh = viewport height):

| ScrollY | Beat | Behavior |
|---|---|---|
| 0 → 0.5vh | Hero | `FixedScene`, opacity 1, isFirst |
| 0.5 → 0.85vh | Hero fade-out | opacity 1 → 0 |
| 0.85 → 1.0vh | Pause | nothing visible |
| 1.0 → 1.3vh | Voice/lede fade-in | `PinFadeScene`, pinned, opacity 0 → 1 |
| 1.3 → ~1.5vh | Voice/lede pin-release | pin ends, lede unpins |
| ~1.5 → ~2.3vh | Lede scrolls up; list items reveal one by one | natural flow; `.reveal` per `<li>` (canonical timing) |
| ~2.3 → ~2.8vh | Sticky pin activates → freeze hold | content pinned at viewport top:88; no further upward motion |
| 2.8 → 3.05vh | Frozen content fades out | opacity 1 → 0 |
| 3.05 → 3.2vh | Pause | nothing visible |
| 3.2 → 3.5vh | Interp+sigs fades in | `FixedScene`, opacity 0 → 1 |
| 3.5 → 3.8vh | Interp held | full opacity |
| 3.8 → 4.1vh | Interp fades out | opacity 1 → 0 |
| 4.1vh+ | **Canonical natural flow resumes** — Steps (with single CTA in Step 1, `.reveal` per step), Advisors, Footer | |

**Navbar interaction (independent of scroll):**
- Default (page load): only `✦` star visible at top-center, ink black, ~18-20px.
- On hover (desktop): nav expands horizontally to show `Samwise · Us · Try · Advisors · Scientific Evidence → · EN/ES`. Backdrop-blur white background appears.
- On hover-out: collapses back to star with ~250ms fade cross-transition.
- On mobile/touch: tap the star to toggle. Star stays visible; expanded state slides links in below or replaces star with row.

## Plan Structure

Files to modify:
- `app/letter/page.tsx` — restructure JSX (remove buffer + schedule, add freeze scene, steps to natural flow, redesign nav, add `FourPointStar` SVG component, add `navOpen` state)
- `app/letter/letter.css` — remove buffer, tighten padding to canonical, remove `.schedule-section` rules, add `.freeze-scene` + `.freeze-content` rules, replace `.editorial-nav` block with new collapsed/expanded logic, add `.cta--primary`

No new files. No deletions.

Files NOT to touch:
- `app/page.tsx` (canonical) — never modified for variant work
- `app/styles.css` — base canonical styles, only override in letter.css

## Modifications (in phases and steps)

### Phase 1 — Tighten lede-to-list distance (matches canonical)

#### Step 1.1 — Remove the `voice-challenges-buffer` element

**File:** `app/letter/page.tsx`

**Locate** (around line 334-338):
```tsx
{/* Empty buffer between voice and challenges. Critical: ensures the
    challenges section is fully off-screen the moment voice's fade-in
    completes, so the user sees lede alone first, scrolls up, THEN
    list items begin to appear from below. */}
<div className="voice-challenges-buffer" aria-hidden="true" />
```

**Replace with:** *(delete the entire element — `challenges-section` follows directly after voice's `</PinFadeScene>`)*

#### Step 1.2 — Tighten voice-hero bottom padding to match canonical

**File:** `app/letter/letter.css`

**Locate:**
```css
.voice-section .voice-hero {
  padding: 92px 0 56px;
  border-bottom: none;
  min-height: 0;
}
```

**Replace with:**
```css
.voice-section .voice-hero {
  /* 92px top: clear fixed nav (88px) + 4px → eyebrow lands at 180px from
     viewport top (matches canonical .editorial-landing-hero's 180px top).
     140px bottom: matches canonical .editorial-landing-hero's bottom padding. */
  padding: 92px 0 140px;
  border-bottom: none;
  min-height: 0;
}
```

#### Step 1.3 — Set challenges-section padding to canonical

**File:** `app/letter/letter.css`

**Locate:**
```css
.challenges-section {
  padding: 80px 0 80px;
  border-bottom: none;
  min-height: 80vh;
}
```

**Replace with:** *(min-height handled by Phase 2; padding tightened to canonical)*
```css
.challenges-section {
  /* 160px top + 160px bottom: matches canonical .editorial-section.
     min-height set by .freeze-scene rule in Phase 2. */
  padding: 160px 0;
  border-bottom: none;
}
```

#### Step 1.4 — Delete `.voice-challenges-buffer` CSS rule

**File:** `app/letter/letter.css`

**Locate:**
```css
.voice-challenges-buffer {
  height: 40vh;
  pointer-events: none;
}
```

**Replace with:** *(delete the rule entirely)*

### Phase 2 — Freeze frame and fade-out (option C: sticky + 200vh)

#### Step 2.1 — Wrap challenges-section content in a `ChallengesFreezeScene`

**File:** `app/letter/page.tsx`

**Locate** (around line 343-354):
```tsx
{/* Challenges — natural document flow at doc Y [2.3vh, 3.1vh]. List
    items appear via IntersectionObserver reveal as they scroll into
    view — same behavior as canonical. */}
<section className="challenges-section editorial-section">
  <div className="editorial-wrap">
    <div className="section-label">
      <span>{t.challengesLabel}</span>
    </div>
    <ol className="challenge-list">
      {t.challenges.map((c, i) => (
        <li key={i} className="reveal">{c}</li>
      ))}
    </ol>
  </div>
</section>
```

**Replace with:**
```tsx
{/* Challenges — sticky freeze scene. Items reveal one-by-one via
    canonical .reveal as they scroll into viewport in natural flow.
    AFTER all items revealed, sticky pins content at viewport top:88
    (the freeze hold). Then opacity fades to 0 over scrollY range. */}
<ChallengesFreezeScene fadeOutStart={vh * 2.8} fadeOutEnd={vh * 3.05}>
  <div className="editorial-wrap">
    <div className="section-label">
      <span>{t.challengesLabel}</span>
    </div>
    <ol className="challenge-list">
      {t.challenges.map((c, i) => (
        <li key={i} className="reveal">{c}</li>
      ))}
    </ol>
  </div>
</ChallengesFreezeScene>
```

#### Step 2.2 — Add `ChallengesFreezeScene` component

**File:** `app/letter/page.tsx`

**Locate:** end of `PinFadeScene` definition (around line 210, just after the closing brace).

**Add after** `PinFadeScene`:
```tsx
/* ChallengesFreezeScene — challenges list. Section is 200vh tall (set
   in CSS); content sits at section top in natural flow. Items reveal
   one-by-one via .reveal IntersectionObserver as they enter viewport
   from below — canonical timing. After all items revealed and content's
   natural top scrolls past viewport top:88, CSS `position: sticky` pins
   the content there, holding the frozen state. Opacity fades 1 → 0
   over [fadeOutStart, fadeOutEnd] scrollY range. */
function ChallengesFreezeScene({
  children,
  fadeOutStart,
  fadeOutEnd,
}: {
  children: ReactNode
  fadeOutStart: number
  fadeOutEnd: number
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(
    scrollY,
    [fadeOutStart - 1, fadeOutStart, fadeOutEnd],
    [1, 1, 0]
  )
  return (
    <section className="challenges-section editorial-section freeze-scene">
      <motion.div className="freeze-content" style={{ opacity }}>
        {children}
      </motion.div>
    </section>
  )
}
```

#### Step 2.3 — CSS for freeze-scene

**File:** `app/letter/letter.css`

**Add** (place near the `.pin-fade-scene` block, before responsive media queries):

```css
/* Challenges freeze scene — section is 200vh tall to give CSS sticky
   scroll real estate to pin against AFTER the natural reveal phase ends.
   Visible padding matches canonical (160/160 via .challenges-section);
   only the section's overall height differs. */
.freeze-scene {
  position: relative;
  min-height: 200vh;
}

.freeze-content {
  position: sticky;
  top: 88px;
  will-change: opacity;
}
```

#### Step 2.4 — Update interp scrollY range

**File:** `app/letter/page.tsx`

**Locate** (around line 274-279):
```tsx
<FixedScene
  fadeInStart={vh * 3.1}
  fadeInEnd={vh * 3.4}
  fadeOutStart={vh * 3.7}
  fadeOutEnd={vh * 4.0}
>
```

**Replace with:**
```tsx
<FixedScene
  fadeInStart={vh * 3.2}
  fadeInEnd={vh * 3.5}
  fadeOutStart={vh * 3.8}
  fadeOutEnd={vh * 4.1}
>
```

**Why:** challenges fades out 2.8 → 3.05vh, then pause 3.05 → 3.2vh, then interp fades in 3.2 → 3.5vh. Mirror of hero (0.5–0.85vh out, pause 0.85–1.0vh, voice in 1.0–1.3vh).

### Phase 3 — Delete schedule section

#### Step 3.1 — Remove all schedule copy keys + add `step1Cta`

**File:** `app/letter/page.tsx`

**In `copy.en` and `copy.es` objects, REMOVE:**
- `scheduleLabel`
- `scheduleCard1Tag`, `scheduleCard1Title`, `scheduleCard1Body`, `scheduleCard1Cta`
- `scheduleCard2Tag`, `scheduleCard2Title`, `scheduleCard2Body`, `scheduleCard2Cta`
- `navSchedule`

**ADD to `copy.en`:** `step1Cta: "Schedule here",`
**ADD to `copy.es`:** `step1Cta: "Agenda aquí",`

#### Step 3.2 — Remove the schedule `<PinFadeScene>` block entirely

**File:** `app/letter/page.tsx`

**Locate and DELETE the entire block** (around line 410-452):
```tsx
{/* Schedule — pin-fade. Container at doc Y [6.1vh, 7.4vh] (130vh tall). */}
<PinFadeScene
  id="schedule"
  className="schedule-section"
  fadeInStart={vh * 6.1}
  fadeInEnd={vh * 6.4}
>
  <div className="editorial-wrap">
    <section className="editorial-section">
      <div className="section-label">
        <span>{t.scheduleLabel}</span>
      </div>
      <div className="schedule-grid">
        {/* both schedule-cards */}
      </div>
    </section>
  </div>
</PinFadeScene>
```

#### Step 3.3 — Remove `.schedule-section` CSS rules

**File:** `app/letter/letter.css`

**Locate:**
```css
.voice-section { min-height: 90vh; }   /* lede only ≈ 420px; pin ≈ 302px ≈ fade-in 270px */
.steps-section { min-height: 200vh; }
.schedule-section { min-height: 130vh; }
```

**Replace with:**
```css
.voice-section { min-height: 90vh; }
/* steps-section/schedule-section dropped — steps becomes natural flow,
   schedule is removed entirely. */
```

**Also locate and DELETE:**
```css
.steps-section .editorial-section,
.schedule-section .editorial-section {
  padding: 92px 0 56px;
  border-bottom: none;
}
```

**Also locate and DELETE the responsive override:**
```css
.steps-section .editorial-section,
.schedule-section .editorial-section { padding-top: 76px; }
```

### Phase 4 — Convert steps from PinFadeScene to canonical natural flow + CTA in Step 1

#### Step 4.1 — Replace steps `<PinFadeScene>` with a regular `<section>`

**File:** `app/letter/page.tsx`

**Locate** (around line 360-408):
```tsx
{/* Steps — pin-fade. Container at doc Y [4.1vh, 6.1vh] (200vh tall). */}
<PinFadeScene
  id="steps"
  className="steps-section"
  fadeInStart={vh * 4.1}
  fadeInEnd={vh * 4.4}
>
  <div className="editorial-wrap">
    <section className="editorial-section">
      <div className="section-label">
        <span>{t.stepsLabel}</span>
      </div>

      <div className="step">
        <div className="step-number">01</div>
        ...all three steps...
      </div>
    </section>
  </div>
</PinFadeScene>
```

**Replace with:**
```tsx
{/* Steps — canonical natural flow. .reveal on each step fades it in via
    IntersectionObserver as it enters viewport. Step 1 contains the
    single primary CTA. id="try" for navbar anchor. */}
<div className="editorial-wrap">
  <section id="try" className="editorial-section">
    <div className="section-label">
      <span>{t.stepsLabel}</span>
    </div>

    <div className="step reveal">
      <div className="step-number">01</div>
      <div>
        <h3 className="step-title">{t.step1Title}</h3>
        <div className="step-body">
          <p>{t.step1Body}</p>
          <ul>
            <li>{t.step1ListIfFit}</li>
            <li>{t.step1ListIfNot}</li>
          </ul>
          <p style={{ marginTop: 28 }}>
            <a
              className="cta cta--primary"
              href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.step1Cta}
            </a>
          </p>
        </div>
      </div>
    </div>

    <div className="step reveal">
      <div className="step-number">02</div>
      <div>
        <h3 className="step-title">{t.step2Title}</h3>
        <div className="step-body">
          <p>{t.step2Body}</p>
        </div>
      </div>
    </div>

    <div className="step reveal">
      <div className="step-number">03</div>
      <div>
        <h3 className="step-title">{t.step3Title}</h3>
        <div className="step-body">
          <p>{t.step3Body}</p>
        </div>
      </div>
    </div>
  </section>
</div>
```

#### Step 4.2 — Add `.cta--primary` styling

**File:** `app/letter/letter.css`

**Add** (place near the `.sig-name` block):
```css
/* Primary CTA used in Step 1. Hairline-bordered, restrained, color-swap
   on hover. No gradient, no shadow, no animation — fits the editorial
   restraint of the rest of the page. */
.cta--primary {
  display: inline-block;
  font-family: 'Manrope', sans-serif;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--ink);
  padding: 14px 24px;
  text-decoration: none;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}
.cta--primary:hover {
  color: var(--bg);
  background: var(--ink);
  border-color: var(--ink);
}
```

### Phase 5 — Navbar redesign: 4 links + collapse-to-star

#### Step 5.1 — Add the `FourPointStar` SVG component

**File:** `app/letter/page.tsx`

**Add after** `SignatureUnderline` (around line 134):
```tsx
/* FourPointStar — thin four-pointed sparkle (✦), ink black via
   currentColor. Subtle quadratic curves between points so it reads as
   elegant rather than geometric. Used as the navbar's collapsed state. */
function FourPointStar({ size = 18 }: { size?: number }) {
  return (
    <svg
      className="four-point-star"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0 Q13 11, 24 12 Q13 13, 12 24 Q11 13, 0 12 Q11 11, 12 0 Z" />
    </svg>
  )
}
```

#### Step 5.2 — Replace the existing nav JSX with collapse-to-star nav

**File:** `app/letter/page.tsx`

**At the top of `EditorialHome`** (right after `const t = copy[lang]`), add nav state:
```tsx
const [navOpen, setNavOpen] = useState(false)
```

**Locate** (around line 237-251) the entire nav block:
```tsx
<nav className="editorial-nav editorial-nav--fixed">
  <a href="/letter" className="brand">Samwise</a>
  <div className="nav-right">
    <a href="#voice" className="nav-link">{t.navVoice}</a>
    <a href="#steps" className="nav-link">{t.navSteps}</a>
    <a href="#schedule" className="nav-link">{t.navSchedule}</a>
    <a href="#advisors" className="nav-link">{t.navAdvisors}</a>
    <a href="/scientific-evidence" className="nav-link">{t.navValidation} →</a>
    <div className="lang-toggle" role="group" aria-label="Language">
      <button onClick={() => setLang("en")} aria-pressed={lang === "en"}>EN</button>
      <span className="sep">/</span>
      <button onClick={() => setLang("es")} aria-pressed={lang === "es"}>ES</button>
    </div>
  </div>
</nav>
```

**Replace with:**
```tsx
<nav
  className={`editorial-nav editorial-nav--fixed editorial-nav--star ${navOpen ? "is-open" : "is-closed"}`}
  onMouseEnter={() => setNavOpen(true)}
  onMouseLeave={() => setNavOpen(false)}
>
  <button
    className="nav-star"
    onClick={() => setNavOpen((v) => !v)}
    aria-label={navOpen ? "Close navigation" : "Open navigation"}
    aria-expanded={navOpen}
  >
    <FourPointStar />
  </button>

  <div className="nav-content" aria-hidden={!navOpen}>
    <a href="/letter" className="brand">Samwise</a>
    <div className="nav-right">
      <a href="#us" className="nav-link">{t.navUs}</a>
      <a href="#try" className="nav-link">{t.navTry}</a>
      <a href="#advisors" className="nav-link">{t.navAdvisors}</a>
      <a href="/scientific-evidence" className="nav-link">{t.navValidation} →</a>
      <div className="lang-toggle" role="group" aria-label="Language">
        <button onClick={() => setLang("en")} aria-pressed={lang === "en"}>EN</button>
        <span className="sep">/</span>
        <button onClick={() => setLang("es")} aria-pressed={lang === "es"}>ES</button>
      </div>
    </div>
  </div>
</nav>
```

#### Step 5.3 — Update copy keys for new nav labels

**File:** `app/letter/page.tsx`

**In `copy.en`:** REMOVE `navVoice`, `navSteps`. ADD `navUs: "Us",` and `navTry: "Try",`.
**In `copy.es`:** REMOVE `navVoice`, `navSteps`. ADD `navUs: "Nosotros",` and `navTry: "Probar",`.

`navAdvisors` and `navValidation` remain unchanged.

#### Step 5.4 — Add `id="us"` anchor at the top of `<main>`

**File:** `app/letter/page.tsx`

**Locate** the start of `<main className="letter-main">` (around line 309) and the `hero-spacer`:
```tsx
<main className="letter-main">
  <div className="hero-spacer" aria-hidden="true" />
```

**Replace with:**
```tsx
<main className="letter-main">
  <div id="us" className="hero-spacer" aria-hidden="true" />
```

(Adding `id="us"` to the hero-spacer means the `Us` link scrolls to the top of the main content.)

#### Step 5.5 — Add CSS for collapsed/expanded nav + star

**File:** `app/letter/letter.css`

**Locate** the existing `.editorial-nav.editorial-nav--fixed` block (around line 30-40):
```css
.editorial-nav.editorial-nav--fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.82);
  -webkit-backdrop-filter: saturate(150%) blur(14px);
  backdrop-filter: saturate(150%) blur(14px);
  border-bottom: 1px solid var(--rule);
}
```

**Replace with:**
```css
/* Collapse-to-star navbar.
   Default state: only a thin 4-point sparkle floats centered at top.
   On hover (desktop) or tap (mobile), the full nav fades in over the
   star and the backdrop appears.
   Centered floating layout — not full-width — so the morph reads as
   "everything contracts toward the center." */
.editorial-nav.editorial-nav--fixed.editorial-nav--star {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  padding: 12px 24px;

  /* Backdrop only when expanded. */
  background: transparent;
  border-bottom: 1px solid transparent;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;

  transition:
    background 250ms ease,
    border-color 250ms ease,
    backdrop-filter 250ms ease,
    -webkit-backdrop-filter 250ms ease;
}

.editorial-nav--star.is-open {
  background: rgba(255, 255, 255, 0.82);
  border-bottom-color: var(--rule);
  -webkit-backdrop-filter: saturate(150%) blur(14px);
  backdrop-filter: saturate(150%) blur(14px);
}

/* Star — always rendered; visible only when nav is closed. */
.nav-star {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(1);
  background: transparent;
  border: 0;
  padding: 8px;
  color: var(--ink);
  cursor: pointer;
  opacity: 1;
  pointer-events: auto;
  transition: opacity 200ms ease, transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.editorial-nav--star.is-open .nav-star {
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%) scale(0.6);
}

/* Nav content — links + brand + lang toggle. Hidden by default,
   horizontally laid out + visible when open. */
.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1100px;
  opacity: 0;
  pointer-events: none;
  transform: scale(0.96);
  transition: opacity 250ms ease, transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.editorial-nav--star.is-open .nav-content {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1);
}

/* Hover hit area — when closed, only the star area should respond to
   mouseenter so casual mouse motion across the top of the page doesn't
   trigger expansion. Use pointer-events:none on the nav (closed) and
   pointer-events:auto on the star itself. */
.editorial-nav--star.is-closed { pointer-events: none; }
.editorial-nav--star.is-closed .nav-star { pointer-events: auto; }
.editorial-nav--star.is-open { pointer-events: auto; }
```

#### Step 5.6 — Update mobile responsive nav

**File:** `app/letter/letter.css`

**Locate** the existing mobile override:
```css
@media (max-width: 800px) {
  .letter-root .pin-fade-scene[id],
  .letter-root #advisors { scroll-margin-top: 72px; }
  .editorial-nav.editorial-nav--fixed { padding-top: 12px; padding-bottom: 12px; }
  .fixed-scene { padding-top: 72px; }
  .fixed-scene-inner { max-height: calc(100vh - 72px); }
  .pin-fade-content { top: 72px; }
  .voice-section .voice-hero { padding-top: 76px; }
  .steps-section .editorial-section,
  .schedule-section .editorial-section { padding-top: 76px; }
  .sig-name { font-size: 24px; }
}
```

**Replace with:**
```css
@media (max-width: 800px) {
  .letter-root .pin-fade-scene[id],
  .letter-root #advisors,
  .letter-root #try { scroll-margin-top: 72px; }
  .editorial-nav.editorial-nav--fixed { padding: 8px 16px; min-height: 48px; }
  .fixed-scene { padding-top: 72px; }
  .fixed-scene-inner { max-height: calc(100vh - 72px); }
  .pin-fade-content { top: 72px; }
  .voice-section .voice-hero { padding-top: 76px; }
  .sig-name { font-size: 24px; }

  /* Mobile nav: when open, allow links to wrap below the brand. */
  .editorial-nav--star .nav-content { flex-wrap: wrap; gap: 8px 16px; }
  .editorial-nav--star .nav-content .nav-right { flex-wrap: wrap; gap: 12px 18px; }
}
```

(Removed `scroll-margin-top` for `.steps-section .editorial-section, .schedule-section .editorial-section` since steps no longer uses that container and schedule is gone. Added `#try` to scroll-margin-top list.)

### Phase 6 — Final verification of doc layout and scrollY ranges

After Phases 1–5, the doc layout (assuming 900px viewport):

| Block | Doc Y range | Notes |
|---|---|---|
| `#us` (= `.hero-spacer`) | 0–100vh (0–900) | Anchor for `Us` link |
| `.voice-section` | 100–190vh (900–1710) | min-height 90vh |
| `.challenges-section` (= freeze-scene) | 190–390vh (1710–3510) | min-height 200vh |
| `.overlay-buffer` | 390–490vh (3510–4410) | unchanged 100vh, holds interp's scrollY range |
| `#try` Steps section | 490vh+ (4410+) | natural flow; `.reveal` per step |
| Advisors | natural flow after steps | no change |
| Footer | natural flow after advisors | no change |

ScrollY ranges:
- Hero: `[0, 1, 0.5*vh, 0.85*vh]` — unchanged
- Voice fade-in: `[1.0*vh, 1.3*vh]` — unchanged
- Challenges freeze fade-out: `[2.8*vh, 3.05*vh]` (via `ChallengesFreezeScene`)
- Interp: `[3.2*vh, 3.5*vh, 3.8*vh, 4.1*vh]` — updated in Step 2.4

**Empirical tuning expected** for the freeze fade-out range (2.8–3.05vh). After implementation, scroll the page and find the actual scrollY where the last list item is fully revealed AND the freeze pin has held for a beat. Set `fadeOutStart` slightly after that. Set `fadeOutEnd` ~25vh later. Adjust interp's `fadeInStart` to match (= challenges fadeOutEnd + 0.15vh pause).

### Testing phase

#### Local test
1. `pnpm dev` from `samwise-landing/`
2. Open `http://localhost:3000/letter`
3. Use `preview_eval` / `preview_screenshot` to verify each transition:
   - Scroll 0 → hero alone, navbar shows only `✦` star at top center
   - Scroll 0.85*vh → hero gone (opacity 0)
   - Scroll 1.0*vh → voice fade-in start, lede pinned
   - Scroll 1.3*vh → voice fully visible (opacity 1)
   - Scroll 1.5–2.0*vh → lede unpinning, scrolling up; first list items appearing one-by-one (`.visible` class added per `<li>`)
   - Scroll 2.0–2.3*vh → all list items revealed
   - Scroll 2.3–2.8*vh → sticky pin engages; freeze hold (content stays at viewport top:88)
   - Scroll 2.8–3.05*vh → frozen content fading out
   - Scroll 3.05–3.2*vh → pause (everything at opacity 0)
   - Scroll 3.2–3.5*vh → interp fades in
   - Scroll 4.1*vh+ → steps in natural flow; CTA clickable in Step 1; each step reveals via IntersectionObserver
4. Navbar interaction:
   - On page load → only `✦` star visible
   - Hover the star (desktop) → nav fades in with brand + 4 links + EN/ES
   - Move cursor outside nav area → nav fades back to star
   - On mobile (`preview_resize` to 375px) → tap star → nav appears, tap star again → collapses
5. Console check: `preview_console_logs level: error` for NaN warnings, missing CSS imports

#### Integration test
- Click `Us` → smooth scroll to top of `<main>` (~90vh from page top, inside hero-spacer)
- Click `Try` → smooth scroll to Steps section (`#try`), lands ~88px from viewport top
- Click `Advisors` → smooth scroll to advisors panel
- Click `Scientific Evidence →` → navigate to `/scientific-evidence`
- Click `Schedule here` CTA in Step 1 → opens `https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment` in new tab
- EN/ES toggle → all copy switches, including new `step1Cta`, `navUs`, `navTry`
- Mobile viewport (375px) → no horizontal overflow; sticky pin still works on touch

#### Update README
- Not required (samwise-landing has no README per the variant pattern conventions).

### After implementation
- Update `samwise-landing/context-for-code-agent.md`:
  - Document the new `ChallengesFreezeScene` and `FourPointStar` components
  - Note the new collapse-to-star nav pattern + 4 links
  - Note that schedule section was removed; CTA moved to Step 1
  - Update `/letter` choreography table
- Manual user step: mark task DONE in master Vibe doc Projects tab.

## Notes for the next session
- Read `samwise-landing-page` skill (auto-triggers in this project). Critical: never modify canonical `app/page.tsx`, always work in `app/letter/`.
- Read `samwise-landing/context-for-code-agent.md` (variant pattern, mobile-first rules).
- The `samwise-vibe-procedure` skill says: ask all questions before writing code. If anything in this plan is ambiguous (e.g. exact freeze timing, star animation feel), ask before implementing.
- Empirical tuning is required for freeze timing — measure after first pass, iterate.
