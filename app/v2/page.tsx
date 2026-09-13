import { redirect } from "next/navigation"
import { getSessionUserId } from "@/lib/v2/session"

export default async function V2Index() {
  redirect((await getSessionUserId()) === null ? "/v2/login" : "/v2/settings")
}
