"use client";

import type { ReactNode } from "react";
import { Thread } from "./thread";
import { BEATS, PAGE_VIEWBOX } from "./hands";
import { COLORS } from "./tokens";

type Block = { heading?: string; body: ReactNode | null };

const blocks: Record<string, Block> = {
  s1: {
    body: (
      <>
        <p>
          We are a team of mental health professionals, spiritual guidance practitioners and
          technology experts that want a definitive solution to overcome the toughest, untreated
          and most insidious behavioural challenges we have faced in our lives, the lives of our
          loved ones and in the lives of our patients:
        </p>
        <ul>
          <li>Screens addiction.</li>
          <li>Need for approval, impulsive love seeking.</li>
          <li>Addiction to porn.</li>
          <li>Social media addiction.</li>
          <li>Destructive relationships.</li>
        </ul>
        <p>
          We are building a solution. We call it <strong>Samwise</strong>. A system that helps
          you act against your own biology to be able to do what you need to do.
        </p>
      </>
    ),
  },
  s2: { body: null },
  s3: {
    heading: "Schedule your call",
    body: (
      <>
        <p>
          <a
            href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"
            className="immerse-cta"
          >
            Fit Assessment
          </a>
          <br />
          <em>Start here if it&apos;s your first time.</em>
        </p>
      </>
    ),
  },
  s4: {
    heading: "What if it doesn't work the first time?",
    body: (
      <p>
        We offer an optimization call to dive deep into why the ritual is not working, and we
        make a new version of it. This is where most of our value is delivered.
      </p>
    ),
  },
  s5: {
    body: (
      <>
        <p>
          The Samwise program has been designed with the close advice of{" "}
          <strong>Dr. Ana María Reyes Tirado</strong>.
        </p>
        <p>Specialist in Neurofeedback of New Wind Academy, USA.</p>
        <p>Clinical Director of Fundación Syncronía.</p>
      </>
    ),
  },
};

export default function FrodoImmersePage() {
  return (
    <div
      className="immerse-root"
      style={{ background: COLORS.bg, color: COLORS.ink, position: "relative" }}
    >
      <Thread />

      <div className="immerse-copy">
        {BEATS.map((b) => {
          const c = blocks[b.id];
          if (!c?.body && !c?.heading) {
            return <div key={b.id} className="immerse-block immerse-silent" />;
          }
          const yPercent = (b.cy / PAGE_VIEWBOX.h) * 100;
          return (
            <div
              key={b.id}
              className={`immerse-block immerse-${b.copyAlign}`}
              style={{ top: `${yPercent}%` }}
            >
              {c.heading && <h3>{c.heading}</h3>}
              {c.body}
            </div>
          );
        })}
      </div>

      <style>{`
        .immerse-root {
          position: relative;
          min-height: 5000px;
        }
        .immerse-copy {
          position: relative;
          z-index: 2;
          height: 5000px;
        }
        .immerse-block {
          position: absolute;
          width: min(320px, 78vw);
          font-size: 15px;
          line-height: 1.55;
          transform: translateY(-50%);
        }
        .immerse-block.immerse-left {
          left: 24px;
        }
        .immerse-block.immerse-right {
          right: 24px;
        }
        .immerse-block.immerse-silent {
          height: 1px;
        }
        .immerse-block h3 {
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0 0 8px;
        }
        .immerse-block p {
          margin: 0 0 12px;
        }
        .immerse-block ul {
          list-style: none;
          padding: 0;
          margin: 12px 0;
        }
        .immerse-block ul li {
          padding: 2px 0;
        }
        .immerse-block .immerse-cta {
          color: inherit;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        @media (min-width: 1024px) {
          .immerse-block {
            width: 380px;
            font-size: 16px;
          }
          .immerse-block.immerse-left {
            left: max(48px, calc((100% - 800px) / 2 - 60px));
          }
          .immerse-block.immerse-right {
            right: max(48px, calc((100% - 800px) / 2 - 60px));
          }
        }
      `}</style>
    </div>
  );
}
