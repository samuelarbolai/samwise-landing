import { VariantPage } from "./landing/variant-page"
import { variantMetadata } from "./landing/metadata"

export const metadata = variantMetadata("/")

/** Home page, from the landing config (app/landing/variants/home.ts). */
export default function Page() {
  return <VariantPage path="/" />
}
