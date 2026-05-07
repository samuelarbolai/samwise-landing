export const COLORS = {
  bg:       "oklch(0.97 0.005 250)",
  ink:      "oklch(0.20 0.015 250)",
  mountain: "oklch(0.30 0.020 250)",
  horizon:  "oklch(0.55 0.010 250)",
  star:     "oklch(0.92 0.005 250)",
  ring:     "oklch(0.15 0.020 250)",
} as const;

export const EASE = {
  outQuart: [0.25, 1, 0.5, 1] as const,
  outQuint: [0.22, 1, 0.36, 1] as const,
  outExpo:  [0.16, 1, 0.3, 1]  as const,
} as const;
