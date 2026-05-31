"use client"

import { motion } from "motion/react"
import type { StoryCopy } from "./strings"

// Beat 3 — "the daily loop". The engine that runs every day, distinct
// from the multi-session "experience" (six steps): a call walks the user
// into the ritual, they live it, a short call tracks how it went. Three
// nodes + a loop-back. Generic — does NOT name the tracking agent.
export function DailyLoop({
  copy,
  reduced,
}: {
  copy: StoryCopy
  reduced: boolean
}) {
  return (
    <section className="ritual-story-scene">
      <p className="ritual-story-kicker">{copy.loop_kicker}</p>
      <h3 className="ritual-story-title">{copy.loop_title}</h3>
      <p className="ritual-story-body">{copy.loop_body}</p>

      <ol className="ritual-loop">
        {copy.loop_nodes.map((node, i) => (
          <motion.li
            key={node.label}
            className="ritual-loop-node"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: 0.34,
              ease: "easeOut",
              delay: reduced ? 0 : i * 0.08,
            }}
          >
            <span className="ritual-loop-dot" aria-hidden="true">
              {i + 1}
            </span>
            <div className="ritual-loop-text">
              <p className="ritual-loop-head">{node.label}</p>
              <p className="ritual-loop-body">{node.body}</p>
            </div>
          </motion.li>
        ))}
      </ol>

      <p className="ritual-loop-repeat">{copy.loop_repeat}</p>
    </section>
  )
}
