export const COLORS = {
  bg:      "oklch(0.97 0.008 70)",
  ink:     "oklch(0.12 0.010 250)",
  void:    "oklch(0.05 0.005 250)",
  star:    "oklch(0.92 0.015 80)",
  thread:  "oklch(0.18 0.008 250)",
  paper:   "oklch(0.98 0.005 70)",
} as const;

export const EASE = {
  outQuart: [0.25, 1, 0.5, 1] as const,
  outQuint: [0.22, 1, 0.36, 1] as const,
  outExpo:  [0.16, 1, 0.3, 1]  as const,
} as const;
