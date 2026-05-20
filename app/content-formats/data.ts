export type Format = {
  num: string
  name: string
  tag: string
  desc: string
  components: { lead: string; rest: string }[]
  tones: string[]
}

export type BriefItem = { key: string; val: string }

export const brief: BriefItem[] = [
  {
    key: "Product",
    val: "Samwise — AI agent + psychological support system for breaking self-destructive behavior.",
  },
  {
    key: "Target Audience",
    val: "People with clarity and ambition who struggle with digital addiction, sexual compulsion, evasion, or procrastination.",
  },
  {
    key: "Content Strategy",
    val: "Founder's personal brand as the hook. Build audience trust before product launch.",
  },
  {
    key: "Primary Platform",
    val: "TikTok (top of funnel) → Substack + LinkedIn (depth) → Product.",
  },
  {
    key: "Brand Voice",
    val: "Personal, honest, relatable — but with authority. Not clinical. Not influencer-y.",
  },
  {
    key: "Founder Profile",
    val: "Second-time founder. Speaks from lived experience. Psychology + tech angle.",
  },
]

export const formats: Format[] = [
  {
    num: "01",
    name: "References",
    tag: "Multi-platform",
    desc:
      "Debate, explanation, or framing built around an external authority — a newspaper, Substack article, YouTube video, book, concept from Judaism, Lord of the Rings, philosophy. The point isn't the reference itself, but what it reveals about the problem Samwise solves.",
    components: [
      { lead: "The hook", rest: "Open with the reference in a way that feels surprising or counterintuitive — not like a lecture." },
      { lead: "The bridge", rest: "Connect the reference to a real feeling the audience has. “This is why you keep doing X.”" },
      { lead: "The frame", rest: "Offer a new lens or concept that recontextualizes the behavior." },
      { lead: "The authority anchor", rest: "Name the source clearly — it builds trust and curiosity to go deeper." },
      { lead: "The open end", rest: "End with a question or tension, not a resolution. Let the audience sit with it." },
    ],
    tones: ["Curious", "Intellectual", "Conversational", "Not preachy"],
  },
  {
    num: "02",
    name: "Roadmap to Building a Product",
    tag: "TikTok / LinkedIn",
    desc:
      "Founder-led narrative content. He's building in public. Second-time founder with scar tissue. This format is about the real, unglamorous process — debriefing decisions, talking about what broke, what he felt, what he learned. Not “startup tips.” Actual stories.",
    components: [
      { lead: "The moment", rest: "Start with a specific, concrete situation — not a lesson, a scene. “Last Tuesday we almost killed the product.”" },
      { lead: "The emotion", rest: "Name what he actually felt. Doubt, fear, excitement, confusion. This is what earns trust." },
      { lead: "The decision or debrief", rest: "What happened, what he chose, what broke or worked." },
      { lead: "The takeaway (optional)", rest: "Can be explicit or left implicit — sometimes the story is enough." },
      { lead: "The continuity", rest: "Every video subtly builds the Samwise universe. Reference the product as context, not promotion." },
    ],
    tones: ["Raw", "Specific", "Human", "Anti-guru"],
  },
  {
    num: "03",
    name: "Deep Dive on Frames / Issues",
    tag: "TikTok Long",
    desc:
      "The flagship format. A longer video that unpacks a psychological frame or behavioral issue — not to diagnose, but to help people see the issue from the outside. The goal: depersonalization of the problem. “You're not broken. Here's what's actually happening.”",
    components: [
      { lead: "The problem named precisely", rest: "Not “procrastination” — “the 3pm paralysis when the task is the one that actually matters.”" },
      { lead: "The frame", rest: "A psychological, philosophical, or behavioral concept that explains what's happening under the surface." },
      { lead: "Depersonalization", rest: "Help the viewer separate their identity from the behavior. “This is something you do, not who you are.”" },
      { lead: "New perspective", rest: "One insight that changes how they see it. Doesn't have to solve it — just shifts it." },
      { lead: "Soft CTA", rest: "Invite them to go deeper — comment, save, follow. Plant the seed for Samwise without selling." },
    ],
    tones: ["Thoughtful", "Grounded", "Clinical-lite", "Empowering"],
  },
  {
    num: "04",
    name: "Fast Tips, Tools & Tech",
    tag: "TikTok Short",
    desc:
      "High-velocity, immediately applicable content. Under 60 seconds. One thing you can do today. Also includes diagnostic content — questionnaires, classifications, “which type are you” — because people love to understand themselves and be offered a solution in the same breath.",
    components: [
      { lead: "Speed", rest: "No preamble. Hook in the first 2 seconds. “If you do this, stop.”" },
      { lead: "One thing only", rest: "One tip, one tool, one trick. Specificity over comprehensiveness." },
      { lead: "Questionnaire / classifier", rest: "“3 questions to know if you have X” — people share these. Builds algorithm reach." },
      { lead: "Solution bridge", rest: "After classifying them, hint at the solution. Creates urgency without selling." },
      { lead: "Repeatability", rest: "This format feeds a series. Easy to batch-produce. “Tool of the week.” “1-minute fix.”" },
    ],
    tones: ["Fast", "Direct", "Practical", "Confident"],
  },
  {
    num: "05",
    name: "Funny / Ironic Frames",
    tag: "TikTok / IG",
    desc:
      "Light-touch humor. Not stand-up. More like: a meme, an image, a 10-second clip that makes fun of the exact feeling the audience knows too well. Self-aware, not mean. The joke IS the insight. This format humanizes the brand and broadens reach without diluting the depth.",
    components: [
      { lead: "The relatable absurdity", rest: "The situation has to be so specific it feels private. “You know that thing where…”" },
      { lead: "Zero explanation", rest: "If you have to explain the joke, it's not the right joke. Trust the audience." },
      { lead: "Visual-first", rest: "Image or short video does the work. Text is the punchline, not the story." },
      { lead: "No CTA", rest: "These exist to share and relate. Don't push product. The brand wins by just being funny and knowing." },
    ],
    tones: ["Dry", "Self-aware", "Warm", "Never cruel"],
  },
  {
    num: "06",
    name: "Recommendations & Poetic References",
    tag: "Multi-platform",
    desc:
      "Books, quotes, ideas — curated through the lens of how someone feels, not what they should do. This is the softer, more poetic face of the brand. It creates emotional permission — makes people feel seen before asking them to change anything.",
    components: [
      { lead: "Feeling-first framing", rest: "Start with the emotion, not the recommendation. “For when everything feels urgent but nothing gets done.”" },
      { lead: "The recommendation", rest: "Book, quote, podcast, practice — presented as a gift, not a prescription." },
      { lead: "Why it matters here", rest: "One line connecting it to the Samwise worldview without being explicit about it." },
      { lead: "Hope, not solution", rest: "The point is to make people feel like change is possible, not to tell them how." },
    ],
    tones: ["Poetic", "Warm", "Curated", "Non-prescriptive"],
  },
  {
    num: "07",
    name: "Newsletter / Substack",
    tag: "Substack",
    desc:
      "The long-form home. Where the audience who wants more goes to go deeper. Topics mirror TikTok but with more nuance, more references, more personal. No algorithm pressure. Just writing.",
    components: [
      { lead: "The entry point", rest: "Open with a scene, a question, or a confession — not a thesis. Draw them in before you explain anything." },
      { lead: "The deeper frame", rest: "Go further than TikTok allows. Include research, philosophy, or personal experience." },
      { lead: "The Samwise connection", rest: "Natural, not forced. “This is part of what we're building.” Never a sales paragraph." },
      { lead: "One thing to do or think about", rest: "End with something actionable or a question for reflection." },
    ],
    tones: ["Honest", "Essayistic", "Personal", "Unhurried"],
  },
  {
    num: "08",
    name: "LinkedIn",
    tag: "LinkedIn",
    desc:
      "Fast summaries, quotes, or build-in-public moments that funnel professional audiences into the deeper content. LinkedIn is not where depth lives — it's a bridge. Short, punchy, with a clear reason to click.",
    components: [
      { lead: "The hook line", rest: "First line has to stop the scroll. Bold claim, counterintuitive take, or a number." },
      { lead: "3–5 punchy lines", rest: "Short sentences. One idea per line. LinkedIn rewards white space." },
      { lead: "The bridge", rest: "Link to the TikTok, Substack, or product. Clear and direct — “full video here.”" },
      { lead: "Professional angle", rest: "Frame behavioral issues through a productivity or leadership lens when relevant." },
    ],
    tones: ["Confident", "Punchy", "Professional-human", "Brief"],
  },
  {
    num: "09",
    name: "Proof of Concept / Cinematic",
    tag: "TikTok / IG",
    desc:
      "The brand-building wildcard. Cinematic, visually distinct, not directly selling. The goal is devotion — making people feel like Samwise is a world, a movement, something bigger than an app. This is where production value matters and the brand aesthetic is established.",
    components: [
      { lead: "Visual identity", rest: "Every frame should feel intentional. Color, light, setting — this is where Samwise's aesthetic is born." },
      { lead: "Minimal or no dialogue", rest: "Let visuals and music carry the emotion. Voiceover only if it adds something you can't show." },
      { lead: "The emotional arc", rest: "Stuck → movement. Fog → clarity. Even 30 seconds can carry this if edited well." },
      { lead: "No hard CTA", rest: "The content IS the CTA. If it makes someone feel something, they'll follow." },
      { lead: "Frequency", rest: "Use sparingly — 1 per month maximum. Overuse kills the mystique." },
    ],
    tones: ["Cinematic", "Aspirational", "Mysterious", "No-sell"],
  },
]
