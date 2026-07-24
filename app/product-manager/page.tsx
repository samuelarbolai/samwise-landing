import type { Metadata } from "next"
import ProductManagerClient from "./product-manager-client"

export const metadata: Metadata = {
  title: "Samuel Giraldo Concha — Product Manager",
  description: "Portfolio of Samuel Giraldo Concha, Product Manager focusing on AI-driven automation, healthcare leads, longevity medicine, and AI voice/chat agents.",
}

export default function ProductManagerPage() {
  return <ProductManagerClient />
}
