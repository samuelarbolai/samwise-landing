"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import {
  Hand,
  HandGrab,
  HandHelping,
  Handshake,
  HeartHandshake,
} from "lucide-react";
import { BEATS, PAGE_VIEWBOX, THREAD_PATH } from "./hands";
import { COLORS } from "./tokens";

const ICONS = {
  Hand,
  HandGrab,
  HandHelping,
  Handshake,
  HeartHandshake,
} as const;

const HAND_PX = 132;

export function Thread() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const dashOffset = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <>
      {/* Background SVG: just the connective thread, stretched edge-to-edge.
          preserveAspectRatio="none" lets it match the container's aspect; the
          thread is mostly vertical so X distortion is negligible. */}
      <svg
        viewBox={`0 0 ${PAGE_VIEWBOX.w} ${PAGE_VIEWBOX.h}`}
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <motion.path
          d={THREAD_PATH}
          stroke={COLORS.thread}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          strokeDasharray="1 1"
          style={{
            strokeDashoffset: reduced ? 0 : dashOffset,
            vectorEffect: "non-scaling-stroke",
          }}
        />
      </svg>

      {/* HTML overlays: hand icons, voids, star. Positioned via percent so they
          align with the SVG thread regardless of viewport. */}
      <div
        aria-hidden
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {BEATS.map((b) => {
          const Icon = ICONS[b.icon];
          const left = (b.cx / PAGE_VIEWBOX.w) * 100;
          const top = (b.cy / PAGE_VIEWBOX.h) * 100;
          return (
            <div
              key={b.id}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                transform: `translate(-50%, -50%) rotate(${b.rotate ?? 0}deg)`,
                color: COLORS.ink,
                lineHeight: 0,
              }}
            >
              <Icon size={HAND_PX} strokeWidth={1.4} absoluteStrokeWidth />
            </div>
          );
        })}

        {BEATS.filter((b) => b.void).map((b) => {
          const v = b.void!;
          const left = ((b.cx + v.dx) / PAGE_VIEWBOX.w) * 100;
          const top = ((b.cy + v.dy) / PAGE_VIEWBOX.h) * 100;
          return (
            <div
              key={`void-${b.id}`}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: `${v.r * 2}px`,
                height: `${v.r * 2}px`,
                borderRadius: "50%",
                background: COLORS.void,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}

        {BEATS.filter((b) => b.star).map((b) => {
          const s = b.star!;
          const left = ((b.cx + s.dx) / PAGE_VIEWBOX.w) * 100;
          const top = ((b.cy + s.dy) / PAGE_VIEWBOX.h) * 100;
          return (
            <div
              key={`star-${b.id}`}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: `${s.r * 2}px`,
                height: `${s.r * 2}px`,
                borderRadius: "50%",
                background: COLORS.star,
                boxShadow: `0 0 ${s.r * 3}px ${COLORS.star}`,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}
      </div>
    </>
  );
}
