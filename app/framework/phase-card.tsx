"use client";

import { useEffect, useState } from "react";
import type { Phase, SubPhase } from "./framework-data";
import { MethodologyDiagrams } from "./methodology-diagrams";

type AgentSlotProps = { phaseId: string };

function AgentSlot({ phaseId }: AgentSlotProps) {
  const storageKey = `framework:agent:${phaseId}`;
  const [value, setValue] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored !== null) setValue(stored);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, [storageKey]);

  function handleChange(next: string) {
    setValue(next);
    if (!loaded) return;
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      // ignore
    }
  }

  const status = value.trim().length > 0 ? "assigned" : "unassigned";

  return (
    <div className="agent-slot">
      <div className="agent-slot-label">
        <span>Agent</span>
        <span className="agent-slot-status">{status}</span>
      </div>
      <textarea
        className="agent-slot-textarea"
        placeholder="name + model + prompt ref + notes…"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
}

function VarsList({ items, isOut }: { items: string[]; isOut?: boolean }) {
  if (items.length === 0) {
    return <p className="phase-vars-empty">—</p>;
  }
  return (
    <ul className={`phase-vars-list${isOut ? " is-out" : ""}`}>
      {items.map((v) => (
        <li key={v}>{v}</li>
      ))}
    </ul>
  );
}

function SubPhaseBlock({ sub, parentId }: { sub: SubPhase; parentId: string }) {
  return (
    <div className="subphase">
      <p className="subphase-label">{sub.label}</p>
      <ul className="phase-beats">
        {sub.beats.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      {sub.vars_out && sub.vars_out.length > 0 && (
        <p className="subphase-out">
          captures:{" "}
          {sub.vars_out.map((v, i) => (
            <span key={v}>
              {i > 0 && ", "}
              <code>{v}</code>
            </span>
          ))}
        </p>
      )}
      <AgentSlot phaseId={`${parentId}-${sub.id}`} />
    </div>
  );
}

export function PhaseCard({ phase }: { phase: Phase }) {
  return (
    <article className="phase-card" id={phase.id}>
      <header className="phase-card-head">
        <span className="phase-num">{phase.num.toString().padStart(2, "0")}</span>
        <h2 className="phase-title">{phase.title}</h2>
        <span className="phase-duration">{phase.duration_min} min</span>
      </header>

      <p className="phase-goal">{phase.goal}</p>

      <div className="phase-vars">
        <div className="phase-vars-col">
          <h4>Variables in</h4>
          <VarsList items={phase.vars_in} />
        </div>
        <div className="phase-vars-col">
          <h4>Variables out</h4>
          <VarsList items={phase.vars_out} isOut />
        </div>
      </div>

      {phase.beats.length > 0 && (
        <ul className="phase-beats">
          {phase.beats.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}

      {phase.subphases?.map((sub) => (
        <SubPhaseBlock key={sub.id} sub={sub} parentId={phase.id} />
      ))}

      {phase.showMethodologyDiagrams && <MethodologyDiagrams />}

      <AgentSlot phaseId={phase.id} />
    </article>
  );
}
