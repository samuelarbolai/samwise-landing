/**
 * The single trace path: one continuous gesture that reads, beat by beat, as
 * the user scrolls. The path describes WHERE the helping hand goes through
 * space (not the arm itself), starting upper-left, descending into the dark,
 * grasping, pulling back up, extending forward with a shield, and finally
 * raising the shield aloft.
 */

export const SCENE_VIEWBOX = { w: 800, h: 800 } as const;

export const TRACE_PATH =
  // Start: upper-left (the helper enters from off-screen).
  "M 160 120 " +
  // S1 — REACH DOWN to the right, deep into the dark area below.
  "C 240 220, 360 360, 480 540 " +
  // S2 — small inward loop = GRASP (the helper takes hold).
  "C 520 580, 540 540, 500 500 " +
  // S3 — PULL UP: the helped person rises.
  "C 460 420, 420 320, 380 240 " +
  // S4 — extend FORWARD: arm reaches out, shield in hand, offering.
  "C 400 200, 480 200, 560 220 " +
  // S5 — RAISE the shield aloft (final pose, slightly upper-right).
  "L 620 100";

/**
 * Approximate scroll progress at which the shield should fade in. The trace
 * has 5 conceptual segments of roughly equal length; the shield first appears
 * as the offering segment begins (~end of segment 3 / start of segment 4).
 */
export const SHIELD_FADE_IN  = 0.55;
export const SHIELD_FADE_OUT = 0.65; // i.e. fully opaque by 0.65
