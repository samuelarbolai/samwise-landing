"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { Hand } from "lucide-react";
import { SCENE_VIEWBOX, SHIELD_FADE_IN, SHIELD_FADE_OUT, TRACE_PATH } from "./arm";
import { COLORS } from "./tokens";

/**
 * A single, continuous trace drawn across the sticky scene area. As scroll
 * progresses, the trace draws itself, a hand glyph follows the drawn end,
 * and a shield fades in mid-scroll and stays in the hand for the remainder
 * of the page.
 */
export function Scene() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const pathRef = useRef<SVGPathElement>(null);

  const dashOffset = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const shieldOpacity = useTransform(
    scrollYProgress,
    [SHIELD_FADE_IN, SHIELD_FADE_OUT],
    [0, 1],
  );

  // Hand position follows the drawn end of the trace.
  const handX = useMotionValue(0);
  const handY = useMotionValue(0);
  const handRotate = useMotionValue(0);

  useEffect(() => {
    const update = (p: number) => {
      const path = pathRef.current;
      if (!path) return;
      const len = path.getTotalLength();
      // Use the END of the drawn portion as the hand's location.
      const t = Math.max(0.001, Math.min(1, p));
      const here = path.getPointAtLength(t * len);
      const ahead = path.getPointAtLength(Math.min(t * len + 6, len));
      const dx = ahead.x - here.x;
      const dy = ahead.y - here.y;
      // Rotate the hand so the wrist trails the direction of motion.
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      handX.set(here.x);
      handY.set(here.y);
      handRotate.set(angle + 90); // +90 because Lucide Hand points up by default
    };

    update(scrollYProgress.get());
    const unsub = scrollYProgress.on("change", update);
    return unsub;
  }, [scrollYProgress, handX, handY, handRotate]);

  return (
    <svg
      viewBox={`0 0 ${SCENE_VIEWBOX.w} ${SCENE_VIEWBOX.h}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-hidden
    >
      {/* The single connective trace. Drawn progressively via dashoffset. */}
      <motion.path
        ref={pathRef}
        d={TRACE_PATH}
        stroke={COLORS.ink}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        pathLength={1}
        strokeDasharray="1 1"
        style={{
          strokeDashoffset: reduced ? 0 : dashOffset,
        }}
      />

      {/* Hand + (later) shield, both ride the drawn end. */}
      <motion.g
        style={{
          x: reduced ? 0 : handX,
          y: reduced ? 0 : handY,
          rotate: reduced ? 0 : handRotate,
        }}
      >
        {/* Shield: a soft kite/teardrop silhouette that fades in mid-scroll
            and stays in the hand from then on. Anchored slightly out from
            the palm so the hand "carries" it. */}
        <motion.g style={{ opacity: reduced ? 1 : shieldOpacity }}>
          <path
            d="M 0 -56 L 22 -50 L 26 -22 Q 26 4 0 22 Q -26 4 -26 -22 L -22 -50 Z"
            fill={COLORS.shield}
            stroke={COLORS.ink}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M 0 -50 L 0 14"
            stroke={COLORS.bg}
            strokeWidth="1"
            opacity="0.5"
          />
        </motion.g>

        {/* Hand glyph: a small Lucide Hand inside foreignObject so we get a
            clean, recognizable hand silhouette positioned in SVG space. */}
        <foreignObject x={-28} y={-28} width={56} height={56}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.ink,
            }}
          >
            <Hand size={56} strokeWidth={1.5} absoluteStrokeWidth />
          </div>
        </foreignObject>
      </motion.g>
    </svg>
  );
}
