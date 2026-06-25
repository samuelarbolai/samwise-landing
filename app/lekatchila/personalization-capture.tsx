"use client"

import { useState } from "react"

// The close — just three options to pick from, as a visual menu during the
// in-person conversation. No fields, no assemble step, no booking link;
// intake happens in the room.
type ProcessPath = "template" | "own" | "edits"

const PATH_LABEL: Record<ProcessPath, string> = {
  template: "Use the Samwise template process as-is",
  own: "Bring your own process",
  edits: "Edit the Samwise script with us",
}

export function PersonalizationCapture() {
  const [path, setPath] = useState<ProcessPath>("template")

  return (
    <fieldset className="l-cap-field">
      <legend className="l-cap-label">Your process</legend>
      <div className="l-cap-paths">
        {(Object.keys(PATH_LABEL) as ProcessPath[]).map((p) => (
          <label
            key={p}
            className={"l-cap-path" + (path === p ? " is-on" : "")}
          >
            <input
              type="radio"
              name="process-path"
              checked={path === p}
              onChange={() => setPath(p)}
            />
            {PATH_LABEL[p]}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
