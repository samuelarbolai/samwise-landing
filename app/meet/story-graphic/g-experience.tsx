"use client"

import type { StoryCopy } from "../story/strings"

// Graphic experience — the six steps as a clockwise cycle ring with the
// document glyph at the center (the spine the loop writes into). Numbers on
// the ring; the full step heads drop to a compact legend below.
const R = 88
const CX = 120
const CY = 120
const ang = (i: number) => ((-90 + i * 60) * Math.PI) / 180
const onRing = (i: number, r = R): [number, number] => [
  CX + r * Math.cos(ang(i)),
  CY + r * Math.sin(ang(i)),
]

export function GExperience({ copy }: { copy: StoryCopy; reduced: boolean }) {
  const steps = copy.cycle_steps
  const gap = (14 * Math.PI) / 180

  return (
    <section className="gstory-scene">
      <p className="gstory-kicker">{copy.cycle_kicker}</p>

      <svg className="gsvg" viewBox="0 0 240 240" role="img" aria-label={copy.cycle_title}>
        <defs>
          <marker
            id="g-ring-arrow"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" className="g-fill-gold" />
          </marker>
        </defs>

        {/* clockwise arcs between consecutive nodes */}
        {steps.map((_, i) => {
          const [sx, sy] = [
            CX + R * Math.cos(ang(i) + gap),
            CY + R * Math.sin(ang(i) + gap),
          ]
          const [ex, ey] = [
            CX + R * Math.cos(ang(i + 1) - gap),
            CY + R * Math.sin(ang(i + 1) - gap),
          ]
          return (
            <path
              key={i}
              d={`M${sx.toFixed(1)},${sy.toFixed(1)} A${R},${R} 0 0 1 ${ex.toFixed(1)},${ey.toFixed(1)}`}
              className="g-flow-gold"
              markerEnd="url(#g-ring-arrow)"
            />
          )
        })}

        {/* document glyph at the center */}
        <rect x={CX - 16} y={CY - 20} width="32" height="40" rx="3" className="g-node-center" />
        <line x1={CX - 9} y1={CY - 10} x2={CX + 9} y2={CY - 10} className="g-flow-gold" />
        <line x1={CX - 9} y1={CY - 3} x2={CX + 9} y2={CY - 3} className="g-line" />
        <line x1={CX - 9} y1={CY + 4} x2={CX + 5} y2={CY + 4} className="g-line" />
        <line x1={CX - 9} y1={CY + 11} x2={CX + 9} y2={CY + 11} className="g-line" />

        {/* nodes */}
        {steps.map((s, i) => {
          const [x, y] = onRing(i)
          return (
            <g key={s.n}>
              <circle cx={x} cy={y} r="17" className="g-node" />
              <text x={x} y={y + 4} textAnchor="middle" className="g-num">
                {s.n}
              </text>
            </g>
          )
        })}
      </svg>

      <ol className="gstory-legend">
        {steps.map((s) => (
          <li key={s.n} style={{ display: "contents" }}>
            <span className="gstory-legend-n">{s.n}</span>
            <span>{s.head}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
