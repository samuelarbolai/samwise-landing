import type { Variant, VariantRoute } from "./types"
import { HOME } from "./home"
import { SELF_MANAGED } from "./self-managed"
import { CLINICIANS } from "./clinicians"
import { TWELVE_STEPS } from "./twelve-steps"
import { COACHES } from "./coaches"

/** Every landing variant. Add a new one here (one file per variant). */
export const VARIANTS: Variant[] = [HOME, SELF_MANAGED, CLINICIANS, TWELVE_STEPS, COACHES]

export function findRoute(path: string): { variant: Variant; route: VariantRoute } | null {
  for (const variant of VARIANTS) {
    const route = variant.routes.find((r) => r.path === path)
    if (route) return { variant, route }
  }
  return null
}

/** Paths served by app/[slug]/page.tsx (everything but "/"), without the leading slash. */
export function slugs(): string[] {
  return VARIANTS.flatMap((v) => v.routes.map((r) => r.path)).filter((p) => p !== "/").map((p) => p.slice(1))
}
