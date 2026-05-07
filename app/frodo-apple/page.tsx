"use client";

import { Thread } from "./thread";
import { COLORS } from "./tokens";

export default function FrodoApplePage() {
  return (
    <div style={{ background: COLORS.bg, color: COLORS.ink, position: "relative" }}>
      <main className="apple-main">
        <article className="apple-copy">
          <section>
            <h1 className="apple-hero">A definitive solution.</h1>
            <p>
              We are a team of mental health professionals, spiritual guidance practitioners and
              technology experts, focused on the toughest, untreated and most insidious behavioural
              challenges:
            </p>
            <ul>
              <li>Screens addiction.</li>
              <li>Need for approval, impulsive love seeking.</li>
              <li>Addiction to porn.</li>
              <li>Social media addiction.</li>
              <li>Destructive relationships.</li>
            </ul>
            <p>
              We are building Samwise. A system that helps you act against your own biology to be
              able to do what you need to do.
            </p>
          </section>

          <section className="apple-silent">
            <h1 className="apple-hero">Held.</h1>
          </section>

          <section>
            <h1 className="apple-hero">Begin.</h1>
            <p>
              <a
                href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"
                className="apple-cta"
              >
                Fit Assessment
              </a>
              <br />
              <em>Start here if it&apos;s your first time.</em>
            </p>
          </section>

          <section>
            <h1 className="apple-hero">Caught.</h1>
            <p>
              If it does not work at first and you have a relapse, we offer an optimization call
              to dive deep into why the ritual is not working, and we make a new version of it.
              This is where most of our value is delivered.
            </p>
          </section>

          <section>
            <h1 className="apple-hero">You can rest.</h1>
            <p>
              The Samwise program has been designed with the close advice of{" "}
              <strong>Dr. Ana María Reyes Tirado</strong>.
            </p>
            <p>
              Specialist in Neurofeedback of New Wind Academy, USA. Clinical Director of Fundación
              Syncronía.
            </p>
          </section>
        </article>

        <aside className="apple-scene" aria-hidden>
          <Thread />
        </aside>
      </main>

      <style>{`
        .apple-main {
          display: block;
          position: relative;
          min-height: 100dvh;
        }
        .apple-scene {
          position: fixed;
          inset: 0 0 auto 0;
          height: 50dvh;
          z-index: 10;
          pointer-events: none;
        }
        .apple-scene > svg {
          width: 100%;
          height: 100%;
        }
        .apple-copy {
          position: relative;
          z-index: 1;
          padding: calc(50dvh + 32px) 24px 80px;
          max-width: 720px;
          margin: 0 auto;
          line-height: 1.55;
        }
        .apple-copy section {
          min-height: 100dvh;
          padding: 60px 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .apple-copy section.apple-silent {
          min-height: 80dvh;
        }
        .apple-hero {
          font-size: clamp(40px, 8vw, 72px);
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.05;
          margin: 0 0 24px;
        }
        .apple-copy p {
          font-size: 17px;
          margin: 0 0 14px;
        }
        .apple-copy ul {
          list-style: none;
          padding: 0;
          margin: 16px 0;
        }
        .apple-copy ul li {
          font-size: 17px;
          padding: 4px 0;
        }
        .apple-copy .apple-cta {
          color: inherit;
          text-decoration: underline;
          text-underline-offset: 4px;
          font-size: 19px;
        }

        @media (min-width: 1024px) {
          .apple-main {
            display: grid;
            grid-template-columns: minmax(0, 560px) 1fr;
            grid-template-areas: "copy scene";
          }
          .apple-scene {
            grid-area: scene;
            position: sticky;
            inset: auto;
            top: 0;
            height: 100dvh;
          }
          .apple-copy {
            grid-area: copy;
            max-width: 560px;
            padding: 80px 56px;
            margin: 0;
          }
          .apple-hero {
            font-size: clamp(56px, 6vw, 96px);
          }
        }
      `}</style>
    </div>
  );
}
