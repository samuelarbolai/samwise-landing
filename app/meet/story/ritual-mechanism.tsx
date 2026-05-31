"use client"

import { motion } from "motion/react"
import type { StoryCopy } from "./strings"

// Beat 4 — "the ritual mechanism" (Paso 3). The ritual's three components:
// a said part (mantras) and two actionable parts. The two actionable parts
// echo the promise's two changes — protection stops the behaviour now, the
// new belief system shifts thoughts & feelings gradually.
export function RitualMechanism({
  copy,
  reduced,
}: {
  copy: StoryCopy
  reduced: boolean
}) {
  return (
    <section className="ritual-story-scene">
      <p className="ritual-story-kicker">{copy.mechanism_kicker}</p>
      <h3 className="ritual-story-title">{copy.mechanism_title}</h3>

      <div className="ritual-mech">
        <div className="ritual-mech-group">
          <p className="ritual-mech-label">{copy.mechanism_said_label}</p>
          <p className="ritual-mech-said">{copy.mechanism_said}</p>
        </div>

        <div className="ritual-mech-group">
          <p className="ritual-mech-label">{copy.mechanism_action_label}</p>
          <ul className="ritual-mech-actions">
            {copy.mechanism_actions.map((a, i) => (
              <motion.li
                key={a.head}
                className="ritual-mech-action"
                initial={reduced ? false : { opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.34,
                  ease: "easeOut",
                  delay: reduced ? 0 : i * 0.08,
                }}
              >
                <span className="ritual-mech-action-head">{a.head}</span>
                <span className="ritual-mech-action-body">{a.body}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
