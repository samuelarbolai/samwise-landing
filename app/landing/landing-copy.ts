/**
 * Landing page copy (Samwise Sales, approved by Samuel 2026-11-14, facts v8).
 * Keep it verbatim. Later variants (therapy, on your own) swap a few lines here
 * and keep the template in landing.tsx unchanged.
 */
export type LandingCopy = {
  nav: { how: string; questions: string; cta: string }
  hero: {
    title: string
    sub: string
    cta: string
    under: string
    chip: string
    entry: { day: string; before: string; during: string; after: string; next: string }
    caption: string
  }
  how: { title: string; steps: { title: string; body: string }[] }
  net: { title: string; steps: { label: string; body: string }[] }
  yours: { title: string; items: string[] }
  faq: { title: string; items: { q: string; a: string }[] }
  close: { title: string; cta: string; under: string }
  footer: { left: string; right: string }
}

export const LANDING_EN: LandingCopy = {
  nav: { how: "How it works", questions: "Questions", cta: "Start your first check-in" },
  hero: {
    title: "Turn every slip into something you can work on.",
    sub: "Samwise calls you every day to check in. When you slip, you write what happened, in your own journal, ready for your sponsor.",
    cta: "Start your first check-in",
    under: "Free. No app. A short phone call and a notebook.",
    chip: "Have I slipped since my last check-in?",
    entry: {
      day: "Tuesday · slip",
      before: "Tired, alone after work, phone in bed.",
      during: "Numb. Told myself just five minutes.",
      after: "Ashamed. Phone charges in the kitchen tonight.",
      next: "→ talk to my sponsor Thursday",
    },
    caption: "Example entry written for this page. Not a real user.",
  },
  how: {
    title: "How it works",
    steps: [
      {
        title: "Check in every day.",
        body: "A short call with two questions: “Am I at risk today?” and “Have I slipped since my last check-in?”",
      },
      {
        title: "Write it down.",
        body: "Slipped? Write how you felt before, during and after. On paper or in your own Google Doc. Samwise keeps the dated entries.",
      },
      { title: "Bring it to your sponsor.", body: "It’s your journal. You choose who reads it." },
    ],
  },
  net: {
    title: "Miss a check-in, and your trusted people get a call.",
    steps: [
      { label: "Your call time", body: "Samwise calls. Busy? Ask it to call back later." },
      { label: "30 minutes", body: "Call Samwise yourself or do your check-in within 30 minutes and nobody is told." },
      { label: "Then", body: "Samwise calls your trusted people. Anyone who misses the call gets an email." },
    ],
  },
  yours: {
    title: "What stays yours",
    items: [
      "Samwise never shares what you write.",
      "No streaks.",
      "Works next to your meetings and your sponsor. It doesn’t replace them.",
    ],
  },
  faq: {
    title: "Questions",
    items: [
      { q: "Do I need an app?", a: "No. A phone call, WhatsApp, and your notebook or Google Doc." },
      { q: "Who reads my journal?", a: "You, whoever you show it to, and Samwise, so it can follow your steps. Your trusted people only hear that you wrote an entry, never what it says." },
      { q: "What if I miss a call?", a: "Call Samwise yourself within 30 minutes and nobody is told." },
    ],
  },
  close: { title: "One honest check-in a day.", cta: "Start your first check-in", under: "Free. No app. English or Spanish." },
  footer: {
    left: "Samwise · samwise.life",
    right: "Designed with behavioral psychologist Ana María Reyes. Samwise is an independent tool.",
  },
}
