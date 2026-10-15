import { redirect } from "next/navigation"
import { getSessionUserId } from "@/lib/v2/session"
import { WhatsappSignup } from "../_components/whatsapp-signup"

export default async function SignupPage() {
  if ((await getSessionUserId()) !== null) redirect("/v2/settings")
  return <WhatsappSignup />
}
