import type { LandingCopy } from "../landing-copy"
import type { VariantCopy } from "./types"

/** The home-page copy shape (landing-copy.ts) as a template copy: hero entry card, steps, safety net, yours, FAQ. */
export function fromLandingCopy(c: LandingCopy): VariantCopy {
  return {
    nav: c.nav,
    hero: {
      title: c.hero.title,
      sub: c.hero.sub,
      cta: c.hero.cta,
      under: c.hero.under,
      card: { kind: "entry", chip: c.hero.chip, chipQuoted: true, entry: c.hero.entry },
      caption: c.hero.caption,
    },
    sections: [
      { kind: "steps", title: c.how.title, items: c.how.steps },
      { kind: "columns", title: c.net.title, items: c.net.steps },
      { kind: "list", title: c.yours.title, items: c.yours.items },
      { kind: "faq", title: c.faq.title, items: c.faq.items },
    ],
    close: c.close,
    footer: c.footer,
  }
}

/** The clinician-copy.ts shape as a template copy. */
export function fromClinicianCopy(c: import("../clinician-copy").ClinicianCopy): VariantCopy {
  return {
    nav: c.nav,
    hero: {
      tag: c.hero.tag,
      title: c.hero.title,
      sub: c.hero.sub,
      cta: c.hero.cta,
      under: c.hero.under,
      card: { kind: "plan", label: c.hero.planLabel, questions: c.hero.questions, chip: c.hero.chip, sentLabel: c.hero.sentLabel, sent: c.hero.sent },
      caption: c.hero.caption,
    },
    sections: [
      { kind: "steps", title: c.how.title, items: c.how.steps },
      { kind: "columns", title: c.control.title, items: c.control.items.map((i) => ({ label: i.title, body: i.body })) },
      { kind: "list", title: c.not.title, items: c.not.items },
      { kind: "faq", title: c.faq.title, items: c.faq.items },
    ],
    close: c.close,
    footer: c.footer,
  }
}
