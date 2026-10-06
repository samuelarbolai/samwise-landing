"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { CallLog, PublicUser, Schedule, SupportContact } from "@/lib/v2/queries"
import { toHHMM, toOptionalEmail } from "@/lib/v2/validate"
import { Brand } from "./brand"
import { LangToggle, useLang } from "./lang"
import { TimezoneSelect } from "./timezone-select"
import { LanguageSelect, languageName, useActiveAgentLanguages } from "./language-select"
import type { LanguageCode } from "@/lib/v2/validate"
import type { V2Strings } from "../strings"
import type { Lang } from "../strings"

export function Dashboard({
  user,
  initialSchedules,
  initialContacts,
  calls,
}: {
  user: PublicUser
  initialSchedules: Schedule[]
  initialContacts: SupportContact[]
  calls: CallLog[]
}) {
  const router = useRouter()
  const { lang, setLang, s } = useLang()
  const [me, setMe] = useState(user)
  const activeLanguages = useActiveAgentLanguages()

  async function logout() {
    await fetch("/api/v2/auth/logout", { method: "POST" })
    router.push("/v2/login")
    router.refresh()
  }

  return (
    <>
      <header className="v2-header">
        <Brand />
        <div className="v2-header-right">
          <LangToggle lang={lang} setLang={setLang} />
          <Link className="v2-headerlink" href="/">
            {s.backHome}
          </Link>
          <button className="v2-headerlink" type="button" onClick={logout}>
            {s.logout}
          </button>
        </div>
      </header>

      <main className="v2-main">
        <h1 className="v2-title">{s.settingsTitle}</h1>

        <ProfileSection s={s} me={me} onSaved={setMe} activeLanguages={activeLanguages} />
        <SchedulesSection s={s} initial={initialSchedules} />
        <ContactsSection s={s} initial={initialContacts} activeLanguages={activeLanguages} />
        <HistorySection s={s} calls={calls} lang={lang} timezone={me.timezone} />
      </main>
    </>
  )
}

// ─── profile ─────────────────────────────────────────────────────────────

function ProfileSection({
  s,
  me,
  onSaved,
  activeLanguages,
}: {
  s: V2Strings
  me: PublicUser
  onSaved: (u: PublicUser) => void
  activeLanguages: string[] | null
}) {
  const [name, setName] = useState(me.name)
  const [phone, setPhone] = useState(me.phone)
  const [timezone, setTimezone] = useState(me.timezone)
  const [language, setLanguage] = useState(me.language as LanguageCode)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const dirty =
    name !== me.name ||
    phone !== me.phone ||
    timezone !== me.timezone ||
    language !== me.language

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setDone(false)
    try {
      const res = await fetch("/api/v2/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, timezone, language }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? s.genericError)
      } else {
        onSaved(data.user)
        setDone(true)
      }
    } catch {
      setError(s.genericError)
    }
    setBusy(false)
  }

  return (
    <section className="v2-section">
      <div className="v2-section-head">
        <h2 className="v2-section-title">{s.profileHeading}</h2>
        <p className="v2-section-sub">{s.profileSub}</p>
      </div>

      <form className="v2-panel" onSubmit={save}>
        {error && <p className="v2-error" role="alert">{error}</p>}

        <div className="v2-field">
          <label className="v2-label" htmlFor="p-name">
            {s.name}
          </label>
          <input
            id="p-name"
            className="v2-input"
            value={name}
            required
            onChange={(e) => {
              setName(e.target.value)
              setDone(false)
            }}
          />
        </div>

        <div className="v2-field">
          <label className="v2-label" htmlFor="p-phone">
            {s.phone}
          </label>
          <input
            id="p-phone"
            className="v2-input"
            type="tel"
            inputMode="tel"
            value={phone}
            required
            onChange={(e) => {
              setPhone(e.target.value.replace(/[^\d+]/g, ""))
              setDone(false)
            }}
          />
          <p className="v2-help">{s.phoneHelp}</p>
        </div>

        <LanguageSelect
          value={language}
          onChange={(code) => {
            setLanguage(code)
            setDone(false)
          }}
          s={s}
          help={s.callLanguageHelpUser}
          idPrefix="profile"
          activeLanguages={activeLanguages}
        />

        <TimezoneSelect
          value={timezone}
          onChange={(tz) => {
            setTimezone(tz)
            setDone(false)
          }}
          label={s.timezone}
          help={s.timezoneHelp}
          searchPlaceholder={s.tzSearch}
          emptyLabel={s.tzNoResults}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22 }}>
          <button className="v2-btn v2-btn--sm" type="submit" disabled={busy || !dirty}>
            {busy ? s.saving : s.save}
          </button>
          {done && <span className="v2-ok">{s.saved}</span>}
        </div>
      </form>
    </section>
  )
}

// ─── call schedules ──────────────────────────────────────────────────────

function SchedulesSection({ s, initial }: { s: V2Strings; initial: Schedule[] }) {
  const [rows, setRows] = useState<Schedule[]>(initial)
  const [newTime, setNewTime] = useState("07:00")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sorted = [...rows].sort((a, b) => a.call_time.localeCompare(b.call_time))

  async function call(path: string, init: RequestInit): Promise<Record<string, unknown> | null> {
    setError(null)
    try {
      const res = await fetch(path, {
        headers: { "Content-Type": "application/json" },
        ...init,
      })
      const data = await res.json()
      if (!res.ok) {
        setError((data.error as string) ?? s.genericError)
        return null
      }
      return data
    } catch {
      setError(s.genericError)
      return null
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const data = await call("/api/v2/schedules", {
      method: "POST",
      body: JSON.stringify({ call_time: newTime }),
    })
    if (data) setRows((r) => [...r, data.schedule as Schedule])
    setBusy(false)
  }

  async function patch(id: number, fields: { call_time?: string; active?: boolean }) {
    const data = await call(`/api/v2/schedules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(fields),
    })
    if (data) {
      const updated = data.schedule as Schedule
      setRows((r) => r.map((x) => (x.id === id ? updated : x)))
    }
    return Boolean(data)
  }

  // Optimistic-first (the /outreach + /trip mutation convention).
  async function toggleActive(row: Schedule) {
    const next = !row.active
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, active: next } : x)))
    if (!(await patch(row.id, { active: next }))) {
      setRows((r) => r.map((x) => (x.id === row.id ? { ...x, active: row.active } : x)))
    }
  }

  async function remove(id: number) {
    if (!window.confirm(s.confirmDelete)) return
    const data = await call(`/api/v2/schedules/${id}`, { method: "DELETE" })
    if (data) setRows((r) => r.filter((x) => x.id !== id))
  }

  return (
    <section className="v2-section">
      <div className="v2-section-head">
        <h2 className="v2-section-title">{s.schedulesHeading}</h2>
        <p className="v2-section-sub">{s.schedulesSub}</p>
      </div>

      {error && <p className="v2-error" role="alert">{error}</p>}

      <ul className="v2-sched">
        {sorted.length === 0 && <li className="v2-sched-empty">{s.schedulesEmpty}</li>}
        {sorted.map((row) => (
          <li className="v2-sched-item" key={row.id} data-active={row.active}>
            <input
              className="v2-input v2-sched-time"
              type="time"
              style={{ border: "none", padding: 0 }}
              value={toHHMM(row.call_time)}
              onChange={(e) => {
                const v = e.target.value
                if (v) patch(row.id, { call_time: v })
              }}
            />
            <button
              className="v2-badge"
              type="button"
              data-on={row.active}
              aria-label={`${row.active ? s.activeOn : s.activeOff}. ${row.active ? s.toggleToPause : s.toggleToResume}`}
              onClick={() => toggleActive(row)}
            >
              {row.active ? s.activeOn : s.activeOff}
            </button>
            <div className="v2-sched-actions">
              <button
                className="v2-textbtn v2-textbtn--danger"
                type="button"
                onClick={() => remove(row.id)}
              >
                {s.delete}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form className="v2-sched-add" onSubmit={add}>
        <div className="v2-field">
          <label className="v2-label" htmlFor="new-time">
            {s.addTimeLabel}
          </label>
          <input
            id="new-time"
            className="v2-input"
            type="time"
            required
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            style={{ width: 150 }}
          />
        </div>
        <button className="v2-btn v2-btn--ghost v2-btn--sm" type="submit" disabled={busy}>
          {s.add}
        </button>
      </form>
    </section>
  )
}

// ─── support contacts ────────────────────────────────────────────────────

type ContactDraft = {
  name: string
  phone: string
  relationship: string
  language: LanguageCode
  email: string
}

const EMPTY_DRAFT: ContactDraft = {
  name: "",
  phone: "",
  relationship: "",
  language: "es",
  email: "",
}

function ContactsSection({
  s,
  initial,
  activeLanguages,
}: {
  s: V2Strings
  initial: SupportContact[]
  activeLanguages: string[] | null
}) {
  const [rows, setRows] = useState<SupportContact[]>(initial)
  const [draft, setDraft] = useState<ContactDraft>(EMPTY_DRAFT)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<ContactDraft>(EMPTY_DRAFT)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Inline, per-form — an invalid email blocks the save before any request.
  const [addEmailError, setAddEmailError] = useState<string | null>(null)
  const [editEmailError, setEditEmailError] = useState<string | null>(null)

  async function call(path: string, init: RequestInit): Promise<Record<string, unknown> | null> {
    setError(null)
    try {
      const res = await fetch(path, {
        headers: { "Content-Type": "application/json" },
        ...init,
      })
      const data = await res.json()
      if (!res.ok) {
        setError((data.error as string) ?? s.genericError)
        return null
      }
      return data
    } catch {
      setError(s.genericError)
      return null
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const email = toOptionalEmail(draft.email)
    if (email === false) {
      setAddEmailError(s.contactEmailInvalid)
      return
    }
    setBusy(true)
    // `active` is omitted on purpose — the column defaults to true, and
    // user_id is taken from the session server-side.
    const data = await call("/api/v2/contacts", {
      method: "POST",
      body: JSON.stringify({
        name: draft.name,
        phone: draft.phone,
        relationship: draft.relationship || null,
        language: draft.language,
        email,
      }),
    })
    if (data) {
      setRows((r) => [...r, data.contact as SupportContact])
      setDraft(EMPTY_DRAFT)
    }
    setBusy(false)
  }

  async function patch(id: number, fields: Record<string, unknown>) {
    const data = await call(`/api/v2/contacts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(fields),
    })
    if (data) {
      const updated = data.contact as SupportContact
      setRows((r) => r.map((x) => (x.id === id ? updated : x)))
    }
    return Boolean(data)
  }

  // Optimistic-first, per the mutation convention in samwise-app's /outreach
  // and /trip: flip local state immediately, revert if the server disagrees.
  async function toggleActive(c: SupportContact) {
    const next = !c.active
    setRows((r) => r.map((x) => (x.id === c.id ? { ...x, active: next } : x)))
    const ok = await patch(c.id, { active: next })
    if (!ok) setRows((r) => r.map((x) => (x.id === c.id ? { ...x, active: c.active } : x)))
  }

  async function saveEdit(e: React.FormEvent, id: number) {
    e.preventDefault()
    const email = toOptionalEmail(editDraft.email)
    if (email === false) {
      setEditEmailError(s.contactEmailInvalid)
      return
    }
    setBusy(true)
    const saved = await patch(id, {
      name: editDraft.name,
      phone: editDraft.phone,
      relationship: editDraft.relationship || null,
      language: editDraft.language,
      email,
    })
    if (saved) setEditingId(null)
    setBusy(false)
  }

  async function remove(id: number) {
    if (!window.confirm(s.contactConfirmDelete)) return
    const data = await call(`/api/v2/contacts/${id}`, { method: "DELETE" })
    if (data) setRows((r) => r.filter((x) => x.id !== id))
  }

  // `null` while the agent list loads — nothing is flagged pending until then.
  function isPending(code: string): boolean {
    return activeLanguages !== null && !activeLanguages.includes(code)
  }

  const pendingContacts = rows.filter((c) => isPending(c.language))

  function beginEdit(c: SupportContact) {
    setEditingId(c.id)
    setEditDraft({
      name: c.name,
      phone: c.phone,
      relationship: c.relationship ?? "",
      language: c.language as LanguageCode,
      email: c.email ?? "",
    })
    setEditEmailError(null)
    setError(null)
  }

  return (
    <section className="v2-section">
      <div className="v2-section-head">
        <h2 className="v2-section-title">{s.contactsHeading}</h2>
        <p className="v2-section-sub">{s.contactsSub}</p>
      </div>

      {error && <p className="v2-error" role="alert">{error}</p>}

      {pendingContacts.length > 0 && (
        <div className="v2-soon" role="status" style={{ marginBottom: 16 }}>
          <strong className="v2-soon__title">{s.agentSoonTitle}</strong>
          {s.agentSoonContacts}
          <ul>
            {pendingContacts.map((c) => (
              <li key={c.id}>
                {c.name} — {languageName(c.language, s)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="v2-sched">
        {rows.length === 0 && <li className="v2-sched-empty">{s.contactsEmpty}</li>}

        {rows.map((c) =>
          editingId === c.id ? (
            <li className="v2-contact-item" key={c.id}>
              <form className="v2-contact-edit" onSubmit={(e) => saveEdit(e, c.id)}>
                <div className="v2-field">
                  <label className="v2-label" htmlFor={`c-name-${c.id}`}>
                    {s.contactName}
                  </label>
                  <input
                    id={`c-name-${c.id}`}
                    className="v2-input"
                    required
                    value={editDraft.name}
                    onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                  />
                </div>
                <div className="v2-field">
                  <label className="v2-label" htmlFor={`c-phone-${c.id}`}>
                    {s.contactPhone}
                  </label>
                  <input
                    id={`c-phone-${c.id}`}
                    className="v2-input"
                    type="tel"
                    inputMode="tel"
                    required
                    value={editDraft.phone}
                    onChange={(e) =>
                      setEditDraft({ ...editDraft, phone: e.target.value.replace(/[^\d+]/g, "") })
                    }
                  />
                </div>
                <div className="v2-field">
                  <label className="v2-label" htmlFor={`c-email-${c.id}`}>
                    {s.contactEmail}
                  </label>
                  {/* type="text" + inputMode, not type="email": the native validity
                      bubble would pre-empt the inline error below. */}
                  <input
                    id={`c-email-${c.id}`}
                    className="v2-input"
                    type="text"
                    inputMode="email"
                    autoCapitalize="none"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={s.contactEmailPh}
                    aria-invalid={editEmailError ? true : undefined}
                    aria-describedby={`c-email-help-${c.id}${editEmailError ? ` c-email-err-${c.id}` : ""}`}
                    value={editDraft.email}
                    onChange={(e) => {
                      setEditDraft({ ...editDraft, email: e.target.value })
                      setEditEmailError(null)
                    }}
                  />
                  <p className="v2-help" id={`c-email-help-${c.id}`}>
                    {s.contactEmailHelp}
                  </p>
                  {editEmailError && (
                    <p className="v2-field-error" id={`c-email-err-${c.id}`} role="alert">
                      {editEmailError}
                    </p>
                  )}
                </div>
                <div className="v2-field">
                  <label className="v2-label" htmlFor={`c-rel-${c.id}`}>
                    {s.contactRelationship}
                  </label>
                  <input
                    id={`c-rel-${c.id}`}
                    className="v2-input"
                    placeholder={s.contactRelationshipPh}
                    value={editDraft.relationship}
                    onChange={(e) => setEditDraft({ ...editDraft, relationship: e.target.value })}
                  />
                </div>
                <LanguageSelect
                  value={editDraft.language}
                  onChange={(code) => setEditDraft({ ...editDraft, language: code })}
                  s={s}
                  help={s.callLanguageHelpContact}
                  idPrefix={`contact-${c.id}`}
                  activeLanguages={activeLanguages}
                />

                <div className="v2-contact-edit-actions">
                  <button className="v2-btn v2-btn--sm" type="submit" disabled={busy}>
                    {busy ? s.saving : s.contactSave}
                  </button>
                  <button
                    className="v2-textbtn"
                    type="button"
                    onClick={() => {
                      setEditingId(null)
                      setEditEmailError(null)
                    }}
                  >
                    {s.cancel}
                  </button>
                </div>
              </form>
            </li>
          ) : (
            <li className="v2-contact-item" key={c.id} data-active={c.active}>
              <div className="v2-contact-main">
                <p className="v2-contact-name">{c.name}</p>
                <p className="v2-contact-meta">
                  <span className="v2-contact-phone">{c.phone}</span>
                  <span className="v2-contact-rel">
                    {c.relationship || s.contactNoRelationship}
                  </span>
                  {c.email && <span className="v2-contact-email">{c.email}</span>}
                  <span className="v2-contact-lang" data-pending={isPending(c.language)}>
                    {languageName(c.language, s)}
                  </span>
                </p>
              </div>

              <button
                className="v2-badge"
                type="button"
                data-on={c.active}
                aria-label={`${c.active ? s.activeOn : s.activeOff}. ${c.active ? s.contactPause : s.contactResume}`}
                onClick={() => toggleActive(c)}
              >
                {c.active ? s.activeOn : s.activeOff}
              </button>

              <div className="v2-sched-actions">
                <button className="v2-textbtn" type="button" onClick={() => beginEdit(c)}>
                  {s.edit}
                </button>
                <button
                  className="v2-textbtn v2-textbtn--danger"
                  type="button"
                  onClick={() => remove(c.id)}
                >
                  {s.delete}
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      <form className="v2-contact-add" onSubmit={add}>
        <p className="v2-contact-add-heading">{s.contactAddHeading}</p>
        <div className="v2-row">
          <div className="v2-field">
            <label className="v2-label" htmlFor="new-c-name">
              {s.contactName}
            </label>
            <input
              id="new-c-name"
              className="v2-input"
              placeholder={s.contactNamePh}
              required
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div className="v2-field">
            <label className="v2-label" htmlFor="new-c-phone">
              {s.contactPhone}
            </label>
            <input
              id="new-c-phone"
              className="v2-input"
              type="tel"
              inputMode="tel"
              placeholder="+573001234567"
              required
              value={draft.phone}
              onChange={(e) =>
                setDraft({ ...draft, phone: e.target.value.replace(/[^\d+]/g, "") })
              }
            />
          </div>
          <div className="v2-field">
            <label className="v2-label" htmlFor="new-c-rel">
              {s.contactRelationship}
            </label>
            <input
              id="new-c-rel"
              className="v2-input"
              placeholder={s.contactRelationshipPh}
              value={draft.relationship}
              onChange={(e) => setDraft({ ...draft, relationship: e.target.value })}
            />
          </div>
        </div>
        <div className="v2-field" style={{ marginTop: 16 }}>
          <label className="v2-label" htmlFor="new-c-email">
            {s.contactEmail}
          </label>
          <input
            id="new-c-email"
            className="v2-input"
            type="text"
            inputMode="email"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            placeholder={s.contactEmailPh}
            aria-invalid={addEmailError ? true : undefined}
            aria-describedby={`new-c-email-help${addEmailError ? " new-c-email-err" : ""}`}
            value={draft.email}
            onChange={(e) => {
              setDraft({ ...draft, email: e.target.value })
              setAddEmailError(null)
            }}
          />
          <p className="v2-help" id="new-c-email-help">
            {s.contactEmailHelp}
          </p>
          {addEmailError && (
            <p className="v2-field-error" id="new-c-email-err" role="alert">
              {addEmailError}
            </p>
          )}
        </div>
        <div style={{ marginTop: 16 }}>
          <LanguageSelect
            value={draft.language}
            onChange={(code) => setDraft({ ...draft, language: code })}
            s={s}
            help={s.callLanguageHelpContact}
            idPrefix="new-contact"
            activeLanguages={activeLanguages}
          />
        </div>
        <button className="v2-btn v2-btn--ghost v2-btn--sm" type="submit" disabled={busy}>
          {s.contactAdd}
        </button>
      </form>
    </section>
  )
}

// ─── call history (read-only) ────────────────────────────────────────────

function HistorySection({
  s,
  calls,
  lang,
  timezone,
}: {
  s: V2Strings
  calls: CallLog[]
  lang: Lang
  timezone: string
}) {
  function when(iso: string | null): string {
    if (!iso) return "—"
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return "—"
    try {
      return new Intl.DateTimeFormat(lang === "es" ? "es-CO" : "en-US", {
        timeZone: timezone,
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d)
    } catch {
      return d.toISOString()
    }
  }

  return (
    <section className="v2-section">
      <div className="v2-section-head">
        <h2 className="v2-section-title">{s.historyHeading}</h2>
        <p className="v2-section-sub">{s.historySub}</p>
      </div>

      {calls.length === 0 && <p className="v2-sched-empty">{s.historyEmpty}</p>}

      {calls.map((c) => (
        <article className="v2-call" key={c.id}>
          <div className="v2-call-top">
            <span className="v2-call-when">{when(c.called_at)}</span>
            {c.call_success !== null && (
              <span className="v2-call-result" data-ok={c.call_success}>
                {c.call_success ? `✓ ${s.success}` : `✗ ${s.notSuccess}`}
              </span>
            )}
            {c.call_type !== "ritual" && (
              <span className="v2-call-kind">
                {c.contact_name
                  ? `${s.callToContactNamed} ${c.contact_name}`
                  : s.callToContact}
              </span>
            )}
          </div>

          <dl className="v2-call-meta">
            {c.status && (
              <div>
                <dt>{s.colStatus}</dt>
                <dd>{c.status}</dd>
              </div>
            )}
            {c.end_reason && (
              <div>
                <dt>{s.colEnd}</dt>
                <dd>{c.end_reason}</dd>
              </div>
            )}
            {c.tts_ttfb !== null && (
              <div>
                <dt>{s.colLatency}</dt>
                <dd>{Number(c.tts_ttfb).toFixed(2)}s</dd>
              </div>
            )}
            {c.score !== null && (
              <div>
                <dt>{s.score}</dt>
                <dd>{c.score}</dd>
              </div>
            )}
            {c.sentiment !== null && (
              <div>
                <dt>{s.sentiment}</dt>
                <dd>{c.sentiment}</dd>
              </div>
            )}
            {c.goal_achieved !== null && (
              <div>
                <dt>{s.goal}</dt>
                <dd>{c.goal_achieved ? s.yes : s.no}</dd>
              </div>
            )}
          </dl>

          {c.summary && <p className="v2-call-summary">{c.summary}</p>}
        </article>
      ))}
    </section>
  )
}
