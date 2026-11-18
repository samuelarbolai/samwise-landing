/**
 * Landing template: one config entry per landing variant (Samuel via Sales, requests row 44, 2026-11-18).
 * A variant holds its copy in both languages; each route is one entry point (path, language, ?src= tag).
 * To add a variant: add a file in this folder, list it in index.ts. No page code needed:
 * app/[slug]/page.tsx serves every route in the config, app/page.tsx serves "/".
 * Sales fills the fields in the "Samwise landing variant form" (Samwise shared folder).
 */
import type { PageLang } from "@/lib/lang"
import type { DemoVideoKey } from "../../_shared/demo-video"

/** The example card next to the headline. Optional. */
export type HeroCard =
  /** A handwritten journal entry (before / during / after), with a call chip above it. */
  | {
      kind: "entry"
      chip: string
      /** Show the chip in quotes (it is something Samwise says). */
      chipQuoted?: boolean
      entry: { day: string; before: string; during: string; after: string; next: string }
    }
  /** A clinician plan (questions), a call chip and the summary the patient sent. */
  | { kind: "plan"; label: string; questions: { text: string; yours: boolean }[]; chip: string; sentLabel: string; sent: string[] }
  /** A call chip, a journal page as question / answer rows, and a "shared with you" line. */
  | { kind: "journal"; chip: string; label: string; rows: { q: string; a: string }[]; sentLabel: string }

/** Sections below the hero, in order. "steps" gets the #how anchor, "faq" the #faq anchor. */
export type Section =
  | { kind: "steps"; title: string; items: { title: string; body: string }[] }
  /** Three short columns with a rule on top (the safety net / control / fit block), on paper. */
  | { kind: "columns"; title: string; items: { label: string; body: string }[] }
  /** A list with the gold star (what stays yours / what Samwise is not). */
  | { kind: "list"; title: string; items: string[] }
  | { kind: "faq"; title: string; items: { q: string; a: string }[] }

export type VariantCopy = {
  nav: { how: string; questions: string; cta: string }
  hero: {
    /** Small line above the headline (who the page is for). Optional. */
    tag?: string
    title: string
    sub: string
    cta: string
    /** Small print under the button. */
    under: string
    card?: HeroCard
    caption?: string
  }
  sections: Section[]
  close: {
    title: string
    /** Button text. Leave out on a share-link page. */
    cta?: string
    /** Share-link pages: a line above the link, e.g. "Send them this link." */
    text?: string
    under: string
  }
  footer: { left: string; right: string; mac?: string }
}

export type VariantRoute = {
  /** "/" or "/some-path". */
  path: string
  /** Fixed starting language. Leave out to follow ?lang=, the saved choice, then the phone's language. */
  lang?: PageLang
  /** ?src= tag for sign-ups from this route when the visitor's link has none. */
  src: string
  title: string
  description: string
  /** The same page in the other language, for search engines (hreflang). */
  twin?: string
}

export type Variant = {
  key: string
  /** Who reads it: someone who will use Samwise, or a professional who sends clients. */
  audience: "end-user" | "professional"
  /**
   * Where the buttons go: user sign-up, clinician sign-up, or (share-link) the buttons scroll
   * to a link the professional sends to a client: samwise.life/?src=<route src>.
   */
  signup: "user" | "clinician" | "share-link"
  video: DemoVideoKey | null
  /**
   * The check-in style for people who sign up from this variant's tags (Neon table
   * landing_src_focus, read by samwise_user_focus): recovery (default), own (no phone question
   * at night, "Today" journal), accountability (recovery journal, risk + slip asked on the call,
   * no phone question at night). Dev adds the Neon row when a variant goes live.
   */
  checkinFocus: "recovery" | "own" | "accountability"
  copy: Record<PageLang, VariantCopy>
  routes: VariantRoute[]
}
