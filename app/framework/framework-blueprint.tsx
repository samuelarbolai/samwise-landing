"use client";

import Link from "next/link";
import { PHASES, REBOUNDS, SESSION_TOTALS } from "./framework-data";
import { PhaseCard } from "./phase-card";

export default function FrameworkBlueprint() {
  return (
    <div className="framework-root">
      <div className="framework-container">
        <header className="framework-header">
          <div className="framework-header-row">
            <Link href="/" className="framework-brand">
              Samwise<span className="framework-brand-star">✦</span>
            </Link>
            <span className="framework-meta">internal · blueprint</span>
          </div>
          <h1 className="framework-title">Framework blueprint</h1>
          <p className="framework-meta">
            Onboarding · {SESSION_TOTALS.phases} phases ·{" "}
            {SESSION_TOTALS.duration_min} min · 1 clinician → N agents
          </p>

          <div className="framework-legend">
            <div className="framework-legend-item">
              <span className="framework-legend-swatch legend-capture" />
              <span>variable captured here</span>
            </div>
            <div className="framework-legend-item">
              <span className="framework-legend-swatch legend-agent-slot" />
              <span>agent slot (click to assign)</span>
            </div>
            <div className="framework-legend-item">
              <span className="framework-legend-swatch legend-subphase" />
              <span>sub-phase nested under parent</span>
            </div>
          </div>
        </header>

        <main>
          {PHASES.map((phase) => (
            <PhaseCard key={phase.id} phase={phase} />
          ))}

          <details className="rebounds-card">
            <summary className="rebounds-summary">
              Phase 15 — Rebounds (opt-in, {REBOUNDS.length})
            </summary>
            <ul className="rebounds-list">
              {REBOUNDS.map((r) => (
                <li key={r.id}>
                  <div>
                    <span className="rebound-id">{r.id}</span>
                    <span className="rebound-parent">{r.parent}</span>
                    <span className="rebound-topic">{r.topic}</span>
                  </div>
                  <div className="rebound-when">Open when: {r.openWhen}</div>
                </li>
              ))}
            </ul>
          </details>
        </main>
      </div>
    </div>
  );
}
