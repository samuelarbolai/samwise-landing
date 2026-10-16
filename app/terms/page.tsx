import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage } from "../v2/_components/legal-page"

export const metadata: Metadata = { title: "Terms — Samwise" }

export default function TermsPage() {
  return (
    <LegalPage title="Terms" updated="October 16, 2026">
      <p>
        By signing up for Samwise you agree to these terms. Samwise is an AI companion that calls you at the times you
        choose and chats with you by WhatsApp, text message and email to help you keep a personal ritual.
      </p>

      <h2>Samwise messages (SMS program)</h2>
      <ul>
        <li>Program: Samwise ritual messages. Samwise texts you about your ritual (reminders, check-ins and replies to your messages).</li>
        <li>You opt in when you sign up at samwise.life and agree to receive messages, or when you text Samwise first.</li>
        <li>How often: it varies with your ritual and how much you write.</li>
        <li>Message and data rates may apply.</li>
        <li>Reply STOP to cancel at any time. You will get one message confirming you are unsubscribed.</li>
        <li>Reply HELP for help, or write to samuel@samwise.life.</li>
        <li>Carriers are not liable for delayed or undelivered messages.</li>
      </ul>

      <h2>What Samwise is and isn't</h2>
      <p>
        Samwise supports a habit you choose to build. It is not therapy, medical advice or an emergency service. If you
        are in danger, call 911 (or your local emergency number), or call or text 988 in the US.
      </p>

      <h2>Trusted contacts</h2>
      <p>
        If you add people as trusted contacts, you confirm they know you and are okay being contacted by Samwise on your
        behalf.
      </p>

      <h2>Your data</h2>
      <p>
        How we handle your information is in our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Changes and ending</h2>
      <p>
        Samwise is early and may change. You can stop at any time by replying STOP or telling Samwise in the chat, and
        ask us to delete your data. We may update these terms and will tell you about important changes.
      </p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:samuel@samwise.life">samuel@samwise.life</a>
      </p>
    </LegalPage>
  )
}
