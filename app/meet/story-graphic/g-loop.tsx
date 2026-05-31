"use client"

import type { StoryCopy } from "../story/strings"

// Graphic daily loop — three nodes in a triangle, arrows clockwise, a "↻"
// in the middle. The node labels are the only text. Replaces the canonical
// numbered text-list.
export function GLoop({ copy }: { copy: StoryCopy; reduced: boolean }) {
  const [a, b, c] = copy.loop_nodes
  return (
    <section className="gstory-scene">
      <p className="gstory-kicker">{copy.loop_kicker}</p>
      <svg className="gsvg" viewBox="0 0 320 232" role="img" aria-label={copy.loop_title}>
        <defs>
          <marker
            id="g-arrow"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" className="g-fill-gold" />
          </marker>
        </defs>

        {/* arrows clockwise: top → BR → BL → top */}
        <path d="M186,58 Q250,92 244,150" className="g-flow-gold" markerEnd="url(#g-arrow)" />
        <path d="M218,188 Q160,214 102,188" className="g-flow-gold" markerEnd="url(#g-arrow)" />
        <path d="M76,150 Q70,92 134,58" className="g-flow-gold" markerEnd="url(#g-arrow)" />

        {/* nodes */}
        <circle cx="160" cy="50" r="24" className="g-node" />
        <circle cx="244" cy="176" r="24" className="g-node" />
        <circle cx="76" cy="176" r="24" className="g-node" />
        <text x="160" y="55" textAnchor="middle" className="g-num">1</text>
        <text x="244" y="181" textAnchor="middle" className="g-num">2</text>
        <text x="76" y="181" textAnchor="middle" className="g-num">3</text>

        {/* center loop mark */}
        <text x="160" y="148" textAnchor="middle" className="g-t-gold" fontSize="18">
          ↻
        </text>

        {/* labels */}
        <text x="160" y="16" textAnchor="middle" className="g-t-serif">{a.label}</text>
        <text x="244" y="220" textAnchor="middle" className="g-t-serif">{b.label}</text>
        <text x="76" y="220" textAnchor="middle" className="g-t-serif">{c.label}</text>
      </svg>
    </section>
  )
}
