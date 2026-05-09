# current-plan.md — `/vingilot` variant: warm-gold star (antique gold ✦)

> Previous plan superseded.

## Plan Summary

Create a new variant `app/vingilot/` that forks the canonical landing page and adds a single chromatic note: the four-point star ✦ in the navbar (collapsed state) is rendered in **antique gold `#9B6B2E`** instead of pure ink-black. Everything else on the page is identical to canonical.

The star is the page's only persistent visual mark when nav is collapsed (~14–18px tall, top-center). Tinting it a muted brown-undertone gold reads as a tiny lit candle / illuminated-manuscript gold leaf, fitting Samwise's "torch through the dark" framing without breaking the editorial restraint of the rest of the page.

Decisions:
- **Tone:** `#9B6B2E` (antique gold). Brown-undertone, not modern brand orange or marketing yellow.
- **Scope:** color-only, on the `.nav-star` element. SVG geometry unchanged.
- **States:** color applies in both collapsed and expanded states (rule simpler; star is invisible when expanded anyway via `opacity: 0`).
- **Hover:** no color shift on hover — flat tone.
- **Variant pattern:** fully self-contained `app/vingilot/` folder; canonical untouched.

## Plan Architecture (Flow)

User scroll experience is unchanged from canonical. Only the navbar's collapsed state visually differs:
- Page load → only `✦` star visible at top-center, **antique gold** (was ink-black on canonical).
- Hover/tap → nav expands as on canonical; star fades out; expanded nav (brand + 4 links + EN/ES) remains in ink-black on white.
- Collapse-back → star fades back in, antique gold.

No scroll choreography changes. No copy changes. No layout changes.

## Plan Structure (Directories and files)

Files to create:
- `app/vingilot/page.tsx` — fork of `app/page.tsx`. Two changes only:
  1. Root element class: `vingilot-root` added to `editorial-root letter-root tease-root`.
  2. Brand link `href="/"` → `href="/vingilot"` (variant-scoped internal link per the variant pattern).
- `app/vingilot/vingilot.css` — single CSS rule scoped to `.vingilot-root` overriding the star color.

Files NOT to touch:
- `app/page.tsx` (canonical) — never modified for variant work.
- `app/styles.css` — base canonical styles untouched.
- Any other canonical page or variant.

## Modifications (in phases and steps)

### Phase 1 — Create the variant folder and CSS override

#### Step 1.1 — Create `app/vingilot/vingilot.css`

**File:** `app/vingilot/vingilot.css` (new)

**Code:**
```css
/* Vingilot variant — single chromatic note: the four-point star ✦ in
   the collapsed navbar is rendered in antique gold instead of ink-black.
   Everything else inherits canonical styles. The page's "two colors max"
   restraint is preserved by treating warm-gold as a flame accent on a
   single iconic element rather than a third semantic color. */
.vingilot-root .nav-star {
  color: #9B6B2E;
}
```

**Explanation:** The canonical `.nav-star` rule sets `color: var(--ink)` (ink-black). The SVG inside uses `fill="currentColor"`, so changing `color` on the parent `<button>` flows to the SVG fill. Scoped under `.vingilot-root` so it only applies inside the variant. No other selectors needed.

#### Step 1.2 — Create `app/vingilot/page.tsx`

**File:** `app/vingilot/page.tsx` (new)

**Code:** Verbatim fork of `app/page.tsx` with TWO modifications:

1. Add the variant CSS import alongside canonical styles. Replace:
   ```tsx
   import "./styles.css"
   ```
   With:
   ```tsx
   import "../styles.css"
   import "./vingilot.css"
   ```

2. Add `vingilot-root` to the root element classes. Replace:
   ```tsx
   <div className="editorial-root letter-root tease-root">
   ```
   With:
   ```tsx
   <div className="editorial-root letter-root tease-root vingilot-root">
   ```

3. Update the brand link `href` to point at the variant route (per variant pattern: internal links inside a variant point at variant routes). Replace:
   ```tsx
   <a href="/" className="brand">Samwise</a>
   ```
   With:
   ```tsx
   <a href="/vingilot" className="brand">Samwise</a>
   ```

   (All other links remain as-is: `#us`, `#try`, `#advisors` are anchors that work on any page; `/scientific-evidence` is allowed to point at the canonical page per the variant rule.)

**Explanation:** A clean fork of the canonical with three minimal edits. The CSS path changes from `./styles.css` to `../styles.css` because the variant lives one level deeper than canonical. The added `./vingilot.css` import layers the gold color override on top.

### Testing phase

#### Local test
1. `pnpm dev` from `samwise-landing/`.
2. Open `http://localhost:3000/vingilot`.
3. Verify with `preview_screenshot` and `preview_inspect`:
   - On page load (scroll 0): only `✦` star visible at top-center; computed `color` of `.nav-star` is `rgb(155, 107, 46)` (= `#9B6B2E`); SVG fill resolves to the same.
   - Hover the star (or tap on mobile): nav expands; star fades to opacity 0; brand + links + EN/ES toggle render in ink-black on white-with-blur backdrop (unchanged from canonical).
   - Move cursor away: nav collapses; antique-gold star fades back in.
   - Click brand "Samwise": navigates to `/vingilot` (stays in variant), not `/`.
   - Click "Scientific Evidence →": navigates to `/scientific-evidence` (canonical page).
4. Compare side-by-side with `/` (canonical) — only the star color should differ.
5. `preview_console_logs level: error` — no NaN warnings, no missing CSS imports.

#### Integration test
- Mobile (`preview_resize` to 375px): star still antique gold; tap-to-expand works.
- Scroll the full page in `/vingilot`: all canonical scroll choreography (hero fade, voice/lede pin, challenges freeze, interp+sigs, CTA pin, teaser, advisors, footer) works identically to `/`.

#### Update README
- Not required (samwise-landing has no README; variant pattern conventions handled via `context-for-code-agent.md`).

### After implementation
- Update `samwise-landing/context-for-code-agent.md`:
  - Add `vingilot/` to the `app/` tree, with one-line note: "Antique-gold star variant (`#9B6B2E` on `.nav-star`); otherwise identical to canonical."
- Manual user step: mark task DONE in master Vibe doc Projects tab.

## Notes for the next session

- The canonical `app/page.tsx` was NOT modified. To promote this variant: copy the gold rule into `app/styles.css` (drop the `.vingilot-root` scope), then delete `app/vingilot/`.
- If user wants to nudge the tone later: only `app/vingilot/vingilot.css` needs editing. `#B8860B` (dark goldenrod, slightly more saturated) and `#7A5424` (deeper, more bronze) are sensible neighbors.
