import { redirect } from "next/navigation"
import { getSessionUserId } from "@/lib/v2/session"
import { WhatsappSignup } from "../_components/whatsapp-signup"

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams
  // ?role=clinician: a clinician signing up to write a plan. They may already be signed in as themselves.
  if (role === "clinician") return <WhatsappSignup role="clinician" />
  if ((await getSessionUserId()) !== null) redirect("/v2/settings")
  return <WhatsappSignup />
}
