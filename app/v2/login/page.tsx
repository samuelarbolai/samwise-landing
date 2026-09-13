import { redirect } from "next/navigation"
import { getSessionUserId } from "@/lib/v2/session"
import { LoginForm } from "../_components/login-form"

export default async function LoginPage() {
  if ((await getSessionUserId()) !== null) redirect("/v2/settings")
  return <LoginForm />
}
