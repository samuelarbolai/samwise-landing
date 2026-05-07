"use client";

import { Scene } from "./scene";
import { COLORS } from "./tokens";

export default function FrodoWieldPage() {
  return (
    <div style={{ background: COLORS.bg, color: COLORS.ink, position: "relative" }}>
      <main className="wield-main">
        <article className="wield-copy">
          <section>
            <h1 className="wield-hero">A definitive solution.</h1>
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

          <section className="wield-silent">
            <h1 className="wield-hero">Held.</h1>
          </section>

          <section>
            <h1 className="wield-hero">Begin.</h1>
            <p>
              <a
                href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"
                className="wield-cta"
              >
                Fit Assessment
              </a>
              <br />
              <em>Start here if it&apos;s your first time.</em>
            </p>
          </section>

          <section>
            <h1 className="wield-hero">Caught.</h1>
            <p>
              If it does not work at first and you have a relapse, we offer an optimization call
              to dive deep into why the ritual is not working, and we make a new version of it.
              This is where most of our value is delivered.
            </p>
          </section>

          <section>
            <h1 className="wield-hero">You can rest.</h1>
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

        <aside className="wield-scene" aria-hidden>
          <Scene />
        </aside>
      </main>

      <style>{`
        .wield-main {
          display: block;
          position: relative;
          min-height: 100dvh;
        }
        .wield-scene {
          position: fixed;
          inset: 0 0 auto 0;
          height: 50dvh;
          z-index: 10;
          pointer-events: none;
        }
        .wield-copy {
          position: relative;
          z-index: 1;
          padding: calc(50dvh + 32px) 24px 80px;
          max-width: 720px;
          margin: 0 auto;
          line-height: 1.55;
        }
        .wield-copy section {
          min-height: 100dvh;
          padding: 60px 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .wield-copy section.wield-silent {
          min-height: 80dvh;
        }
        .wield-hero {
          font-size: clamp(40px, 8vw, 72px);
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.05;
          margin: 0 0 24px;
        }
        .wield-copy p {
          font-size: 17px;
          margin: 0 0 14px;
        }
        .wield-copy ul {
          list-style: none;
          padding: 0;
          margin: 16px 0;
        }
        .wield-copy ul li {
          font-size: 17px;
          padding: 4px 0;
        }
        .wield-copy .wield-cta {
          color: inherit;
          text-decoration: underline;
          text-underline-offset: 4px;
          font-size: 19px;
        }

        @media (min-width: 1024px) {
          .wield-main {
            display: grid;
            grid-template-columns: minmax(0, 560px) 1fr;
            grid-template-areas: "copy scene";
          }
          .wield-scene {
            grid-area: scene;
            position: sticky;
            inset: auto;
            top: 0;
            height: 100dvh;
          }
          .wield-copy {
            grid-area: copy;
            max-width: 560px;
            padding: 80px 56px;
            margin: 0;
          }
          .wield-hero {
            font-size: clamp(56px, 6vw, 96px);
          }
        }
      `}</style>
    </div>
  );
}
