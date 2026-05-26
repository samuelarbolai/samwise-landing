import { z } from "zod"

// Source of truth for qualification schemas. The worker
// (samwise-backend/ritual-agent/src/flows/qualification/schema.ts) mirrors
// these. When you change one, change both.

// ─── SetVariablesArgsSchema ────────────────────────────────────────────────
// Input schema for the agent's `setVariables` tool. The seven user-facing
// variables the agent commits as live notes during the conversation.
//
// Mirrors the inline schema in samwise-backend/ritual-agent/src/flows/
// qualification/agent.ts. Kept here so the text-mode chat route uses the
// same shape, and so the landing-side <VariablesPanel>'s VariableKey type
// can be derived from this schema rather than duplicated.
//
// All fields optional in any single call — the agent commits only the
// variables it has a verbatim user quote for in that turn.
export const SetVariablesArgsSchema = z.object({
  behaviour_to_change: z
    .string()
    .optional()
    .describe(
      "The specific verb-and-object action the user confirmed wanting to change. Must be a sentence, not a label. Only commit when grounded in a concrete recent incident AND confirmed by the user.",
    ),
  core_motivation: z
    .string()
    .optional()
    .describe("In the user's own words, what changing this unlocks for them."),
  problem_duration_self_reported: z
    .string()
    .optional()
    .describe("How long it's been a struggle, in the user's words."),
  life_stage_context: z
    .string()
    .optional()
    .describe("Where the user is in life right now — work, family, what's loud."),
  symbolic_anchor_description: z
    .string()
    .optional()
    .describe(
      "If the user draws strength from a tradition, philosophy, religion, or framework, their verbatim description of it. Skip if they don't have one.",
    ),
  alternatives_tried: z
    .string()
    .optional()
    .describe(
      "What the user has already tried, on their own or with help. 'none' if they haven't tried anything.",
    ),
  why_alternatives_failed: z
    .string()
    .optional()
    .describe(
      "For each thing they tried, what was missing. Empty if alternatives_tried is 'none'.",
    ),
})

export type SetVariablesArgs = z.infer<typeof SetVariablesArgsSchema>

// ─── EndCallArgsSchema ──────────────────────────────────────────────────────
// Input schema for the agent's `endCall` tool — no arguments. Called to
// signal a natural end of conversation, after the closing line is spoken.
export const EndCallArgsSchema = z.object({})

// ─── QualificationPayloadSchema ────────────────────────────────────────────
// The full structured payload produced by the extractQualification cloud
// function from a conversation transcript (and read back by /copilot's
// loadQualification). Mirrors the schema in cloud-functions/index.ts's
// extractQualification.
//
// Self-contained — no longer extends a separate GateDecisionSchema. The
// gate verdicts and categorical inferences live here alongside the seven
// user-facing fields (which echo SetVariablesArgsSchema but are stored
// post-extraction, not committed live).
export const QualificationPayloadSchema = z.object({
  // Identifiers (worker-injected from dispatch metadata; CF merges in).
  prospect_name: z.string(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  language: z.enum(["es", "en"]),

  // Gate verdicts — inferred by the extraction LLM from the transcript.
  // "unknown" tolerated as a sentinel when the conversation didn't surface
  // enough signal; the cloud function treats it as a non-pass.
  decision_taken: z.enum(["Y", "N", "unknown"]),
  behaviour_clarity: z.enum(["clear", "vague", "unknown"]),
  motivation_clarity: z.enum(["clear", "vague", "unknown"]),

  // User-facing variables — same seven fields as SetVariablesArgsSchema.
  behaviour_to_change: z.string().optional(),
  // Full grounded incident description (WHEN/WHERE/ACTIVITY/ACTION as a
  // noun-phrase). Used as Phase 5b Step 1's moment-anchor in the Demo Call
  // copilot. Produced post-call by extractQualification from the transcript
  // — never live-committed by the agent during the conversation.
  behaviour_example: z.string().optional(),
  core_motivation: z.string().optional(),
  problem_duration_self_reported: z.string().optional(),
  life_stage_context: z.string().optional(),
  symbolic_anchor_type: z
    .enum(["religious", "philosophical", "esoteric", "hyper-rational", "none", "unknown"])
    .optional(),
  symbolic_anchor_description: z.string().optional(),
  alternatives_tried: z.string().optional(),
  why_alternatives_failed: z.string().optional(),
  alternatives_exhaustion_level: z.enum(["low", "medium", "high", "unknown"]).optional(),
})

export type QualificationPayload = z.infer<typeof QualificationPayloadSchema>
