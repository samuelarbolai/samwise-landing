"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import "../styles.css"
import "./product-manager.css"

function FourPointStar({ size = 18 }: { size?: number }) {
  return (
    <svg
      className="four-point-star"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0 Q13 11, 24 12 Q13 13, 12 24 Q11 13, 0 12 Q11 11, 12 0 Z" />
    </svg>
  )
}

function useViewportHeight() {
  const [vh, setVh] = useState(800)
  useEffect(() => {
    const update = () => setVh(window.innerHeight)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return vh
}

function FixedScene({
  children,
  id,
  fadeInStart,
  fadeInEnd,
  fadeOutStart,
  fadeOutEnd,
  isFirst = false,
  className = "",
}: {
  children: ReactNode
  id?: string
  fadeInStart: number
  fadeInEnd: number
  fadeOutStart: number
  fadeOutEnd: number
  isFirst?: boolean
  className?: string
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(
    scrollY,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [isFirst ? 1 : 0, 1, 1, 0]
  )
  return (
    <motion.section className={`fixed-scene ${className}`} id={id} style={{ opacity }}>
      <div className="fixed-scene-inner">{children}</div>
    </motion.section>
  )
}

function PinFadeScene({
  children,
  id,
  fadeInStart,
  fadeInEnd,
  className = "",
}: {
  children: ReactNode
  id?: string
  fadeInStart: number
  fadeInEnd: number
  className?: string
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [fadeInStart, fadeInEnd], [0, 1])
  return (
    <section className={`pin-fade-scene ${className}`} id={id}>
      <motion.div className="pin-fade-content" style={{ opacity }}>
        {children}
      </motion.div>
    </section>
  )
}

function ScrollReveal({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 88%", "start 45%"],
  })
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [30, 0])
  return (
    <motion.div ref={ref} className={className} style={{ opacity, y }}>
      {children}
    </motion.div>
  )
}

export default function ProductManagerClient() {
  const [navOpen, setNavOpen] = useState(false)
  const vh = useViewportHeight()

  return (
    <div className="editorial-root letter-root tease-root pm-portfolio-root">
      <nav
        className={`editorial-nav editorial-nav--fixed editorial-nav--star ${navOpen ? "is-open" : "is-closed"}`}
        onMouseEnter={() => setNavOpen(true)}
        onMouseLeave={() => setNavOpen(false)}
      >
        <button
          className="nav-star"
          onClick={() => setNavOpen((v) => !v)}
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={navOpen}
        >
          <FourPointStar />
        </button>

        <div className="nav-content" aria-hidden={!navOpen}>
          <a href="/product-manager" className="brand">
            Samuel Giraldo Concha
            <span className="brand-star" aria-hidden="true">
              <FourPointStar size={8} />
            </span>
          </a>
          <div className="nav-right">
            <a href="#projects" className="nav-link" onClick={() => setNavOpen(false)}>
              Projects
            </a>
            <a href="#skills" className="nav-link" onClick={() => setNavOpen(false)}>
              Skills
            </a>
            <a href="mailto:samuelgiraldoconcha@gmail.com" className="nav-link">
              Contact
            </a>
            <a href="https://www.linkedin.com/in/samuel-giraldo-concha/" target="_blank" rel="noopener noreferrer" className="nav-link">
              LinkedIn
            </a>
          </div>
        </div>
      </nav>

      <FixedScene
        isFirst
        fadeInStart={0}
        fadeInEnd={1}
        fadeOutStart={vh * 0.55}
        fadeOutEnd={vh * 0.9}
      >
        <div className="editorial-wrap">
          <header className="editorial-landing-hero">
            <p className="eyebrow">Portfolio · Product Management</p>
            <h1 className="editorial-hero-statement">Product Manager</h1>
            <p className="lede">
              {"I take 0→1 products from PRD to shipped, measurable outcomes, building AI-driven automation into the product itself rather than bolting it on. Recent work spans healthtech MVPs, agentic lead-generation platforms, and behaviour-change systems."}
            </p>
            <div className="pm-meta">
              {"Bogotá, Colombia · Hybrid/Remote, NY-hours capable · +57 316 824 8411 · samuelgiraldoconcha@gmail.com"}
            </div>
          </header>
        </div>
      </FixedScene>

      <main className="letter-main">
        <div className="hero-spacer" aria-hidden="true" />

        <PinFadeScene
          id="projects"
          className="voice-section"
          fadeInStart={vh * 1.0}
          fadeInEnd={vh * 1.3}
        >
          <div className="editorial-wrap">
            <p className="section-eyebrow">Projects</p>

            {/* PROJECT 01 */}
            <article className="project">
              <div className="project__chrome">
                <div>
                  <div className="project__id">PROJECT_01 · LIFEX_LEADS.DB</div>
                  <h3 className="project__title">AI Agentic Lead Sourcing Platform</h3>
                  <div className="project__role">
                    {"LifeX Ventures · Product Manager · Oct 2025 – Present"}
                  </div>
                </div>
                <span className="status-chip status-chip--live">Live</span>
              </div>
              <div className="project__body">
                <ul>
                  <li>{"Self-serve access to 30,000+ high-signal healthcare leads with verified LinkedIn and email data."}</li>
                  <li>{"96% lead data accuracy at scale via a custom agentic enrichment and verification pipeline."}</li>
                  <li>{"Adopted across 7 portfolio companies; contributed to 14 new deal introductions."}</li>
                </ul>
                <div className="slots">
                  <div className="slot slot--draft">
                    <div className="slot__label">
                      <span>Preview</span>
                      <span className="slot__badge">Interactive</span>
                    </div>
                    <svg className="mockup-svg" viewBox="0 0 280 150" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="278" height="148" fill="var(--paper)" stroke="var(--rule)" />
                      <rect x="1" y="1" width="278" height="16" fill="var(--paper-deep)" stroke="var(--rule)" />
                      <circle cx="10" cy="9" r="2.2" fill="var(--rule-soft)" />
                      <circle cx="18" cy="9" r="2.2" fill="var(--rule-soft)" />
                      <circle cx="26" cy="9" r="2.2" fill="var(--rule-soft)" />
                      <text x="140" y="12" fontFamily="monospace" fontSize="7" fill="var(--ink-muted)" textAnchor="middle">
                        app.lifex.vc/leads
                      </text>
                      <text x="10" y="30" fontFamily="monospace" fontSize="6.5" fill="var(--ink-muted)">
                        {"LEAD DATABASE — 30,412 RECORDS"}
                      </text>
                      <line x1="10" y1="36" x2="270" y2="36" stroke="var(--rule-soft)" />
                      <rect x="10" y="42" width="80" height="9" fill="var(--paper-deep)" stroke="var(--rule-soft)" />
                      <rect x="96" y="42" width="60" height="9" fill="var(--paper-deep)" stroke="var(--rule-soft)" />
                      <rect x="162" y="42" width="50" height="9" fill="var(--gold)" opacity="0.35" stroke="var(--gold)" />
                      <rect x="10" y="56" width="260" height="1" fill="var(--rule-soft)" />
                      <rect x="10" y="64" width="260" height="10" fill="none" stroke="var(--rule-soft)" />
                      <rect x="10" y="78" width="260" height="10" fill="none" stroke="var(--rule-soft)" />
                      <rect x="10" y="92" width="260" height="10" fill="none" stroke="var(--rule-soft)" />
                      <rect x="10" y="106" width="260" height="10" fill="none" stroke="var(--rule-soft)" />
                      <rect x="220" y="64" width="20" height="10" fill="var(--moss)" opacity="0.25" />
                      <rect x="220" y="78" width="20" height="10" fill="var(--moss)" opacity="0.25" />
                      <rect x="220" y="92" width="20" height="10" fill="var(--amber-deep)" opacity="0.25" />
                      <rect x="220" y="106" width="20" height="10" fill="var(--moss)" opacity="0.25" />
                      <text x="10" y="132" fontFamily="monospace" fontSize="6.5" fill="var(--ink-muted)">
                        {"96% VERIFIED · EXPORT: CSV / LINKEDIN / EMAIL"}
                      </text>
                    </svg>
                    <p className="mockup-caption">{"Leads table + export dashboard."}</p>
                  </div>
                  <div className="slot slot--draft">
                    <span className="slot__label">Sequence</span>
                    <ol>
                      <li>{"Mapped the lead data model and criteria."}</li>
                      <li>{"Built the agentic scrapers and verifiers."}</li>
                      <li>{"Layered the self-serve UI for filters/export."}</li>
                      <li>{"Iterated on data accuracy based on usage."}</li>
                    </ol>
                  </div>
                  <div className="slot slot--filled">
                    <span className="slot__label">Demo</span>
                    <div className="slot__hint">
                      <a href="https://leads-sourcing-tool-app.vercel.app/" target="_blank" rel="noopener noreferrer">
                        leads-sourcing-tool-app.vercel.app
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </PinFadeScene>

        <div className="editorial-wrap">
          {/* PROJECT 02 */}
          <ScrollReveal className="project-wrap">
            <article className="project">
              <div className="project__chrome">
                  <div>
                    <div className="project__id">PROJECT_02 · AXO_MVP.DB</div>
                    <h3 className="project__title">{"Healthtech MVP · PRD, EU Compliance & Launch"}</h3>
                    <div className="project__role">
                      {"Axo Longevity · Product Manager · Jun 2025 – Dec 2025"}
                    </div>
                  </div>
                  <span className="status-chip status-chip--shipped">Shipped</span>
                </div>
                <div className="project__body">
                  <ul>
                    <li>{"Authored the PRD that took the product from concept to MVP launch in 12 weeks."}</li>
                    <li>{"Built the medical and data privacy compliance framework covering Germany, Spain, Netherlands, and UK."}</li>
                    <li>{"Launched the waitlist + landing page from scratch, securing 500+ signups in month one with a 20% conversion rate."}</li>
                  </ul>
                  <div className="slots">
                    <div className="slot slot--draft">
                      <div className="slot__label">
                        <span>Preview</span>
                        <span className="slot__badge">Interactive</span>
                      </div>
                      <svg className="mockup-svg" viewBox="0 0 280 150" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="278" height="148" fill="var(--paper)" stroke="var(--rule)" />
                        <rect x="1" y="1" width="278" height="16" fill="var(--paper-deep)" stroke="var(--rule)" />
                        <circle cx="10" cy="9" r="2.2" fill="var(--rule-soft)" />
                        <circle cx="18" cy="9" r="2.2" fill="var(--rule-soft)" />
                        <circle cx="26" cy="9" r="2.2" fill="var(--rule-soft)" />
                        <text x="140" y="12" fontFamily="monospace" fontSize="7" fill="var(--ink-muted)" textAnchor="middle">
                          axolongevity.com
                        </text>
                        <text x="140" y="52" fontFamily="serif" fontSize="15" fill="var(--ink)" textAnchor="middle">
                          Live longer, deliberately.
                        </text>
                        <text x="140" y="66" fontFamily="monospace" fontSize="6.5" fill="var(--ink-muted)" textAnchor="middle">
                          Personalized longevity care — coming soon
                        </text>
                        <rect x="90" y="80" width="140" height="14" fill="none" stroke="var(--rule-soft)" />
                        <text x="98" y="90" fontFamily="monospace" fontSize="6.5" fill="var(--ink-muted)">
                          you@email.com
                        </text>
                        <rect x="90" y="98" width="140" height="14" fill="var(--gold)" opacity="0.35" stroke="var(--gold)" />
                        <text x="160" y="107" fontFamily="monospace" fontSize="6.5" fill="var(--ink)" textAnchor="middle">
                          Join the waitlist
                        </text>
                        <text x="140" y="130" fontFamily="monospace" fontSize="6.5" fill="var(--ink-muted)" textAnchor="middle">
                          500+ already joined
                        </text>
                      </svg>
                      <p className="mockup-caption">{"Landing waitlist interface."}</p>
                    </div>
                    <div className="slot slot--draft">
                      <span className="slot__label">Sequence</span>
                      <ol>
                        <li>{"Wrote PRD and aligned engineering/clinical goals."}</li>
                        <li>{"Mapped data compliance parameters for 4 EU markets."}</li>
                        <li>{"Designed and deployed the initial landing portal."}</li>
                        <li>{"Launched waitlist campaign and analyzed conversions."}</li>
                      </ol>
                    </div>
                    <div className="slot slot--filled">
                      <span className="slot__label">Site</span>
                      <div className="slot__hint">
                        <a href="https://www.axolongevity.com/" target="_blank" rel="noopener noreferrer">
                          axolongevity.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </ScrollReveal>

            {/* PROJECT 03 */}
            <ScrollReveal className="project-wrap">
              <article className="project">
                <div className="project__chrome">
                  <div>
                    <div className="project__id">PROJECT_03 · ARBOL_CRM.DB</div>
                    <h3 className="project__title">{"CRM & AI Voice/Chat Agents"}</h3>
                    <div className="project__role">
                      {"Arbol · Chief Executive Officer / Investor · Jan 2025 – Jun 2025"}
                    </div>
                  </div>
                  <span className="status-chip status-chip--closed">Concluded</span>
                </div>
                <div className="project__body">
                  <ul>
                    <li>{"Shipped a custom CRM using Lovable and Claude Code as the team's single system of record."}</li>
                    <li>{"Built voice and chat AI agents for inbound lead conversion across construction, real estate, and immigration law."}</li>
                    <li>{"Built and led a 6-person team spanning engineering and sales."}</li>
                  </ul>
                  <div className="slots">
                    <div className="slot slot--draft">
                      <div className="slot__label">
                        <span>Preview</span>
                        <span className="slot__badge">Interactive</span>
                      </div>
                      <svg className="mockup-svg" viewBox="0 0 280 150" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="278" height="148" fill="var(--paper)" stroke="var(--rule)" />
                        <rect x="1" y="1" width="278" height="16" fill="var(--paper-deep)" stroke="var(--rule)" />
                        <circle cx="10" cy="9" r="2.2" fill="var(--rule-soft)" />
                        <circle cx="18" cy="9" r="2.2" fill="var(--rule-soft)" />
                        <circle cx="26" cy="9" r="2.2" fill="var(--rule-soft)" />
                        <text x="140" y="12" fontFamily="monospace" fontSize="7" fill="var(--ink-muted)" textAnchor="middle">
                          crm.getarbol.com
                        </text>
                        <text x="10" y="30" fontFamily="monospace" fontSize="6.5" fill="var(--ink-muted)">
                          {"PIPELINE — 3 VERTICALS"}
                        </text>
                        <line x1="10" y1="36" x2="270" y2="36" stroke="var(--rule-soft)" />
                        <rect x="10" y="44" width="80" height="90" fill="none" stroke="var(--rule-soft)" />
                        <rect x="98" y="44" width="80" height="90" fill="none" stroke="var(--rule-soft)" />
                        <rect x="186" y="44" width="84" height="90" fill="none" stroke="var(--rule-soft)" />
                        <text x="50" y="55" fontFamily="monospace" fontSize="6" fill="var(--ink-muted)" textAnchor="middle">
                          NEW LEAD
                        </text>
                        <text x="138" y="55" fontFamily="monospace" fontSize="6" fill="var(--ink-muted)" textAnchor="middle">
                          QUALIFIED
                    </text>
                        <text x="228" y="55" fontFamily="monospace" fontSize="6" fill="var(--ink-muted)" textAnchor="middle">
                          CLOSED
                    </text>
                        <rect x="14" y="62" width="72" height="16" fill="var(--paper-deep)" stroke="var(--rule-soft)" />
                        <rect x="14" y="82" width="72" height="16" fill="var(--paper-deep)" stroke="var(--rule-soft)" />
                        <rect x="102" y="62" width="72" height="16" fill="var(--paper-deep)" stroke="var(--rule-soft)" />
                        <rect x="190" y="62" width="76" height="16" fill="var(--moss)" opacity="0.25" stroke="var(--moss)" />
                      </svg>
                      <p className="mockup-caption">{"CRM Pipeline system dashboard."}</p>
                    </div>
                    <div className="slot slot--draft">
                      <span className="slot__label">Sequence</span>
                      <ol>
                        <li>{"Scoped CRM and lead parameters from sales flows."}</li>
                        <li>{"Deployed CRM v1 to capture all client touchpoints."}</li>
                        <li>{"Built customized AI voice/chat conversion agents."}</li>
                        <li>{"Structured and trained the 6-person sales group."}</li>
                      </ol>
                    </div>
                    <div className="slot slot--filled">
                      <span className="slot__label">Site</span>
                      <div className="slot__hint">
                        <a href="https://www.getarbol.com/" target="_blank" rel="noopener noreferrer">
                          getarbol.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </ScrollReveal>

            {/* PROJECT 04 */}
            <ScrollReveal className="project-wrap">
              <article className="project">
                <div className="project__chrome">
                  <div>
                    <div className="project__id">PROJECT_04 · LIFEX_PIPELINE.DB</div>
                    <h3 className="project__title">Biotech LP &amp; Startup Lead Generation Pipeline</h3>
                    <div className="project__role">
                      {"LifeX Ventures · Lead Generator (Contract) · Sep 2024 – May 2025"}
                    </div>
                  </div>
                  <span className="status-chip status-chip--closed">Concluded</span>
                </div>
                <div className="project__body">
                  <ul>
                    <li>{"Secured 4 thesis-qualified meetings per week, with 2 leads per month converting into active diligence relationships."}</li>
                    <li>{"Automated qualification using Google Sheets + Gemini API to score companies against the firm's thesis."}</li>
                    <li>{"Automated outreach sequencing in n8n and Make.com, requiring zero data-licensing spend."}</li>
                  </ul>
                  <div className="slots">
                    <div className="slot slot--draft">
                      <div className="slot__label">
                        <span>Preview</span>
                        <span className="slot__badge">Interactive</span>
                      </div>
                      <svg className="mockup-svg" viewBox="0 0 280 150" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="278" height="148" fill="var(--paper)" stroke="var(--rule)" />
                        <rect x="1" y="1" width="278" height="16" fill="var(--paper-deep)" stroke="var(--rule)" />
                        <circle cx="10" cy="9" r="2.2" fill="var(--rule-soft)" />
                        <circle cx="18" cy="9" r="2.2" fill="var(--rule-soft)" />
                        <circle cx="26" cy="9" r="2.2" fill="var(--rule-soft)" />
                        <text x="140" y="12" fontFamily="monospace" fontSize="7" fill="var(--ink-muted)" textAnchor="middle">
                          Sheet — Biotech Thesis Qualifier
                        </text>
                        <line x1="1" y1="24" x2="279" y2="24" stroke="var(--rule-soft)" />
                        <line x1="1" y1="34" x2="279" y2="34" stroke="var(--rule-soft)" />
                        <line x1="1" y1="44" x2="279" y2="44" stroke="var(--rule-soft)" />
                        <line x1="1" y1="54" x2="279" y2="54" stroke="var(--rule-soft)" />
                        <line x1="1" y1="64" x2="279" y2="64" stroke="var(--rule-soft)" />
                        <line x1="70" y1="17" x2="70" y2="140" stroke="var(--rule-soft)" />
                        <line x1="160" y1="17" x2="160" y2="140" stroke="var(--rule-soft)" />
                        <line x1="220" y1="17" x2="220" y2="140" stroke="var(--rule-soft)" />
                        <text x="8" y="22" fontFamily="monospace" fontSize="6" fill="var(--ink-muted)">
                          COMPANY
                        </text>
                        <text x="78" y="22" fontFamily="monospace" fontSize="6" fill="var(--ink-muted)">
                          DESCRIPTION
                        </text>
                        <text x="168" y="22" fontFamily="monospace" fontSize="6" fill="var(--ink-muted)">
                          GEMINI FIT
                        </text>
                        <text x="228" y="22" fontFamily="monospace" fontSize="6" fill="var(--ink-muted)">
                          STATUS
                        </text>
                        <rect x="222" y="27" width="40" height="6" fill="var(--moss)" opacity="0.3" />
                        <rect x="222" y="37" width="40" height="6" fill="var(--gold)" opacity="0.35" />
                        <rect x="222" y="47" width="40" height="6" fill="var(--ash)" opacity="0.4" />
                        <rect x="222" y="57" width="40" height="6" fill="var(--moss)" opacity="0.3" />
                        <text x="8" y="132" fontFamily="monospace" fontSize="6" fill="var(--ink-muted)">
                          {"300–500 new profiles/week · auto-scored vs. thesis"}
                        </text>
                      </svg>
                      <p className="mockup-caption">{"Thesis scoring sheet pipeline."}</p>
                    </div>
                    <div className="slot slot--draft">
                      <span className="slot__label">Sequence</span>
                      <ol>
                        <li>{"Translated investment thesis into LLM criteria."}</li>
                        <li>{"Engineered scrapers over targeted biotech hubs."}</li>
                        <li>{"Integrated Gemini API into Sheets database."}</li>
                        <li>{"Automated outreach sequences via custom scenarios."}</li>
                      </ol>
                    </div>
                    <div className="slot slot--filled">
                      <span className="slot__label">Site</span>
                      <div className="slot__hint">
                        <a href="https://www.lifex.vc/" target="_blank" rel="noopener noreferrer">
                          lifex.vc
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </ScrollReveal>

          <section id="skills" className="skills-section">
            <ScrollReveal>
              <p className="section-eyebrow">Skills</p>
              <div className="db-box">
                <div className="db-table__wrap">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Tools &amp; Capabilities</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Product</td>
                        <td>{"PRD authorship · Roadmapping · 0→1 launch · Compliance workflow design · Figma"}</td>
                      </tr>
                      <tr>
                        <td>{"AI & Automation"}</td>
                        <td>{"LLM API integration (Gemini, Claude) · Agentic pipeline design · n8n · Make.com"}</td>
                      </tr>
                      <tr>
                        <td>Technical</td>
                        <td>{"TypeScript / Node.js / React / Next.js · Python / Django · SQL · GitHub"}</td>
                      </tr>
                      <tr>
                        <td>Analysis</td>
                        <td>{"Advanced Excel · KPI benchmarking · Pipeline/funnel analysis"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>
          </section>

          <ScrollReveal>
            <footer className="f-key-footer">
              <div className="f-key-footer__keys">
                <a className="f-key-footer__btn" href="#projects">
                  <span className="f-key-footer__key">P</span> Projects
                </a>
                <a className="f-key-footer__btn" href="mailto:samuelgiraldoconcha@gmail.com">
                  <span className="f-key-footer__key">C</span> Contact
                </a>
                <a className="f-key-footer__btn" href="https://www.linkedin.com/in/samuel-giraldo-concha/" target="_blank" rel="noopener noreferrer">
                  <span className="f-key-footer__key">L</span> LinkedIn
                </a>
              </div>
              <div className="f-key-footer__right">Bogotá, CO · Open to Product Manager roles</div>
            </footer>
          </ScrollReveal>
        </div>
      </main>
    </div>
  )
}
