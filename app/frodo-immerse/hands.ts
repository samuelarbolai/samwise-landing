export type Beat = {
  id: "s1" | "s2" | "s3" | "s4" | "s5";
  /** Percent positions across the page composition (0..100). */
  cx: number;
  cy: number;
  /** Relative copy alignment vs the hand. */
  copyAlign: "left" | "right";
  /** Lucide icon name to render at this beat. */
  icon: "HandHelping" | "Handshake" | "HeartHandshake" | "HandGrab" | "Hand";
  /** CSS rotation in deg. */
  rotate?: number;
  /** Optional dark void positioned relative to the hand. */
  void?: { dx: number; dy: number; r: number };
  /** Optional luminous star. */
  star?: { dx: number; dy: number; r: number };
};

export const PAGE_VIEWBOX = { w: 800, h: 4000 } as const;

export const BEATS: Beat[] = [
  // S1 — A helping hand reaches DOWN into a dark void below it.
  {
    id: "s1",
    cx: 600,
    cy: 480,
    copyAlign: "left",
    icon: "HandHelping",
    rotate: 180,
    void: { dx: 60, dy: 220, r: 60 },
  },
  // S2 — A clasp.
  {
    id: "s2",
    cx: 400,
    cy: 1200,
    copyAlign: "right",
    icon: "Handshake",
  },
  // S3 — Two palms meeting with care; the call is taken.
  {
    id: "s3",
    cx: 400,
    cy: 1900,
    copyAlign: "left",
    icon: "HeartHandshake",
  },
  // S4 — A grabbing hand catches a falling mark.
  {
    id: "s4",
    cx: 360,
    cy: 2700,
    copyAlign: "right",
    icon: "HandGrab",
    void: { dx: 0, dy: -120, r: 22 },
  },
  // S5 — An open palm releases the star into light.
  {
    id: "s5",
    cx: 400,
    cy: 3500,
    copyAlign: "left",
    icon: "Hand",
    star: { dx: 0, dy: -160, r: 14 },
  },
];

export const THREAD_PATH =
  "M 600 0 " +
  "L 600 200 " +
  "Q 600 280 600 380 " +
  "Q 600 720 660 760 " +
  "Q 700 880 500 1000 " +
  "Q 400 1100 400 1380 " +
  "Q 400 1600 400 1700 " +
  "Q 400 2000 400 2080 " +
  "Q 400 2300 360 2400 " +
  "Q 360 2700 360 2880 " +
  "Q 360 3200 400 3260 " +
  "Q 400 3500 400 3800 " +
  "L 400 4000";
