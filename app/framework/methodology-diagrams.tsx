"use client";

// Three diagrams rendered inside Phase 12's card, in this order:
//   1. Daily practice — the bookended 5-min, with the three-beat surrender
//      embedded inside the BEFORE breath. Makes the surrender's place obvious.
//   2. Agency cycle — the 4-beat model (what the LISTS · 5 min beat actually
//      runs). Generic; rung determines how many of the four beats are active.
//   3. The climb · 5 rungs of faith building — INDEPENDENT of the agency
//      cycle. The 12-step-inspired escalation of praying + community building,
//      both growing together per rung, easiest to hardest. Mirrors AA's own
//      arc: private surrender (Steps 1–3) → confession to one (4–5) → amends
//      (8–9) → carry the message (12), compressed into 5 paired rungs.

const SURRENDER_LINES = [
  {
    num: "1",
    text: "Lo que no controlo es ___",
    source: "= {{unsettling_reality}}",
  },
  {
    num: "2",
    text: "Lo que es más grande que mi voluntad y me sostiene es ___",
    source: "= {{symbolic_help_mantra}}",
  },
  {
    num: "3",
    text: "Suelto el resultado y me quedo con sumar a mis listas hoy.",
    source: "fixed · same for every user, every day",
  },
];

const CYCLE_NODES = [
  { id: 1, label: "APRENDER", x: 110, y: 28 },
  { id: 2, label: "IDEAR", x: 192, y: 110 },
  { id: 3, label: "DECIDIR", x: 110, y: 192 },
  { id: 4, label: "INTENTAR", x: 28, y: 110 },
];

const CLIMB = [
  {
    num: "Rung 1",
    name: "Private recitation + one person told",
    body: "Every morning, recite the three-beat surrender alone: (1) lo que no controlo es ___, (2) lo más grande que mi voluntad es ___, (3) suelto el resultado y me quedo con ___. Once: send one short message to one chosen person — sister, cousin, friend — telling them you've started this. No promises, no detail.",
    climbWhen: "the recitation is daily without effort and the person has been told.",
  },
  {
    num: "Rung 2",
    name: "Recite with them on the line",
    body: "Once a week, do the recitation on a 60-second call/voice note to that person. They just listen — no advice, no fixing. Hand them the community guide here (a one-pager we provide: what to say back, what not to say, what “good support” looks like, what to do if they sound bad).",
    climbWhen: "three of these have happened cleanly.",
  },
  {
    num: "Rung 3",
    name: "Daily honesty",
    body: "Each evening, send that person a one-line check-in: did I do today's rung, yes/no, what got in the way. They acknowledge — they don't problem-solve.",
    climbWhen: "a week of check-ins lands, including at least one “no” they didn't try to fix.",
  },
  {
    num: "Rung 4",
    name: "Make one repair",
    body: "Name one small concrete repair owed because of {{enemy_name}} — a message unsent, a thing left undone, a person not seen. Do it. Tell your person it's done.",
    climbWhen: "the repair is complete and acknowledged.",
  },
  {
    num: "Rung 5",
    name: "Carry it to one more",
    body: "Tell your story — short, plain — to one new person who might also need it. The community grows by one. This is the hardest rung; many users will live on Rungs 1–3 for months. That is fine.",
    climbWhen: null,
  },
];

function DailyPractice() {
  return (
    <div className="methodology-diagram">
      <h3 className="methodology-diagram-title">Daily practice</h3>
      <div className="practice-flow">
        <div className="practice-col practice-col--before">
          <p className="practice-tag">Before · 60s</p>
          <p className="practice-step">One slow breath.</p>
          <div className="practice-surrender">
            <p className="practice-surrender-label">
              Recite the three-beat surrender
            </p>
            <ol className="practice-surrender-lines">
              {SURRENDER_LINES.map((l) => (
                <li key={l.num}>
                  <span className="practice-surrender-num">{l.num}</span>
                  <span className="practice-surrender-text">{l.text}</span>
                  <span className="practice-surrender-source">{l.source}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="practice-step">
            Image of <code>{`{{community_witness}}`}</code> knowing this is
            happening right now.
          </p>
        </div>

        <div className="practice-arrow" aria-hidden="true">
          →
        </div>

        <div className="practice-col practice-col--lists">
          <p className="practice-tag">Lists · 5 min</p>
          <p className="practice-step">
            Run the agency cycle at the current rung. Always at least the two
            lists (Aprender + Idear). Higher rungs add Decidir + Intentar.
          </p>
          <p className="practice-ref">↓ see cycle diagram below</p>
        </div>

        <div className="practice-arrow" aria-hidden="true">
          →
        </div>

        <div className="practice-col practice-col--after">
          <p className="practice-tag">After · 30s</p>
          <p className="practice-step">One slow breath.</p>
          <p className="practice-step practice-step--quote">
            "Hoy sumé a mis listas, eso es mío."
          </p>
          <p className="practice-step">
            One short gratitude beat — to{" "}
            <code>{`{{symbolic_help_mantra}}`}</code> or{" "}
            <code>{`{{community_witness}}`}</code>.
          </p>
        </div>
      </div>
      <p className="methodology-diagram-note">
        The three-beat surrender is the morning recitation inside the BEFORE
        breath — that's its place. Lines 1 + 2 are captured live in Phase 10
        from <code>unsettling_reality</code> and{" "}
        <code>symbolic_help_mantra</code>; line 3 is fixed text for every user.
        Counter-conditioning: the body learns to encode the lists with calm +
        being-witnessed, not panic + isolation.
      </p>
    </div>
  );
}

function AgencyCycle() {
  return (
    <div className="methodology-diagram">
      <h3 className="methodology-diagram-title">Agency cycle</h3>
      <div className="cycle-wrap">
        <svg
          className="cycle-svg"
          viewBox="0 0 220 220"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Four-beat agency cycle: Aprender, Idear, Decidir, Intentar"
        >
          <g
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1"
            strokeLinecap="round"
          >
            <path d="M 130 36 A 82 82 0 0 1 184 110" />
            <path d="M 184 110 A 82 82 0 0 1 130 184" />
            <path d="M 90 184 A 82 82 0 0 1 36 110" />
            <path d="M 36 110 A 82 82 0 0 1 90 36" />
          </g>
          <g fill="var(--gold)" stroke="none">
            <polygon points="184,108 180,114 188,114" />
            <polygon points="130,184 124,180 124,188" />
            <polygon points="36,112 32,106 40,106" />
            <polygon points="90,36 96,40 96,32" />
          </g>
          {CYCLE_NODES.map((n) => (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r="22"
                fill="#ffffff"
                stroke="var(--ink)"
                strokeWidth="1"
              />
              <text
                x={n.x}
                y={n.y - 2}
                textAnchor="middle"
                className="cycle-step-num"
              >
                {n.id}
              </text>
              <text
                x={n.x}
                y={n.y + 11}
                textAnchor="middle"
                className="cycle-node-label"
                style={{ fontSize: 7 }}
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>
        <ul className="cycle-legend">
          <li>
            <span className="cycle-legend-num">1 · Aprender</span> new info
            today (or: prediction vs outcome of yesterday's attempt).
          </li>
          <li>
            <span className="cycle-legend-num">2 · Idear</span> what's under my
            control to do about it. No filter.
          </li>
          <li>
            <span className="cycle-legend-num">3 · Decidir</span> one small
            idea as "when ___, I will ___". Predict what will happen.
          </li>
          <li>
            <span className="cycle-legend-num">4 · Intentar</span> do it. Feed
            the result back into Aprender tomorrow.
          </li>
        </ul>
      </div>
      <p className="methodology-diagram-note">
        Composite engine: Kolb's experiential loop (1984) + CBT behavioural
        experiment (the prediction-vs-outcome beat is what disconfirms
        catastrophic beliefs) + Gollwitzer's implementation intentions (the
        if-then form at Decidir, ~2× execution rate) + AA Step 10 daily
        inventory. Rung 1 runs only beats 1 + 2.
      </p>
    </div>
  );
}

function TheClimb() {
  return (
    <div className="methodology-diagram">
      <h3 className="methodology-diagram-title">
        The climb · 5 rungs of faith building
      </h3>
      <p className="methodology-diagram-note climb-intro">
        The user builds faith through paired private-prayer + community
        exercises, escalating in lockstep from easiest to hardest. Each rung
        adds one small spiritual act and one small social act of about the
        same difficulty — both rehearsed daily until they feel routine, then
        climb.
      </p>
      <ol className="climb-list">
        {CLIMB.map((r) => (
          <li className="climb-rung" key={r.num}>
            <div className="climb-rung-head">
              <span className="climb-rung-num">{r.num}</span>
              <span className="climb-rung-name">— {r.name}</span>
            </div>
            <p className="climb-rung-body">{r.body}</p>
            {r.climbWhen && (
              <p className="climb-rung-when">
                <span className="climb-rung-when-label">Climb when:</span>{" "}
                {r.climbWhen}
              </p>
            )}
          </li>
        ))}
      </ol>
      <p className="methodology-diagram-note">
        This is the 12-step-inspired escalation. The leap of faith does not
        hold alone — it gets built over weeks and months through paired
        praying + community building, both growing together per rung, easiest
        to hardest. Mirrors AA's own arc: private surrender (Steps 1–3) →
        confession to one (4–5) → amends (8–9) → carry the message (12). Climb
        when the current rung feels 1/10 hard. Many users will live on Rungs
        1–3 for months — that is fine. INDEPENDENT of the agency cycle: the
        cycle is the model for what happens in the daily 5-min lists work;
        these 5 rungs are how the faith underneath that work deepens over
        time. Script v0.3 captures Rung 1 in Phase 12b (community_witness +
        the morning recitation); Rungs 2–5 are design intent the AI agent
        will scaffold over weeks.
      </p>
    </div>
  );
}

export function MethodologyDiagrams() {
  return (
    <div className="methodology-block">
      <p className="methodology-eyebrow">Methodology · build the practice</p>
      <DailyPractice />
      <AgencyCycle />
      <TheClimb />
    </div>
  );
}
