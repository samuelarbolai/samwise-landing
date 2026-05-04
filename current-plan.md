# current-plan.md — Add scheduling buttons to samwise-landing

## Plan Summary
Add two scheduling buttons to the public landing page (`app/page.tsx`) that open the user's cal.com booking links in a new tab:
- **Problem Clarification and Belief System** → https://cal.com/samuel-giraldo-concha-yqvtot/30min
- **Fit Assessment** → https://cal.com/samuel-giraldo-concha-yqvtot/15min

The buttons must remain visually neutral / "styleless" so the page stays a blank canvas for designers. No shadcn `<Button>`, no Tailwind class additions beyond what is already used on the page; match the existing inline-style approach.

## Plan Architecture (Flow)
1. User loads `/` (the landing page).
2. User scrolls to the "Schedule your call" section.
3. User clicks one of the two new buttons.
4. The corresponding cal.com page opens in a new tab; the user books a slot directly in cal.com (no backend wiring on our side).

## Plan Structure (Directories and files)
Only one file is touched:
- `app/page.tsx` — add the two buttons inside the existing `<h3>Schedule your call:</h3>` section.

No new files, no new dependencies, no new components.

## Resolved decisions (from user)
1. **Placement:** Replace BOTH existing scheduling links (WhatsApp + Google Calendar).
2. **Copy mismatch (Fit Assessment 20 min vs cal.com 15min):** Leave copy untouched.
3. **Step 2 in onboarding:** "Problem Clarification and Belief System" is the renamed "Diagnosis and Prescription session". Update step 2's name accordingly; keep its 90-minute description.
4. **Button labels:** Exact names from the doc — "Problem Clarification and Belief System" and "Fit Assessment". No duration suffix on the buttons.
5. **Visual treatment:** Plain anchors were indistinguishable from body text (Tailwind v4 preflight strips default link styling via `color: inherit; text-decoration: inherit`). The bordered-button variant rendered ugly in practice. Final treatment: `<a style={{ textDecoration: "underline" }}>` — minimal "clickable text" affordance, no color/shape/padding opinions, lowest possible design bar.
6. **Orphan italic note** ("If we have availability, we might be able to make the Fit Assessment call right away if you call directly on WhatsApp."): Remove it.

## Modifications (in phases and steps)

### Phase 1 / Step 1 — Rename step 2 in the onboarding list
- **In-file location:** `app/page.tsx`, the `<p>` block starting `<strong>2. Schedule the Diagnosis and Prescription session.</strong>`.
- **Should not be modified:** The "It will last 90 minutes..." sentence and everything after it inside that paragraph.
- **Change:** Replace `Diagnosis and Prescription session` with `Problem Clarification and Belief System session`.

### Phase 1 / Step 2 — Replace the "Schedule your call" block
- **In-file location:** `app/page.tsx`, the section starting at `<h3>Schedule your call:</h3>` and continuing through the italic WhatsApp-availability `<p>`.
- **Should not be modified:** The `<h3>Schedule your call:</h3>` heading itself, and the `<hr>` separators above and below.
- **Replacement code:**
  ```tsx
  <h3>Schedule your call:</h3>

  <p>
    <a
      href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"
      style={{ textDecoration: "underline" }}
    >
      Fit Assessment
    </a>
    <br />
    <em>Start here if it's your first time.</em>
  </p>
  <p>
    <a
      href="https://cal.com/samuel-giraldo-concha-yqvtot/new-belief"
      style={{ textDecoration: "underline" }}
    >
      Problem Clarification and Belief System
    </a>
    <br />
    <em>Only if you've completed the Fit Assessment or are a current subscriber.</em>
  </p>
  ```
- **Explanation:** Two `<a>` tags inside `<p>`s, each followed by an `<em>` caption that explains who the meeting is for. Tailwind v4 preflight removes default link styling, so an explicit `text-decoration: underline` is needed for the anchors to be visually distinguishable from body text. Order is intentional: Fit Assessment first (entry point for new users); Problem Clarification and Belief System second (gated by Fit Assessment or active subscription).

### Testing phase
- **Local test:** `pnpm dev` → open `http://localhost:3000` → confirm both links render under "Schedule your call:", confirm step 2 in the onboarding list says "Problem Clarification and Belief System", confirm the WhatsApp/Google Calendar links and the italic disclaimer are gone, click each link to confirm it lands on the correct cal.com page.
- **Integration test:** none (no backend involved).
- **Update README:** N/A.

### After implementation
- Update `context-for-code-agent.md` if anything structural about the page changed (it didn't — copy update only).
- Mark this todo as DONE in the master vibe doc's Projects tab.
