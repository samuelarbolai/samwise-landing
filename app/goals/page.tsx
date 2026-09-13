import type { Metadata } from "next";
import GoalsBoard from "./goals-board";
import "./goals.css";

export const metadata: Metadata = {
  title: "Goal board — Samwise (internal)",
  description: "Private printable monthly goal-tracking board.",
  robots: { index: false, follow: false },
};

export default function GoalsPage() {
  return <GoalsBoard />;
}
