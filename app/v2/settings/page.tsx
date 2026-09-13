import { redirect } from "next/navigation"
import { getSessionUserId } from "@/lib/v2/session"
import { getUser, listSchedules, listCallLogs, listContacts } from "@/lib/v2/queries"
import { Dashboard } from "../_components/dashboard"

export default async function SettingsPage() {
  const userId = await getSessionUserId()
  if (userId === null) redirect("/v2/login")

  const user = await getUser(userId)
  if (!user) redirect("/v2/login")

  // Scoped to the session user at the query level, never filtered client-side.
  const [schedules, contacts, calls] = await Promise.all([
    listSchedules(userId),
    listContacts(userId),
    listCallLogs(userId, 20),
  ])

  return (
    <Dashboard
      user={user}
      initialSchedules={schedules}
      initialContacts={contacts}
      calls={calls}
    />
  )
}
