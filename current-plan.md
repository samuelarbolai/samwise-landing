# current-plan.md — `/quiet-cta` variant: hidden hero CTA in the bottom-right corner

> Previous plan (`/vingilot`) superseded.

## Plan Summary

Create a new variant `app/quiet-cta/` that forks the canonical landing page and adds a single new element: a quiet "Schedule a fit assessment →" link in the bottom-right corner of the hero. At rest the link is **almost entirely hidden** — only a faint hairline arrow `→` is visible (no initially visible text). On hover, the full label fades in to the left of the arrow and the arrow reaches full ink-mute.

The link target is `#try` (the existing schedule anchor on the canonical page, which the variant keeps).

Decisions (locked in via the question round):
- **Reveal trigger:** hover hot-zone (recommended). A non-visible rectangle in the bottom-right of the hero wakes the CTA when the cursor enters it. The visible affordance is one hairline `→` glyph at low opacity, so users who scan the corner know something lives there — but no readable text shows until they intend to engage. This is the most intent-driven mechanism that still gives the CTA a chance to be discovered. Idle-delay was rejected (popup-y); always-faint was rejected (the user explicitly asked: "this won't include any initially visible text right?"); scroll-fade-in misses the requirement to appear on the *very first* screen.
- **Copy:** `Schedule a fit assessment →`
- **Variant folder name:** `/quiet-cta`
- **Mobile fallback:** the hover idiom doesn't translate to touch. On mobile the link renders as just the arrow at full opacity (no label, no reveal animation). Tapping the arrow goes straight to `#try`. The `aria-label` carries the full text for screen readers.

## Plan Architecture (Flow)

The hero behaviour is otherwise identical to canonical. The new element:
- Lives inside the first `FixedScene` (the hero), as a sibling of `.editorial-wrap`, positioned `absolute` to the bottom-right of the viewport (the FixedScene is `position: fixed; height: 100vh`, so absolute children are relative to the full viewport box).
- Because it's inside the hero `FixedScene`, its opacity is already gated by the hero's scroll-tied `useTransform` — it fades out alongside the headline between scroll 0.5vh → 0.85vh. No new scroll choreography to wire up.
- Inherits `pointer-events: auto` via the existing `.fixed-scene a, .fixed-scene button { pointer-events: auto; }` rule.

## Plan Structure (Directories and files)

Files to create:
- `app/quiet-cta/page.tsx` — fork of `app/page.tsx`. Three diffs (CSS import path, root class, the new anchor markup inside the hero FixedScene). Brand link `href="/"` becomes `href="/quiet-cta"` per the variant pattern.
- `app/quiet-cta/quiet-cta.css` — only the new rules scoped to `.quiet-cta-root`.

Files NOT touched:
- `app/page.tsx`, `app/styles.css` — canonical untouched.
- Any other variant.

## Modifications (in phases and steps)

### Phase 1 — Create the variant folder + CSS

#### Step 1.1 — Create `app/quiet-cta/quiet-cta.css`

```css
/* Quiet-CTA variant — adds a hidden "Schedule a fit assessment →" link
   to the bottom-right of the hero. At rest only the arrow is visible at
   low opacity; full label appears on hover. Scoped to .quiet-cta-root so
   nothing leaks into other variants. */

.quiet-cta-root .hero-quiet-cta {
  position: absolute;
  bottom: 48px;
  right: 48px;
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  text-decoration: none;
  color: var(--ink-mute);
  font-family: var(--font-sans, "Manrope", ui-sans-serif, system-ui, sans-serif);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  pointer-events: auto;
  /* Expand the interactive hot-zone leftward so the cursor doesn't have
     to land exactly on the 12px arrow glyph. Invisible — purely hit-area. */
}

.quiet-cta-root .hero-quiet-cta::before {
  content: "";
  position: absolute;
  inset: -20px -20px -20px -240px;
}

.quiet-cta-root .hero-quiet-cta .quiet-cta-text {
  opacity: 0;
  transform: translateX(8px);
  transition:
    opacity 360ms ease,
    transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.quiet-cta-root .hero-quiet-cta .quiet-cta-arrow {
  opacity: 0.35;
  transition: opacity 360ms ease;
}

.quiet-cta-root .hero-quiet-cta:hover .quiet-cta-text,
.quiet-cta-root .hero-quiet-cta:focus-visible .quiet-cta-text {
  opacity: 1;
  transform: translateX(0);
}

.quiet-cta-root .hero-quiet-cta:hover .quiet-cta-arrow,
.quiet-cta-root .hero-quiet-cta:focus-visible .quiet-cta-arrow {
  opacity: 1;
}

/* Mobile: no hover, so just render the arrow at full opacity. Tap goes
   straight to #try. The label stays hidden visually; aria-label carries
   it for screen readers. */
@media (max-width: 800px) {
  .quiet-cta-root .hero-quiet-cta {
    bottom: 32px;
    right: 24px;
    font-size: 11px;
  }
  .quiet-cta-root .hero-quiet-cta::before {
    inset: -16px -16px -16px -16px;
  }
  .quiet-cta-root .hero-quiet-cta .quiet-cta-text {
    display: none;
  }
  .quiet-cta-root .hero-quiet-cta .quiet-cta-arrow {
    opacity: 1;
  }
}

/* Respect reduced-motion. */
@media (prefers-reduced-motion: reduce) {
  .quiet-cta-root .hero-quiet-cta .quiet-cta-text,
  .quiet-cta-root .hero-quiet-cta .quiet-cta-arrow {
    transition: none;
  }
}
```

#### Step 1.2 — Create `app/quiet-cta/page.tsx`

Verbatim fork of `app/page.tsx` with these modifications:

1. Replace
   ```tsx
   import "./styles.css"
   ```
   with
   ```tsx
   import "../styles.css"
   import "./quiet-cta.css"
   ```

2. Replace
   ```tsx
   <div className="editorial-root letter-root tease-root">
   ```
   with
   ```tsx
   <div className="editorial-root letter-root tease-root quiet-cta-root">
   ```

3. Replace the brand link `href`:
   ```tsx
   <a href="/" className="brand">
   ```
   with
   ```tsx
   <a href="/quiet-cta" className="brand">
   ```

4. Inside the first `FixedScene` (the hero), add the corner link as a sibling of `.editorial-wrap`:
   ```tsx
   <FixedScene
     isFirst
     fadeInStart={0}
     fadeInEnd={1}
     fadeOutStart={vh * 0.5}
     fadeOutEnd={vh * 0.85}
   >
     <div className="editorial-wrap">
       <header className="editorial-landing-hero">
         <div className="eyebrow">{t.eyebrow}</div>
         <h1 className="editorial-hero-statement">{t.heroH1}</h1>
       </header>
     </div>
     <a
       className="hero-quiet-cta"
       href="#try"
       aria-label="Schedule a fit assessment"
     >
       <span className="quiet-cta-text" aria-hidden="true">Schedule a fit assessment</span>
       <span className="quiet-cta-arrow" aria-hidden="true">→</span>
     </a>
   </FixedScene>
   ```

   The label is `aria-hidden` because the anchor's `aria-label` already exposes the full text to assistive tech; otherwise screen readers would read the label twice.

### Testing phase

#### Local test
1. `pnpm dev` from `samwise-landing/` (or reuse the running preview).
2. Open `http://localhost:3000/quiet-cta`.
3. Verify with `preview_inspect` + `preview_eval`:
   - On page load, scroll 0:
     - `.hero-quiet-cta .quiet-cta-arrow` computed `opacity` is `0.35`.
     - `.hero-quiet-cta .quiet-cta-text` computed `opacity` is `0`.
     - The anchor's bounding rect is roughly `bottom: 48px, right: 48px` from the viewport.
   - Hover the corner (simulate via `dispatchEvent('mouseenter')` on `.hero-quiet-cta`):
     - Text opacity transitions to 1, arrow opacity to 1.
     - `transform` on `.quiet-cta-text` returns to `none` / `translateX(0)`.
   - Click the link: scrolls to `#try` (the schedule section).
   - Keyboard: tab to the link → `:focus-visible` triggers the same reveal.
4. Scroll to ~0.6vh and confirm the CTA is fading out with the hero (it inherits the FixedScene's scroll-tied opacity from its motion-div parent).
5. `preview_console_logs level: error` — no warnings.
6. Mobile via `preview_resize` to 375px:
   - `.quiet-cta-text` has `display: none`.
   - Arrow opacity is `1`.
   - Tap the arrow → navigates to `#try`.

#### Integration test
- Compare side-by-side with `/` (canonical): everything identical except the new corner mark.
- Confirm the corner link doesn't intercept clicks on the hero headline (it shouldn't — it lives in the bottom-right; the headline is centered).

#### Update docs
- After approval + implementation, update `samwise-landing/context-for-code-agent.md`:
  - Add `quiet-cta/` to the `app/` tree, with one-line note: "Adds a hover-revealed corner CTA in the hero (`Schedule a fit assessment →`). At rest: only a faint `→` glyph in the bottom-right. Mobile: arrow-only, tap routes to `#try`."

### After implementation
- Manual user step: mark task DONE in master Vibe doc Projects tab.

## Notes for the next session

- The canonical `app/page.tsx` was NOT modified.
- To promote this variant: copy the `.hero-quiet-cta` markup into canonical, drop the `.quiet-cta-root` scope from `quiet-cta.css` and merge it into `app/styles.css`, then delete `app/quiet-cta/`.
- If the user wants the CTA more discoverable: bump the at-rest arrow opacity from `0.35` → `0.5`, or shorten the reveal transition.
- If the user wants it more hidden: drop arrow opacity to `0.18`, or remove the visible arrow entirely and rely purely on the hot-zone (zero affordance — only the most curious users will find it).
