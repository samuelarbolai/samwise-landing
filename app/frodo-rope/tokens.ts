export const COLORS = {
  bg:        "oklch(0.97 0.008 70)",     // warm off-white (page surface)
  ink:       "oklch(0.12 0.010 250)",    // deep ink (foreground on light)
  inkSoft:   "oklch(0.30 0.010 250)",    // soft ink
  inkLight:  "oklch(0.94 0.005 70)",     // near-white "ink" for use inside the hole
  void:      "oklch(0.06 0.005 250)",    // the inside-of-hole darkness
  rope:      "oklch(0.78 0.080 80)",     // luminous warm rope
  ropeGlow:  "oklch(0.86 0.090 80)",     // brighter halo color
  star:      "oklch(0.92 0.020 80)",     // the Vingilot star
} as const;

/** Heartbeat period in seconds. */
export const HEARTBEAT_S = 3.2;

/**
 * Phase mapping along scrollYProgress (0..1).
 */
export const PHASE = {
  s1Visible:    0.00,
  fall1Begin:   0.10,
  fall1Bottom:  0.28,
  hole1Hold:    0.42,
  rise1End:     0.52,
  star1Settle:  0.58,
  s3vReadable:  0.62,
  fall2Begin:   0.68,
  catch2:       0.78,
  rise2End:     0.86,
  s5Settle:     0.94,
  end:          1.00,
} as const;
