"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef } from "react";
import { Hand } from "lucide-react";
import { COLORS, HEARTBEAT_S, PHASE } from "./tokens";

/**
 * Fixed-viewport scene driven by:
 *  - scrollYProgress (where we are in the journey)
 *  - mouseX (cursor X — the hand drifts toward it during in-hole phases)
 *  - `pulling` motion value (high while the user hovers the Fit Assessment
 *     link; mixes the hand toward the rope's center X)
 *  - `celebrate` motion value (briefly high on click; flashes the rope,
 *     star, and hand brighter for a beat before navigation)
 *
 * Visual model:
 *  - The page is light. A dark "void" rect overlays the screen during
 *    in-hole phases. A bright rim CIRCLE at the top of the screen cuts
 *    a window through the void (the way out).
 *  - The rope is one curving SVG path with an `feMerge` shine filter
 *    (gaussian-blurred glow + crisp original on top — single path).
 *  - A subtle wobble runs at the rope's midpoint; its amplitude is tied
 *    to scroll velocity, so the rope settles when the user stops scrolling.
 *  - The Vingilot star, the rope, and the hand all pulse softly with a
 *    cardiac-shaped heartbeat (~3.2s period). Same heartbeat, different
 *    intensities per element.
 *  - On `celebrate`, the rope flashes brighter and the hand flares.
 */
export function Scene({
  pulling,
  celebrate,
}: {
  pulling: MotionValue<number>;
  celebrate: MotionValue<number>;
}) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 22,
    restDelta: 0.001,
  });

  // Rim radius (fraction of larger viewport dim).
  // 1.4 = bigger than viewport (no visible hole). 0.18 = small rim at top.
  const rim = useTransform(
    p,
    [
      PHASE.s1Visible,
      PHASE.fall1Begin,
      PHASE.fall1Bottom,
      PHASE.hole1Hold,
      PHASE.rise1End,
      PHASE.star1Settle,
      PHASE.fall2Begin,
      PHASE.catch2,
      PHASE.rise2End,
      PHASE.s5Settle,
      PHASE.end,
    ],
    [1.4, 1.4, 0.18, 0.18, 1.4, 1.4, 1.4, 0.32, 1.4, 1.4, 1.4],
  );

  const ropeLen = useTransform(
    p,
    [
      PHASE.fall1Bottom - 0.05,
      PHASE.fall1Bottom,
      PHASE.hole1Hold,
      PHASE.rise1End,
      PHASE.fall2Begin,
      PHASE.catch2 - 0.04,
      PHASE.catch2,
      PHASE.rise2End,
    ],
    [0, 1, 1, 0, 0, 0, 1, 0],
  );

  const handBottom = useTransform(
    p,
    [
      PHASE.s1Visible,
      PHASE.fall1Begin,
      PHASE.fall1Bottom,
      PHASE.hole1Hold,
      PHASE.rise1End,
      PHASE.star1Settle,
      PHASE.fall2Begin,
      PHASE.catch2,
      PHASE.rise2End,
      PHASE.end,
    ],
    [-25, -25, 12, 12, 38, -25, -25, 18, 38, -25],
  );

  const starOpacity = useTransform(
    p,
    [
      PHASE.rise1End,
      PHASE.star1Settle,
      PHASE.fall2Begin,
      PHASE.catch2,
      PHASE.rise2End,
      PHASE.end,
    ],
    [0, 1, 1, 0, 1, 1],
  );

  const handOpacity = useTransform(
    p,
    [
      PHASE.fall1Bottom - 0.04,
      PHASE.fall1Bottom,
      PHASE.rise1End,
      PHASE.star1Settle,
      PHASE.fall2Begin,
      PHASE.catch2,
      PHASE.rise2End,
      PHASE.end,
    ],
    [0, 1, 1, 0, 0, 1, 1, 0],
  );

  // Cursor with damping; mixed toward center via `pulling`.
  const mouseX = useMouseX();
  const mouseSpring = useSpring(mouseX, { stiffness: 110, damping: 24 });
  const handX = useTransform([mouseSpring, pulling], (input) => {
    const [hx, pull] = input as [number, number];
    if (typeof window === "undefined") return 0;
    const cx = window.innerWidth / 2;
    return hx * (1 - pull) + cx * pull;
  });

  // Heartbeat & scroll velocity (for wobble settling).
  const heartbeat = useHeartbeat(HEARTBEAT_S);
  const scrollVelocity = useVelocity(scrollYProgress);

  // Reduced-motion stable values.
  const reducedRim = useMotionValue(1.4);
  const reducedZero = useMotionValue(0);
  const handBottomVh = useTransform(handBottom, (v) => `${v}vh`);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <RimSvg rim={reduced ? reducedRim : rim} />
      <RopeSvg
        ropeLen={reduced ? reducedZero : ropeLen}
        scrollVelocity={reduced ? reducedZero : scrollVelocity}
        heartbeat={reduced ? reducedZero : heartbeat}
        celebrate={celebrate}
      />

      {/* Vingilot star — small luminous dot that pulses with the heartbeat. */}
      <motion.div
        style={{
          position: "absolute",
          left: "50%",
          top: "8%",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: COLORS.star,
          boxShadow: `0 0 26px ${COLORS.star}, 0 0 84px ${COLORS.ropeGlow}`,
          translateX: "-50%",
          translateY: "-50%",
          opacity: reduced ? reducedZero : starOpacity,
          scale: useTransform([heartbeat, celebrate], (i) => {
            const [h, c] = i as [number, number];
            return 1 + h * 0.08 + c * 0.55;
          }),
        }}
      />

      {/* Hand — Lucide hand icon at bottom of viewport, follows cursor X.
          Subtle scale pulse with heartbeat; flares brighter on celebrate. */}
      <motion.div
        style={{
          position: "fixed",
          left: 0,
          top: "auto",
          x: reduced ? 0 : handX,
          bottom: reduced ? "-25vh" : handBottomVh,
          opacity: reduced ? reducedZero : handOpacity,
          translateX: "-50%",
          color: COLORS.inkLight,
          pointerEvents: "none",
          filter: useTransform([heartbeat, celebrate], (i) => {
            const [h, c] = i as [number, number];
            const innerBlur = 12 + h * 4 + c * 14;
            const outerBlur = 36 + h * 10 + c * 40;
            return `drop-shadow(0 0 ${innerBlur}px ${COLORS.ropeGlow}) drop-shadow(0 0 ${outerBlur}px ${COLORS.star})`;
          }),
          willChange: "transform",
        }}
      >
        <motion.div
          style={{
            scale: useTransform([heartbeat, celebrate], (i) => {
              const [h, c] = i as [number, number];
              return 1 + h * 0.04 + c * 0.18;
            }),
          }}
        >
          <Hand size={64} strokeWidth={1.5} absoluteStrokeWidth />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ───────────────────── Rim ───────────────────── */

function RimSvg({ rim }: { rim: MotionValue<number> }) {
  const rRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const update = (v: number) => {
      const el = rRef.current;
      if (!el) return;
      const max = Math.max(window.innerWidth, window.innerHeight);
      el.setAttribute("r", String(v * max));
    };
    update(rim.get());
    return rim.on("change", update);
  }, [rim]);

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <defs>
        <mask id="rope-rim-mask">
          <rect width="100%" height="100%" fill="white" />
          <circle ref={rRef} cx="50%" cy="0%" r="0" fill="black" />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={COLORS.void}
        mask="url(#rope-rim-mask)"
      />
    </svg>
  );
}

/* ───────────────────── Rope ───────────────────── */

function RopeSvg({
  ropeLen,
  scrollVelocity,
  heartbeat,
  celebrate,
}: {
  ropeLen: MotionValue<number>;
  scrollVelocity: MotionValue<number>;
  heartbeat: MotionValue<number>;
  celebrate: MotionValue<number>;
}) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const v = ropeLen.get();
      const W = typeof window !== "undefined" ? window.innerWidth : 800;
      const H = typeof window !== "undefined" ? window.innerHeight : 600;
      const cx = W / 2;
      const endY = H * 0.78 * v;
      const midY = endY * 0.5;

      // Wobble: amplitude tied to scroll velocity (fades to 0 when settled).
      const vel = Math.abs(scrollVelocity.get());
      const wobbleAmp = Math.min(22, vel * 60) * Math.min(1, v);
      const wobble = wobbleAmp * Math.sin(performance.now() / 700);

      // Brightness: heartbeat + celebrate pulses.
      const heart = heartbeat.get();
      const celeb = celebrate.get();
      const baseOp = Math.min(1, v * 1.6);
      const op = Math.min(1, baseOp * (0.85 + heart * 0.15) + celeb * 0.4);

      const d = `M ${cx} 0 Q ${cx + wobble} ${midY} ${cx} ${endY}`;
      const el = pathRef.current;
      if (el) {
        el.setAttribute("d", d);
        el.setAttribute("opacity", String(op));
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [ropeLen, scrollVelocity, heartbeat, celebrate]);

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
      }}
    >
      <defs>
        {/* Single shine filter: blur the source for glow, then composite the
            crisp source on top. Single path; no mutation observer hack. */}
        <filter id="rope-shine" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        ref={pathRef}
        d="M 0 0"
        stroke={COLORS.rope}
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
        filter="url(#rope-shine)"
        opacity="0"
      />
    </svg>
  );
}

/* ───────────────────── Hooks ───────────────────── */

function useMouseX() {
  const x = useMotionValue(0);
  useEffect(() => {
    const init = () => x.set(window.innerWidth / 2);
    init();
    const onMove = (e: MouseEvent) => x.set(e.clientX);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", init);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", init);
    };
  }, [x]);
  return x;
}

/**
 * A 0..1 motion value running at the heartbeat period with a cardiac shape:
 * a stronger first peak and a smaller second peak per cycle.
 */
function useHeartbeat(periodSeconds: number) {
  const v = useMotionValue(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const t = (performance.now() / 1000) % periodSeconds;
      const phase = t / periodSeconds;
      let beat = 0;
      if (phase < 0.18) beat = Math.sin((phase / 0.18) * Math.PI);
      else if (phase < 0.32) beat = 0.55 * Math.sin(((phase - 0.18) / 0.14) * Math.PI);
      v.set(beat);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [v, periodSeconds]);
  return v;
}
