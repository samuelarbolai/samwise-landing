"use client";

import { motion, useReducedMotion } from "motion/react";

const cueStyle = {
  display: "block",
  textAlign: "center" as const,
  color: "#888",
  marginBottom: "20px",
};

export function VingilotStar() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <motion.span
      aria-hidden
      style={{ ...cueStyle, fontSize: "1.2rem" }}
      initial={{ opacity: 0, y: -40, scale: 0.4 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
    >
      ✦
    </motion.span>
  );
}

export function OfferedHand({ direction }: { direction: "up" | "right" }) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  const glyph = direction === "up" ? "↥" : "↪";
  const from = direction === "up" ? { x: 0, y: 40 } : { x: -40, y: 0 };
  return (
    <motion.span
      aria-hidden
      style={{ ...cueStyle, fontSize: "1.4rem" }}
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 60, damping: 14 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {glyph}
    </motion.span>
  );
}

export function StruggleTwitch() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <motion.span
      aria-hidden
      style={{ ...cueStyle, fontSize: "1.2rem" }}
      initial={{ opacity: 0 }}
      whileInView={{
        opacity: [0, 1, 1, 1],
        x: [0, -6, 6, -3, 3, 0],
      }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
    >
      ⇌
    </motion.span>
  );
}

export function Horizon() {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <hr
        style={{
          border: "none",
          borderTop: "1px solid #ccc",
          width: "100%",
          margin: "20px 0",
        }}
      />
    );
  }
  return (
    <motion.hr
      style={{
        border: "none",
        borderTop: "1px solid #ccc",
        margin: "20px auto",
      }}
      initial={{ width: 0 }}
      whileInView={{ width: "100%" }}
      transition={{ duration: 2.0, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
    />
  );
}
