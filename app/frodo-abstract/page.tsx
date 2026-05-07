"use client";

import { MotionSection } from "./motion-section";
import { VideoPlaceholder } from "./video-placeholder";

export default function FrodoAbstractPage() {
  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "0 20px",
        lineHeight: "1.6",
      }}
    >
      <MotionSection tone="rise">
        <p>
          We are a team of mental health professionals, spiritual guidance
          practitioners and technology experts that want a definitive solution to
          overcome the toughest, untreated and most insidious behavioural
          challenges we have faced in our lives, the lives of our loved ones and
          in the lives of our patients:
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "20px 0" }}>
          <li>→ Screens addiction.</li>
          <li>→ Need for approval or impulsive love seeking behaviour.</li>
          <li>→ Addiction to porn.</li>
          <li>→ Social media addiction.</li>
          <li>→ Destructive relationships.</li>
        </ul>
        <p>
          These are just a few examples among the many more. But all behavioural
          issues out of the patient&apos;s control.
        </p>
        <p>
          We are building a solution for this. A solution that remains with you
          at all times of your journey of getting rid of the disease of
          self-destruction, and will not let go until you are completely cleared.
          We call it <strong>Samwise</strong>.
        </p>
        <p>
          Samwise is a system that helps you act against your own biology to be
          able to do what you need to do.
        </p>
      </MotionSection>

      <Divider />

      <MotionSection tone="lift">
        <h2>How can you make Samwise part of your life?</h2>
        <p>
          <strong>1. Schedule a Fit Assessment call.</strong> It will last 20 minutes. All the
          questions about the program will be answered here. The outcome will be
          whether we are a good fit for your needs or not.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 20px 20px" }}>
          <li>→ If we are a fit, program starts!</li>
          <li>→ If we are not, don&apos;t worry! We will recommend you other services, so you can always get help.</li>
        </ul>
        <p>
          <strong>2. Schedule the Problem Clarification and Belief System session.</strong> It will last 90
          minutes. (Yes we know, it is long. We need to make sure we do this part
          right to actually be able to help you). You will get a clear picture of
          your problem here, a clear path to a solution, and the first set up of
          your first ritual and AI Agent for your calls.
        </p>
        <p>
          <strong>3. You will start your ritual.</strong> We will monitor your progress, so we can
          schedule an optimization session to help you achieve progress faster.
        </p>
      </MotionSection>

      <Divider />

      <MotionSection tone="settle">
        <h3>Schedule your call:</h3>
        <p>
          <a
            href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"
            style={{ textDecoration: "underline" }}
          >
            Fit Assessment
          </a>
          <br />
          <em>Start here if it&apos;s your first time.</em>
        </p>
        <VideoPlaceholder
          label="[Video — Problem Clarification & New Belief System session, applied case]"
          caption="Problem Clarification and Belief System — only after the Fit Assessment, or for current subscribers."
        />
      </MotionSection>

      <Divider />

      <MotionSection tone="offered">
        <h3>What happens if it does not work at first and I have a relapse?</h3>
        <p>
          We offer an optimization call to dive deep into why the ritual is not
          working, and we make a new version of it. This is where most of our
          value is delivered.
        </p>
        <VideoPlaceholder label="[Video — Optimization call, applied case]" />
      </MotionSection>

      <Divider />

      <MotionSection tone="stillness">
        <p>
          The Samwise program has been designed with the close advice of{" "}
          <strong>Dr. Ana María Reyes Tirado</strong>
        </p>
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dr%20Ana%20Maria%20Reyes-LsqC4giUs3mSHIIIHhTkzmEKLOMXiq.png"
          alt="Dr. Ana María Reyes Tirado"
          width="150"
          style={{ display: "block", margin: "20px 0" }}
        />
        <p>Specialist in Neurofeedback of New Wind Academy, USA.</p>
        <p>Clinical Director of Fundación Syncronía.</p>
      </MotionSection>
    </main>
  );
}

function Divider() {
  return (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid #ccc",
        margin: "40px 0",
      }}
    />
  );
}
