"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "motion/react";
import { COLORS } from "./tokens";

type Props = {
  handTrigger: MotionValue<number>;
};

export function Scene({ handTrigger }: Props) {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const progress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 24,
    restDelta: 0.001,
  });

  // Figure: climbs from base (y=720) to just above the peak (y=260) across full scroll.
  const figureY = useTransform(progress, [0, 1], [720, 260]);
  // Slight horizontal jitter near the summit (suggests the struggle at S3 / S4 without being literal).
  const figureX = useTransform(progress, [0, 0.4, 0.7, 1], [410, 400, 420, 400]);

  // Star (Vingilot): descends from above the visible frame (y=60) into the dusk sky (y=180),
  // dims slightly through the middle, then brightens back at the end.
  const starY = useTransform(progress, [0, 0.25, 0.85, 1], [60, 180, 200, 160]);
  const starOpacity = useTransform(progress, [0, 0.25, 0.85, 1], [0.4, 1, 0.5, 1]);
  const starHaloOpacity = useTransform(progress, [0, 0.25, 0.85, 1], [0.1, 0.3, 0.15, 0.4]);

  // Ring on Frodo: small at start, heaviest at S4 (relapse), lifts off (scale 0) by the end.
  const ringScale = useTransform(progress, [0, 0.6, 0.8, 1], [0.8, 1.7, 1.4, 0]);

  // Mountain parallax: gentle drift, frozen under reduced-motion.
  const mountainY = useTransform(progress, [0, 1], reduced ? [0, 0] : [40, -40]);

  // Sam's hand: slides in from the right edge when handTrigger climbs (S2 and S4 sections).
  // It vertically tracks the figure so it always reaches *toward* the climber.
  const handX = useTransform(handTrigger, [0, 1], reduced ? [0, 0] : [200, 0]);
  const handY = useTransform(figureY, (v) => v - 20);

  return (
    <div
      aria-hidden
      style={{
        position: "sticky",
        top: 0,
        height: "100%",
        width: "100%",
        background: COLORS.bg,
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMax slice"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {/* Mountain: a single soft peak filling the lower portion of the frame. */}
        <motion.path
          style={{ y: mountainY }}
          d="M 0 800 L 0 700 Q 180 540 340 380 Q 460 270 520 360 Q 620 480 800 600 L 800 800 Z"
          fill={COLORS.mountain}
        />

        {/* The path itself, dashed and faint, suggesting a way up. */}
        <path
          d="M 400 760 Q 410 620 420 500 Q 430 400 440 320 Q 446 280 450 260"
          fill="none"
          stroke={COLORS.horizon}
          strokeWidth="1.25"
          strokeDasharray="2 8"
          opacity="0.55"
        />

        {/* Vingilot star: small bright core + soft halo. */}
        <motion.g style={{ y: starY }}>
          <motion.circle cx="640" cy="0" r="3.5" fill={COLORS.star} style={{ opacity: starOpacity }} />
          <motion.circle cx="640" cy="0" r="9" fill={COLORS.star} style={{ opacity: starHaloOpacity }} />
        </motion.g>

        {/* Sam's hand: an offered hand reaching in from the right at S2 and S4. */}
        <motion.g style={{ x: handX, y: handY, opacity: handTrigger }}>
          <path
            d="M 800 0 Q 720 -8 640 0 Q 600 4 580 12 L 600 18 Q 660 14 720 16 L 800 18 Z"
            fill={COLORS.ink}
          />
        </motion.g>

        {/* Frodo silhouette + ring on the figure. */}
        <motion.g style={{ x: figureX, y: figureY }}>
          {/* head */}
          <circle cx="0" cy="-14" r="7" fill={COLORS.ink} />
          {/* body */}
          <path d="M -8 -7 L 8 -7 L 5 22 L -5 22 Z" fill={COLORS.ink} />
          {/* ring (the burden) */}
          <motion.circle
            cx="7"
            cy="6"
            r="3"
            fill={COLORS.ring}
            style={{ scale: ringScale, transformOrigin: "7px 6px" }}
          />
        </motion.g>
      </svg>
    </div>
  );
}
