"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

type Tone =
  | "rise"
  | "lift"
  | "settle"
  | "offered"
  | "stillness";

const tones: Record<Tone, Variants> = {
  rise: {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 50, damping: 18 },
    },
  },
  lift: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: -4,
      transition: { type: "spring", stiffness: 70, damping: 16 },
    },
  },
  settle: {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 1.2, ease: "easeOut" },
    },
  },
  offered: {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 60, damping: 20 },
    },
  },
  stillness: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 2.4, ease: "easeOut" },
    },
  },
};

const quietFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export function MotionSection({
  tone,
  children,
}: {
  tone: Tone;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      variants={reduced ? quietFade : tones[tone]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      style={{ margin: "60px 0" }}
    >
      {children}
    </motion.section>
  );
}
