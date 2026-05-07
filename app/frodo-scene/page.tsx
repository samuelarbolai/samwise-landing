"use client";

import {
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { Scene } from "./scene";
import { Aperture } from "./aperture";
import { COLORS } from "./tokens";

export default function FrodoScenePage() {
  const handTrigger = useMotionValue(0);

  const s2Ref = useRef<HTMLElement>(null);
  const s4Ref = useRef<HTMLElement>(null);

  const { scrollYProgress: s2 } = useScroll({
    target: s2Ref,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: s4 } = useScroll({
    target: s4Ref,
    offset: ["start end", "end start"],
  });
  const s2Hand = useTransform(s2, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);
  const s4Hand = useTransform(s4, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const update = () =>
      handTrigger.set(Math.max(s2Hand.get(), s4Hand.get()));
    const u1 = s2Hand.on("change", update);
    const u2 = s4Hand.on("change", update);
    update();
    return () => {
      u1();
      u2();
    };
  }, [handTrigger, s2Hand, s4Hand]);

  return (
    <div
      style={{
        background: COLORS.bg,
        color: COLORS.ink,
        minHeight: "100dvh",
      }}
    >
      <main className="frodo-scene">
        <article className="frodo-copy">
          <section>
            <p>
              We are a team of mental health professionals, spiritual guidance
              practitioners and technology experts that want a definitive
              solution to overcome the toughest, untreated and most insidious
              behavioural challenges we have faced in our lives, the lives of
              our loved ones and in the lives of our patients:
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "20px 0" }}>
              <li>→ Screens addiction.</li>
              <li>→ Need for approval or impulsive love seeking behaviour.</li>
              <li>→ Addiction to porn.</li>
              <li>→ Social media addiction.</li>
              <li>→ Destructive relationships.</li>
            </ul>
            <p>
              These are just a few examples among the many more. But all
              behavioural issues out of the patient&apos;s control.
            </p>
            <p>
              We are building a solution for this. A solution that remains with
              you at all times of your journey of getting rid of the disease of
              self-destruction, and will not let go until you are completely
              cleared. We call it <strong>Samwise</strong>.
            </p>
            <p>
              Samwise is a system that helps you act against your own biology
              to be able to do what you need to do.
            </p>
          </section>

          <section
            ref={s2Ref}
            aria-label="Sam carries Frodo"
            className="frodo-silent"
          />

          <section>
            <h3>Schedule your call:</h3>
            <p>
              <a
                href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"
                className="frodo-cta"
              >
                Fit Assessment
              </a>
              <br />
              <em>Start here if it&apos;s your first time.</em>
            </p>
            <Aperture
              label="[Video — Problem Clarification & New Belief System session, applied case]"
              caption="Problem Clarification and Belief System — only after the Fit Assessment, or for current subscribers."
            />
          </section>

          <section ref={s4Ref}>
            <h3>What happens if it does not work at first and I have a relapse?</h3>
            <p>
              We offer an optimization call to dive deep into why the ritual is
              not working, and we make a new version of it. This is where most
              of our value is delivered.
            </p>
            <Aperture label="[Video — Optimization call, applied case]" />
          </section>

          <section>
            <p>
              The Samwise program has been designed with the close advice of{" "}
              <strong>Dr. Ana María Reyes Tirado</strong>
            </p>
            <Aperture label="Dr. Ana María Reyes Tirado">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dr%20Ana%20Maria%20Reyes-LsqC4giUs3mSHIIIHhTkzmEKLOMXiq.png"
                alt="Dr. Ana María Reyes Tirado"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />
            </Aperture>
            <p>Specialist in Neurofeedback of New Wind Academy, USA.</p>
            <p>Clinical Director of Fundación Syncronía.</p>
          </section>
        </article>

        <aside className="frodo-scene-col" aria-hidden>
          <Scene handTrigger={handTrigger} />
        </aside>
      </main>

      <style>{`
        .frodo-scene {
          display: block;
          min-height: 100dvh;
        }

        .frodo-scene-col {
          position: fixed;
          inset: 0 0 auto 0;
          height: 50dvh;
          z-index: 10;
          pointer-events: none;
        }
        .frodo-copy {
          position: relative;
          z-index: 1;
          padding: calc(50dvh + 32px) 24px 80px;
          max-width: 640px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .frodo-copy section {
          min-height: 100dvh;
          padding: 60px 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }
        .frodo-copy section.frodo-silent {
          min-height: 80dvh;
        }
        .frodo-cta {
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-thickness: 1px;
          color: inherit;
        }
        .frodo-cta:hover {
          text-decoration-thickness: 2px;
        }

        @media (min-width: 1024px) {
          .frodo-scene {
            display: grid;
            grid-template-columns: minmax(0, 480px) 1fr;
            grid-template-areas: "copy scene";
          }
          .frodo-scene-col {
            grid-area: scene;
            position: sticky;
            inset: auto;
            top: 0;
            height: 100dvh;
          }
          .frodo-copy {
            grid-area: copy;
            max-width: 480px;
            padding: 80px 32px;
            margin: 0;
          }
          .frodo-copy section {
            min-height: 100dvh;
            padding: 80px 0;
          }
          .frodo-copy section.frodo-silent {
            min-height: 80dvh;
          }
        }
      `}</style>
    </div>
  );
}
