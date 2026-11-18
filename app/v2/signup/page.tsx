import { redirect } from "next/navigation"
import { getSessionUserId } from "@/lib/v2/session"
import { WhatsappSignup } from "../_components/whatsapp-signup"
import { getLines, lineFor } from "@/lib/v2/lines"

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams
  // ?role=clinician: a clinician signing up to write a plan. They may already be signed in as themselves.
  // Clinicians chat on the clinician WhatsApp line once it is live (Neon samwise_lines).
  if (role === "clinician") return <WhatsappSignup role="clinician" waNumber={lineFor(await getLines(), "clinician")} />
  if ((await getSessionUserId()) !== null) redirect("/v2/settings")
  return <WhatsappSignup />
}
