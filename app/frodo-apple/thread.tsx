"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import {
  Hand,
  HandGrab,
  HandHelping,
  Handshake,
  HeartHandshake,
} from "lucide-react";
import { BEATS, type Beat } from "./hands";
import { COLORS } from "./tokens";

const ICONS = {
  Hand,
  HandGrab,
  HandHelping,
  Handshake,
  HeartHandshake,
} as const;

/**
 * Sticky scene for the Apple variant.
 *
 * Renders all 5 hand icons stacked at the same position; each one's opacity is
 * keyed to the page's scroll progress so only the "active" beat is visible at
 * any given moment. A small thread motif (a vertical line drawn progressively)
 * runs down the right side and acts as the page's spine.
 */
export function Thread() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const dashOffset = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Hand icon stack: only one is visible per scroll window. */}
      {BEATS.map((b, i) => (
        <HandSlot key={b.id} beat={b} index={i} total={BEATS.length} />
      ))}

      {/* Thin connective line down the right edge of the scene area. */}
      <svg
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          right: "32px",
          top: 0,
          width: "1px",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        <motion.line
          x1="0.5"
          y1="0"
          x2="0.5"
          y2="1000"
          stroke={COLORS.thread}
          strokeWidth="1.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          style={{
            strokeDashoffset: reduced ? 0 : dashOffset,
            vectorEffect: "non-scaling-stroke",
          }}
        />
      </svg>
    </div>
  );
}

function HandSlot({ beat, index, total }: { beat: Beat; index: number; total: number }) {
  const Icon = ICONS[beat.icon];
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const window = 1 / total;
  const start = index * window;
  const end = (index + 1) * window;
  const fadeIn = window * 0.2;
  const fadeOut = window * 0.2;

  const opacity = useTransform(
    scrollYProgress,
    [
      start - fadeIn,
      start,
      Math.max(start, end - fadeOut),
      end,
      end + fadeIn,
    ],
    reduced
      ? [index === 0 ? 1 : 0, 1, 1, 1, 1]
      : [0, 1, 1, 1, 0],
  );
  const scale = useTransform(
    scrollYProgress,
    [start - fadeIn, start, end, end + fadeIn],
    reduced ? [1, 1, 1, 1] : [0.92, 1, 1, 0.92],
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        scale,
        color: COLORS.ink,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(58vmin, 360px)",
          height: "min(58vmin, 360px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(${beat.rotate ?? 0}deg)`,
        }}
      >
        <Icon
          size="100%"
          strokeWidth={1.2}
          absoluteStrokeWidth
          style={{ width: "100%", height: "100%" }}
        />

        {beat.showVoid && (
          <div
            style={{
              position: "absolute",
              left: "62%",
              top: "78%",
              width: "min(14vmin, 88px)",
              height: "min(14vmin, 88px)",
              borderRadius: "50%",
              background: COLORS.void,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
        {beat.showStar && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "8%",
              width: "min(4vmin, 22px)",
              height: "min(4vmin, 22px)",
              borderRadius: "50%",
              background: COLORS.star,
              boxShadow: `0 0 32px ${COLORS.star}`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
