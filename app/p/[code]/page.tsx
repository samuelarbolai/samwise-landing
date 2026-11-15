import type { Metadata } from "next"
import { getPlanInvite } from "@/lib/v2/plan"
import { WhatsappSignup } from "../../v2/_components/whatsapp-signup"
import "../../v2/v2.css"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Samwise", robots: { index: false } }

/** A clinician's invite link. Shows the plan's questions, then the normal sign-up. */
export default async function PlanInvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const plan = await getPlanInvite(code).catch(() => null)
  return (
    <div className="v2-root">
      <WhatsappSignup plan={plan ?? undefined} planMissing={!plan} />
    </div>
  )
}
