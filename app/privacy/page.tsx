import type { Metadata } from "next"
import { LegalPage } from "../v2/_components/legal-page"

export const metadata: Metadata = { title: "Privacy Policy — Samwise" }

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 16, 2026">
      <p>
        Samwise is an AI companion that helps you keep a daily ritual through phone calls and messages. What you share
        with Samwise is personal, so we keep it to what the service needs and we never sell it.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Your name, phone number, email (if you give it), language, time zone and call times.</li>
        <li>What you say on Samwise calls and write in messages (WhatsApp, text messages and email), and short summaries of them.</li>
        <li>The people you choose as your trusted contacts: their names and phone numbers, and whether they agreed to be contacted.</li>
        <li>Photos you send of your written ritual, which we copy into your own ritual document.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To place your ritual calls, answer your messages and remember your ritual from one call to the next.</li>
        <li>To reach your trusted contacts when you ask us to, or when a call shows you may need support.</li>
        <li>To improve how Samwise helps people keep their ritual.</li>
      </ul>

      <h2>Text messages (SMS)</h2>
      <p>
        If you agree to receive texts, Samwise texts you about your ritual and answers the texts you send. How often
        varies. Message and data rates may apply. Reply STOP at any time to stop, or HELP for help.
      </p>
      <p>
        We do not sell, rent or share your mobile number or your consent to receive texts with anyone for their
        marketing. Text messaging opt-in data is never shared with third parties, except the service providers that
        deliver the messages for us.
      </p>

      <h2>Who processes your data for us</h2>
      <p>
        We use service providers to run Samwise: Telnyx (calls, texts and WhatsApp), Cartesia (the call voice), Google
        (AI for messages, Google Docs and Gmail), Neon (our database), n8n (automation) and Vercel (this website). They
        process data only to provide their service to us.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Reply STOP to texts, or tell Samwise in the chat, to stop messages.</li>
        <li>Ask us to see, correct or delete your data at any time by writing to the email below.</li>
      </ul>

      <h2>Not an emergency service</h2>
      <p>
        Samwise is not a medical service or a crisis line. If you are in danger or thinking about harming yourself, call
        911 in the US (or your local emergency number), or call or text 988 for the Suicide &amp; Crisis Lifeline.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <a href="mailto:samuel@samwise.life">samuel@samwise.life</a>
      </p>
    </LegalPage>
  )
}
