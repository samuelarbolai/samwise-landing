import type { Metadata } from "next";
import FrameworkBlueprint from "./framework-blueprint";
import "./framework.css";

export const metadata: Metadata = {
  title: "Framework blueprint — Samwise (internal)",
  description:
    "Internal blueprint for the Onboarding framework + per-step agent automation planning.",
  robots: { index: false, follow: false },
};

export default function FrameworkPage() {
  return <FrameworkBlueprint />;
}
