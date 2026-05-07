"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const fullMotion: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 18 },
  },
};

const quietFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export function MotionSection({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      variants={reduced ? quietFade : fullMotion}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      style={{ margin: "60px 0" }}
    >
      {children}
    </motion.section>
  );
}
