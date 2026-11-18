import { notFound } from "next/navigation"
import { VariantPage } from "../landing/variant-page"
import { variantMetadata } from "../landing/metadata"
import { findRoute, slugs } from "../landing/variants"

/** Every landing variant route from the config (app/landing/variants), except "/". Others 404. */
export const dynamicParams = false

export function generateStaticParams() {
  return slugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return variantMetadata(`/${slug}`)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!findRoute(`/${slug}`)) notFound()
  return <VariantPage path={`/${slug}`} />
}
