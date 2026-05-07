"use client";

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type ReactNode } from "react";
import { Scene } from "./scene";
import { COLORS, PHASE } from "./tokens";

/**
 * The journey's copy is a stack of fixed-positioned blocks. Each has an
 * opacity tied to its scroll-progress window. Everything visible is fixed;
 * the page contains only a tall scrollable spacer.
 *
 * `pulling` is high while the user hovers/focuses the Fit Assessment link.
 * `celebrate` briefly pulses to 1 on click, flashing the rope/star/hand
 * before navigation.
 */
export default function FrodoRopePage() {
  const pulling = useMotionValue(0);
  const pullingSpring = useSpring(pulling, { stiffness: 130, damping: 22 });

  const celebrate = useMotionValue(0);
  const celebrateSpring = useSpring(celebrate, { stiffness: 90, damping: 16 });

  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = linkRef.current?.href;
    celebrate.set(1);
    setTimeout(() => celebrate.set(0), 600);
    setTimeout(() => {
      if (href) window.open(href, "_blank", "noopener");
    }, 480);
  };

  return (
    <div style={{ background: COLORS.bg, color: COLORS.ink }}>
      <Scene pulling={pullingSpring} celebrate={celebrateSpring} />
      <CopyStack
        pulling={pulling}
        linkRef={linkRef}
        onLinkClick={handleLinkClick}
      />
      <div style={{ height: "650dvh" }} aria-hidden />
    </div>
  );
}

function CopyStack({
  pulling,
  linkRef,
  onLinkClick,
}: {
  pulling: MotionValue<number>;
  linkRef: React.RefObject<HTMLAnchorElement | null>;
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { scrollYProgress } = useScroll();

  const fade = (a: number, b: number, c: number, d: number) =>
    useTransform(scrollYProgress, [a, b, c, d], [0, 1, 1, 0]);

  // S1 is visible from page load and fades out as we begin to fall.
  // Explicit final 0 at progress=1 to force motion to clamp instead of extrapolate.
  const s1 = useTransform(
    scrollYProgress,
    [0, PHASE.fall1Begin + 0.02, PHASE.fall1Bottom - 0.02, 1],
    [1, 1, 0, 0],
  );
  const s3 = fade(PHASE.fall1Bottom - 0.02, PHASE.fall1Bottom + 0.02, PHASE.hole1Hold, PHASE.rise1End - 0.02);
  const s3v = fade(PHASE.star1Settle - 0.02, PHASE.star1Settle + 0.01, PHASE.fall2Begin - 0.01, PHASE.fall2Begin + 0.02);
  const s4 = fade(PHASE.fall2Begin - 0.01, PHASE.fall2Begin + 0.02, PHASE.catch2 - 0.04, PHASE.catch2 - 0.005);
  const s4v = fade(PHASE.catch2 - 0.005, PHASE.catch2 + 0.02, PHASE.rise2End - 0.02, PHASE.rise2End + 0.01);
  const s5 = fade(PHASE.rise2End + 0.005, PHASE.s5Settle, 1, 1);

  // Copy color flips between dark-on-light (out of hole) and light-on-dark (in hole).
  const copyColor = useTransform(
    scrollYProgress,
    [
      0,
      PHASE.fall1Begin + 0.02,
      PHASE.fall1Bottom,
      PHASE.rise1End,
      PHASE.star1Settle + 0.02,
      PHASE.fall2Begin + 0.02,
      PHASE.catch2 - 0.02,
      PHASE.rise2End,
      1,
    ],
    [
      COLORS.ink,
      COLORS.ink,
      COLORS.inkLight,
      COLORS.inkLight,
      COLORS.ink,
      COLORS.ink,
      COLORS.inkLight,
      COLORS.inkLight,
      COLORS.ink,
    ],
  );

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        color: copyColor,
      }}
    >
      <Block opacity={s1}>
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
      </Block>

      <Block opacity={s3} className="rope-bottom">
        <h2 className="rope-hero">Begin.</h2>
        <p>
          <a
            ref={linkRef}
            href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"
            className="rope-cta"
            onClick={onLinkClick}
            onMouseEnter={() => pulling.set(1)}
            onMouseLeave={() => pulling.set(0)}
            onFocus={() => pulling.set(1)}
            onBlur={() => pulling.set(0)}
          >
            Fit Assessment
          </a>
          <br />
          <em>Start here if it&apos;s your first time.</em>
        </p>
      </Block>

      <Block opacity={s3v}>
        <figure className="rope-figure">
          <div className="rope-frame" aria-label="[Video — Problem Clarification & New Belief System session, applied case]">
            [Video — Problem Clarification &amp; New Belief System session, applied case]
          </div>
          <figcaption>
            Problem Clarification and Belief System, only after the Fit Assessment, or for current
            subscribers.
          </figcaption>
        </figure>
      </Block>

      <Block opacity={s4}>
        <h2 className="rope-hero">If it doesn&apos;t work the first time…</h2>
        <p>
          We offer an optimization call to dive deep into why the ritual is not working, and we
          make a new version of it. This is where most of our value is delivered.
        </p>
      </Block>

      <Block opacity={s4v} className="rope-bottom">
        <figure className="rope-figure">
          <div className="rope-frame" aria-label="[Video — Optimization call, applied case]">
            [Video — Optimization call, applied case]
          </div>
        </figure>
      </Block>

      <Block opacity={s5}>
        <h2 className="rope-hero">You can rest.</h2>
        <p>
          The Samwise program has been designed with the close advice of{" "}
          <strong>Dr. Ana María Reyes Tirado</strong>.
        </p>
        <p>
          Specialist in Neurofeedback of New Wind Academy, USA. Clinical Director of Fundación
          Syncronía.
        </p>
      </Block>

      <style>{`
        .rope-block {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: min(560px, 84vw);
          line-height: 1.55;
          pointer-events: auto;
        }
        .rope-block.rope-bottom {
          top: auto;
          bottom: 14vh;
          transform: translate(-50%, 0);
        }
        .rope-block p {
          margin: 0 0 12px;
          font-size: 17px;
        }
        .rope-block ul {
          list-style: none;
          padding: 0;
          margin: 14px 0;
        }
        .rope-block ul li {
          font-size: 17px;
          padding: 3px 0;
        }
        .rope-hero {
          font-size: clamp(40px, 8vw, 72px);
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.05;
          margin: 0 0 14px;
        }
        .rope-cta {
          color: inherit;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 4px;
          font-size: 19px;
          padding: 6px 0;
          display: inline-block;
        }
        .rope-cta:hover {
          text-decoration-thickness: 2px;
        }
        .rope-figure {
          margin: 0;
        }
        .rope-frame {
          width: 100%;
          aspect-ratio: 16 / 9;
          border: 1px dashed currentColor;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          text-align: center;
          padding: 16px;
          opacity: 0.85;
        }
        .rope-figure figcaption {
          margin-top: 8px;
          font-size: 14px;
          opacity: 0.8;
          text-align: center;
        }

        @media (min-width: 1024px) {
          .rope-block {
            width: min(640px, 70vw);
          }
        }
      `}</style>
    </motion.div>
  );
}

function Block({
  opacity,
  className,
  children,
}: {
  opacity: MotionValue<number>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div className={`rope-block ${className ?? ""}`} style={{ opacity }}>
      {children}
    </motion.div>
  );
}
