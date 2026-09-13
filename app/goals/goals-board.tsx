"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "samwise:goals-board";

type Orientation = "landscape" | "portrait";

type GoalsState = {
  northstar: string;
  goal2: string;
  goal3: string;
  goal4: string;
  month: string; // "YYYY-MM"
  orientation: Orientation;
};

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function defaultState(): GoalsState {
  return {
    northstar: "",
    goal2: "",
    goal3: "",
    goal4: "",
    month: currentMonth(),
    orientation: "landscape",
  };
}

function daysInMonth(month: string): number {
  const [year, mon] = month.split("-").map(Number);
  return new Date(year, mon, 0).getDate();
}

function weekdayInitial(month: string, day: number): string {
  const [year, mon] = month.split("-").map(Number);
  const date = new Date(year, mon - 1, day);
  return ["S", "M", "T", "W", "T", "F", "S"][date.getDay()];
}

function isWeekend(month: string, day: number): boolean {
  const [year, mon] = month.split("-").map(Number);
  const dow = new Date(year, mon - 1, day).getDay();
  return dow === 0 || dow === 6;
}

function monthLabel(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  return new Date(year, mon - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function GoalsBoard() {
  const [state, setState] = useState<GoalsState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setState({ ...defaultState(), ...JSON.parse(raw) });
      } catch {
        // ignore malformed storage, fall back to defaults
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const days = Array.from({ length: daysInMonth(state.month) }, (_, i) => i + 1);

  const rows: { label: string; value: keyof GoalsState; placeholder: string; northstar?: boolean }[] = [
    { label: state.northstar, value: "northstar", placeholder: "Northstar", northstar: true },
    { label: state.goal2, value: "goal2", placeholder: "Goal 2" },
    { label: state.goal3, value: "goal3", placeholder: "Goal 3" },
    { label: state.goal4, value: "goal4", placeholder: "Goal 4" },
  ];

  return (
    <div
      className={
        state.orientation === "portrait" ? "goals-root goals-orientation-portrait" : "goals-root"
      }
    >
      <style>{`@page { size: letter ${state.orientation}; margin: 12mm; }`}</style>
      <div className="goals-container">
        <header className="goals-header goals-controls">
          <a className="goals-brand" href="/">
            Samwise<span className="goals-brand-star">✦</span>
          </a>
          <h1 className="goals-title">Goal board</h1>
          <p className="goals-sub">Print a fresh sheet each month.</p>
        </header>

        <section className="goals-controls goals-form">
          <div className="goals-field">
            <label htmlFor="goal-northstar">Northstar</label>
            <input
              id="goal-northstar"
              type="text"
              value={state.northstar}
              onChange={(e) => setState((s) => ({ ...s, northstar: e.target.value }))}
              placeholder="Your northstar goal"
            />
          </div>
          <div className="goals-field">
            <label htmlFor="goal-2">Goal 2</label>
            <input
              id="goal-2"
              type="text"
              value={state.goal2}
              onChange={(e) => setState((s) => ({ ...s, goal2: e.target.value }))}
              placeholder="Goal 2"
            />
          </div>
          <div className="goals-field">
            <label htmlFor="goal-3">Goal 3</label>
            <input
              id="goal-3"
              type="text"
              value={state.goal3}
              onChange={(e) => setState((s) => ({ ...s, goal3: e.target.value }))}
              placeholder="Goal 3"
            />
          </div>
          <div className="goals-field">
            <label htmlFor="goal-4">Goal 4</label>
            <input
              id="goal-4"
              type="text"
              value={state.goal4}
              onChange={(e) => setState((s) => ({ ...s, goal4: e.target.value }))}
              placeholder="Goal 4"
            />
          </div>
          <div className="goals-field goals-field--month">
            <label htmlFor="goal-month">Month</label>
            <input
              id="goal-month"
              type="month"
              value={state.month}
              onChange={(e) => setState((s) => ({ ...s, month: e.target.value || currentMonth() }))}
            />
          </div>
          <div className="goals-field">
            <label id="goal-orientation-label">Orientation</label>
            <div className="goals-orientation-toggle" role="group" aria-labelledby="goal-orientation-label">
              <button
                type="button"
                className={state.orientation === "landscape" ? "is-active" : ""}
                onClick={() => setState((s) => ({ ...s, orientation: "landscape" }))}
              >
                Landscape
              </button>
              <button
                type="button"
                className={state.orientation === "portrait" ? "is-active" : ""}
                onClick={() => setState((s) => ({ ...s, orientation: "portrait" }))}
              >
                Portrait
              </button>
            </div>
          </div>
          <button type="button" className="goals-print-btn" onClick={() => window.print()}>
            Print
          </button>
        </section>

        <section
          className={
            state.orientation === "portrait" ? "goals-grid-wrap goals-grid-wrap--rotated" : "goals-grid-wrap"
          }
        >
          <p className="goals-grid-label goals-controls">{monthLabel(state.month)}</p>
          <table className="goals-grid">
            <thead>
              <tr>
                <th className="goals-grid-corner" />
                {days.map((day) => (
                  <th
                    key={day}
                    className={isWeekend(state.month, day) ? "goals-grid-day goals-grid-day--weekend" : "goals-grid-day"}
                  >
                    <span className="goals-grid-day-num">{day}</span>
                    <span className="goals-grid-day-dow">{weekdayInitial(state.month, day)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.value} className={row.northstar ? "goals-grid-row goals-grid-row--northstar" : "goals-grid-row"}>
                  <th className="goals-grid-rowlabel">
                    {row.northstar && <span className="goals-grid-star">✦</span>}
                    <span className={row.label ? "" : "goals-grid-rowlabel--placeholder"}>
                      {row.label || row.placeholder}
                    </span>
                  </th>
                  {days.map((day) => (
                    <td
                      key={day}
                      className={isWeekend(state.month, day) ? "goals-grid-cell goals-grid-cell--weekend" : "goals-grid-cell"}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
