"use client"

import { useEffect, useMemo, useRef, useState } from "react"

/** Every IANA zone the runtime knows, with a fallback for older engines. */
function allZones(): string[] {
  const supported = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] })
    .supportedValuesOf
  if (typeof supported === "function") {
    try {
      return supported.call(Intl, "timeZone")
    } catch {
      /* fall through */
    }
  }
  return [
    "America/Bogota", "America/Mexico_City", "America/New_York", "America/Chicago",
    "America/Denver", "America/Los_Angeles", "America/Sao_Paulo", "America/Argentina/Buenos_Aires",
    "Europe/Madrid", "Europe/London", "Europe/Paris", "Europe/Berlin", "UTC",
  ]
}

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

function offsetLabel(zone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date())
    return parts.find((p) => p.type === "timeZoneName")?.value ?? ""
  } catch {
    return ""
  }
}

export function TimezoneSelect({
  value,
  onChange,
  label,
  help,
  searchPlaceholder,
  emptyLabel,
}: {
  value: string
  onChange: (tz: string) => void
  label: string
  help?: string
  searchPlaceholder: string
  emptyLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const wrapRef = useRef<HTMLDivElement>(null)
  const zones = useMemo(allZones, [])

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/\s+/g, "_")
    if (!needle) return zones.slice(0, 80)
    return zones.filter((z) => z.toLowerCase().includes(needle)).slice(0, 80)
  }, [q, zones])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  return (
    <div className="v2-field v2-tz" ref={wrapRef}>
      <label className="v2-label" htmlFor="tz-input">
        {label}
      </label>
      <input
        id="tz-input"
        className="v2-input"
        role="combobox"
        aria-expanded={open}
        aria-controls="tz-listbox"
        autoComplete="off"
        value={open ? q : value}
        placeholder={searchPlaceholder}
        onFocus={() => {
          setQ("")
          setOpen(true)
        }}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false)
          if (e.key === "Enter" && open && matches[0]) {
            e.preventDefault()
            onChange(matches[0])
            setOpen(false)
          }
        }}
      />
      {help && !open && <p className="v2-help">{help}</p>}

      {open && (
        <ul className="v2-tz-list" id="tz-listbox" role="listbox">
          {matches.length === 0 && <li className="v2-tz-empty">{emptyLabel}</li>}
          {matches.map((z) => (
            <li key={z} role="option" aria-selected={z === value}>
              <button
                type="button"
                className="v2-tz-option"
                data-active={z === value}
                onClick={() => {
                  onChange(z)
                  setOpen(false)
                }}
              >
                {z.replace(/_/g, " ")}
                <span className="v2-tz-offset">{offsetLabel(z)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
