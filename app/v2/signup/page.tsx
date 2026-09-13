import { redirect } from "next/navigation"
import { getSessionUserId } from "@/lib/v2/session"
import { SignupForm } from "../_components/signup-form"

export default async function SignupPage() {
  if ((await getSessionUserId()) !== null) redirect("/v2/settings")
  return <SignupForm />
}
