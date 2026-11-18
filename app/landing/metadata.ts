import type { Metadata } from "next"
import { findRoute } from "./variants"

/** Page metadata for a landing route, from the config. */
export function variantMetadata(path: string): Metadata {
  const found = findRoute(path)
  if (!found) return {}
  const { route } = found
  const url = route.path === "/" ? "https://samwise.life" : `https://samwise.life${route.path}`
  const languages =
    route.lang && route.twin
      ? { [route.lang]: url, [route.lang === "en" ? "es" : "en"]: `https://samwise.life${route.twin}` }
      : undefined
  return {
    title: route.title,
    description: route.description,
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    openGraph: {
      title: route.title,
      description: route.description,
      url,
      siteName: "Samwise",
      type: "website",
      ...(route.lang ? { locale: route.lang } : {}),
    },
    twitter: { card: "summary_large_image", title: route.title, description: route.description },
  }
}
