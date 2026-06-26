// Source of truth for the framework blueprint.
// Mirrors the Onboarding script v0.3 (samwise-script-work). Update in lockstep
// when the script changes — this file is the page's only data dependency.

export type SubPhase = {
  id: string;
  label: string;
  beats: string[];
  vars_out?: string[];
};

export type Phase = {
  num: number;
  id: string;
  title: string;
  duration_min: number;
  goal: string;
  vars_in: string[];
  vars_out: string[];
  beats: string[];
  subphases?: SubPhase[];
  // Phase 12 renders the methodology diagrams inline (see methodology-diagrams.tsx).
  showMethodologyDiagrams?: boolean;
};

export type Rebound = {
  id: string;
  parent: string;
  topic: string;
  openWhen: string;
};

export const PHASES: Phase[] = [
  {
    num: 1,
    id: "phase-1",
    title: "Open and reflect",
    duration_min: 5,
    goal: "Reflect back what the prospect already shared in the demo, in their own words. Confirm before moving.",
    vars_in: [
      "behaviour_to_change",
      "core_motivation",
      "behaviour_example",
      "feelings_during_relapse",
      "intention_behind_action",
      "symbolic_anchor_description",
      "life_stage_context",
      "alternatives_tried",
      "why_alternatives_failed",
    ],
    vars_out: ["clinician_notes"],
    beats: [
      "Mirror demo data verbatim (behaviour + motivation + life-stage + worldview + the grounded moment).",
      "Wait for explicit confirmation; edit live if anything is corrected.",
      "Ask about anything that came up between sessions.",
    ],
  },
  {
    num: 2,
    id: "phase-2",
    title: "Diagnosis: locate the origin",
    duration_min: 8,
    goal: "Find when the loop turned on and what was around it. Framework comes after, not before.",
    vars_in: ["behaviour_example"],
    vars_out: [
      "problem_start_timeline",
      "experience_before",
      "experience_during",
      "experience_after",
      "feelings_at_origin",
      "thoughts_at_origin",
      "precipitantes",
      "mantenedores",
    ],
    beats: [
      "Anchor on the grounded moment, climb back in time.",
      "Ask what was happening in their life at that epoch (before / during / after).",
      "IFS reframe on the first occurrence: 'that part of you that acted there — what was it trying to do for you?'",
      "Note triggers (precipitantes) and what keeps it alive (mantenedores).",
    ],
  },
  {
    num: 3,
    id: "phase-3",
    title: "Offer a frame",
    duration_min: 5,
    goal: "Give them a model. Offer it as a candidate, not as the truth.",
    vars_in: [],
    vars_out: ["framework_metaphor"],
    beats: [
      "One reflection: 'when reality becomes uncomfortable, something appears that helps you escape, fast.'",
      "Offer two candidate framings: 'una gripa' vs 'un enemigo'.",
      "Adopt their wording if they bring their own — never substitute clinical terms.",
    ],
  },
  {
    num: 4,
    id: "phase-4",
    title: "Name the loop",
    duration_min: 7,
    goal: "State the loop back with their specifics. Offer candidate framings. Let them choose the wording. Name the enemy.",
    vars_in: ["behaviour_to_change", "scary_reality"],
    vars_out: ["scary_reality", "enemy_name"],
    beats: [
      "Offer candidate framings of scary_reality (3 phrasings + their own).",
      "Confirm the loop: scary_reality → behaviour_to_change.",
    ],
    subphases: [
      {
        id: "phase-4a",
        label: "4a — Name the enemy (carries forward through the whole system)",
        beats: [
          "Push for something concrete and textured — colloquial, profane, mythic, religious.",
          "From here on, every reference uses {{enemy_name}} — never 'el enemigo' generically.",
        ],
        vars_out: ["enemy_name"],
      },
    ],
  },
  {
    num: 5,
    id: "phase-5",
    title: "Define what a retroceso is for this user",
    duration_min: 4,
    goal: "Specific personal definition of a retroceso. The AI agent references this daily.",
    vars_in: ["behaviour_to_change", "scary_reality"],
    vars_out: ["relapse_definition"],
    beats: [
      "Propose: retroceso = behaviour_to_change as escape from scary_reality. 'Like a psychological fever.'",
      "Refine to their wording. Spoken word stays 'retroceso', never 'recaída'.",
    ],
  },
  {
    num: 6,
    id: "phase-6",
    title: "Immediate protection: habilitadores",
    duration_min: 7,
    goal: "Map what feeds {{enemy_name}} so we can block it. Action first, theory second.",
    vars_in: ["enemy_name"],
    vars_out: [
      "medium_of_consumption",
      "can_avoid_medium",
      "usual_consumption_company",
      "main_enabler",
    ],
    beats: [
      "Three habilitadores to probe: medio, gente, soledad.",
      "Identify the main_enabler (often soledad — they work with the medio).",
    ],
  },
  {
    num: 7,
    id: "phase-7",
    title: "Immediate protection: bloqueadores",
    duration_min: 12,
    goal: "Build the social-help bloqueador. Most resistance lives here — give it space.",
    vars_in: ["enemy_name", "behaviour_to_change"],
    vars_out: ["social_help_resistance_pattern", "helpers_list"],
    beats: [
      "Social help is the most effective bloqueador. Have you tried it?",
    ],
    subphases: [
      {
        id: "phase-7a",
        label: "7a — Handle resistance (very common — give it space)",
        beats: [
          "Name the pattern: not asking for help is part of the loop.",
          "Locate the fear: is it about how the other person will respond?",
          "Frame → concrete action, never frame → slogan. Land on a message-in-24h.",
        ],
        vars_out: ["social_help_resistance_pattern"],
      },
      {
        id: "phase-7b",
        label: "7b — Build the helpers list",
        beats: [
          "Names + relationships + reachable contact.",
          "At least one helper reachable on short notice.",
        ],
        vars_out: ["helpers_list"],
      },
    ],
  },
  {
    num: 8,
    id: "phase-8",
    title: "Add immediate protection to the ritual",
    duration_min: 4,
    goal: "Update the Ritual Doc with v1 mantras + bloqueador.",
    vars_in: ["clinical_picture_description", "enemy_name", "helpers_list"],
    vars_out: ["mantra_v1"],
    beats: [
      "Write 'Mantras de desidentificación' section into the Ritual Doc.",
      "Write 'Mantras de esperanza' section.",
      "Write 'Generación de protección' if-then block + helpers list.",
    ],
  },
  {
    num: 9,
    id: "phase-9",
    title: "New belief: define the unsettling reality",
    duration_min: 12,
    goal: "Refine scary_reality into its deeper form — the unsettling reality the new belief will face. ⚠️ THE MOST IMPORTANT MOMENT OF THE SESSION.",
    vars_in: ["behaviour_to_change", "scary_reality", "grado_de_identificacion"],
    vars_out: ["unsettling_reality"],
    beats: [
      "Bridge: protection holds the bleeding; now we help you face the underlying reality proactively.",
      "[low/medium grado] Ask straight: 'if you had to name what bothers you about scary_reality in a sentence, what would you say?'",
      "[high grado] Synthesis amplification: offer 2 opposed framings + an 'or something uglier' escape hatch.",
      "Apply the three-test quality bar (EXTENSIVE / THEIR VOICE / HONEST AND SPECIFIC) until it lands.",
    ],
  },
  {
    num: 10,
    id: "phase-10",
    title: "New belief: the three-beat surrender",
    duration_min: 9,
    goal: "Move their faith from outcomes they don't control to actions they do. Land it as three short sentences they speak daily.",
    vars_in: ["unsettling_reality", "symbolic_help_mantra"],
    vars_out: [
      "surrender_line_1",
      "surrender_line_2",
      "surrender_sequence",
      "precipitants_list",
    ],
    beats: [
      "Frase 1 — 'Lo que no controlo es ___' (default = unsettling_reality).",
      "Frase 2 — 'Lo que es más grande que mi voluntad y me sostiene es ___' (their tradition / symbolic anchor).",
      "Frase 3 — fixed text: 'Suelto el resultado y me quedo con sumar a mis listas hoy.'",
    ],
    subphases: [
      {
        id: "phase-10a",
        label: "10a — List the precipitants",
        beats: [
          "3+ concrete moments where unsettling_reality pushed toward behaviour_to_change.",
          "Apply IFS reframe per precipitant: 'what was that part trying to do for you?'",
        ],
        vars_out: ["precipitants_list"],
      },
    ],
  },
  {
    num: 11,
    id: "phase-11",
    title: "New belief: the leap of faith",
    duration_min: 5,
    goal: "Operationalize the leap. It is not believing harder — it is sitting down tomorrow for 5 minutes to add to two lists.",
    vars_in: ["unsettling_reality", "core_motivation"],
    vars_out: ["leap_of_faith_reaction"],
    beats: [
      "The leap = 5 min tomorrow, two lists. Nothing more.",
      "Surface discomfort with one question. Wait.",
      "Wait for explicit commitment.",
    ],
  },
  {
    num: 12,
    id: "phase-12",
    title: "Build the practice",
    duration_min: 10,
    goal: "Pick the symbolic mantra. Start the two lists. Set the community witness. Bookend with breath. Write the complete ritual.",
    vars_in: ["symbolic_anchor_description", "enemy_name", "unsettling_reality"],
    vars_out: [
      "symbolic_help_mantra",
      "cycle_learning_list_v1",
      "cycle_ideas_list_v1",
      "daily_activity_current_rung",
      "daily_activity_time_slot",
      "daily_activity_ladder",
      "community_witness",
      "pairing_protocol_v1",
      "mantra_v2",
    ],
    beats: [],
    showMethodologyDiagrams: true,
    subphases: [
      {
        id: "phase-12a",
        label: "12a — Pick the symbolic mantra",
        beats: [
          "Offer 2 candidate mantras FROM their named tradition (Stoicism / oración católica / Nietzsche / etc.).",
          "If anchor was 'ninguno', offer philosophical/scientific/ancestral alternatives — symbolic help is obligatorio.",
        ],
        vars_out: ["symbolic_help_mantra"],
      },
      {
        id: "phase-12b",
        label: "12b — Set Rung 1 of the climb",
        beats: [
          "Teach the 4-step cycle (aprender / idear / decidir / intentar). Rung 1 = just the two lists.",
          "Start Lista 1 (Aprender) live — what NEW info they have today; redirect if rumination.",
          "Start Lista 2 (Idear) live — what's under their control. No filter.",
          "Set time slot for the daily 5 min.",
          "Pick the community witness (one person). Hand over the community guide one-pager.",
          "[Optional] Sketch the ladder above (Rungs 2–5) with prediction + if-then at Rung 2.",
        ],
        vars_out: [
          "cycle_learning_list_v1",
          "cycle_ideas_list_v1",
          "daily_activity_current_rung",
          "daily_activity_time_slot",
          "community_witness",
          "daily_activity_ladder",
        ],
      },
      {
        id: "phase-12c",
        label: "12c — The pairing protocol",
        beats: [
          "Before (60s): one breath + recite the three frases + image of community_witness knowing.",
          "Lists (5 min).",
          "After (30s): one breath + 'Hoy sumé a mis listas, eso es mío' + gratitude.",
        ],
        vars_out: ["pairing_protocol_v1"],
      },
      {
        id: "phase-12d",
        label: "12d — Write the complete ritual",
        beats: [
          "Open the Ritual Doc.",
          "Write: mantras de desidentificación + esperanza + simbólico + the three frases + the cycle + escalón actual + the two lists + the witness + bloqueador + pareo.",
        ],
        vars_out: ["mantra_v2"],
      },
    ],
  },
  {
    num: 13,
    id: "phase-13",
    title: "Hand off to the AI agent",
    duration_min: 2,
    goal: "Hand the ritual to the daily AI agent.",
    vars_in: ["core_motivation"],
    vars_out: ["ritual_handed_off_to_agent", "next_optimization_date"],
    beats: [
      "The agent is a mirror, not a person — talk to it as you'd talk to yourself.",
      "If the ritual isn't working, we open an optimization session. Included.",
      "Confirm: first call scheduled, doc accessible, helpers know, next optimization date set.",
    ],
  },
  {
    num: 14,
    id: "phase-14",
    title: "Close",
    duration_min: 2,
    goal: "Acknowledge what was built. Point at the next part: using it.",
    vars_in: ["enemy_name"],
    vars_out: ["session_outcome"],
    beats: [
      "We made the map. We built the tool. Now comes using it.",
      "You declared war on {{enemy_name}}. You have a weapon. You are not alone.",
    ],
  },
];

export const REBOUNDS: Rebound[] = [
  { id: "15.1", parent: "Phase 3", topic: "Long biology teaching", openWhen: "Prospect needs to understand why the loop turned on; stuck in self-blame." },
  { id: "15.2", parent: "Phase 6", topic: "Habilitadores definition + 'ambiente frío'", openWhen: "Prospect answers the three probes mechanically without grasping why you're asking." },
  { id: "15.3", parent: "Phase 7", topic: "Vergüenza/acceso + 'medio es tu laptop'", openWhen: "Prospect resists social-help bloqueador and proposes blocking the medium instead." },
  { id: "15.4", parent: "Phase 7a", topic: "'Pedir ayuda = fe en sí mismo' theory", openWhen: "Concrete-action move offered and rejected because the resistance is moral, not logistical. ⚠️ Use sparingly." },
  { id: "15.5", parent: "Phase 9", topic: "Medical bridge: hemorragia → coser la herida → vacuna", openWhen: "Prospect is unclear why we're moving from protection to belief-work." },
  { id: "15.6", parent: "Phase 9", topic: "Enemy alternative: small enemy attacks despair", openWhen: "Prospect chose the enemy framing AND is showing fear in Phase 9. Mutually exclusive with 15.5." },
  { id: "15.7", parent: "Phase 10", topic: "Full expectations theory", openWhen: "Compressed Phase 10 didn't land — they nod but don't internalize. Captures surrender_line_2." },
  { id: "15.8", parent: "Phase 13", topic: "Handoff simile: 'como si estuvieras rezando'", openWhen: "Prospect responds to spiritual register. Use as addition, not replacement." },
];

export const SESSION_TOTALS = {
  phases: PHASES.length,
  duration_min: PHASES.reduce((sum, p) => sum + p.duration_min, 0),
};
