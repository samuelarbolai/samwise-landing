import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google"
import type { Metadata } from "next"

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Samwise — held.",
  description: "If you are here, it is not by accident.",
}

const ink = "#e8dec8"
const inkSoft = "rgba(232, 222, 200, 0.62)"
const inkFaint = "rgba(232, 222, 200, 0.32)"
const gold = "#c9a96e"
const bg = "#0a0807"

const sectionStyle: React.CSSProperties = {
  minHeight: "92vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "10vh 28px",
  textAlign: "center",
}

const innerStyle: React.CSSProperties = {
  maxWidth: "560px",
  width: "100%",
}

const numberStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  color: gold,
  opacity: 0.78,
  marginBottom: "1.6rem",
}

const ornament = (
  <div
    aria-hidden
    style={{
      width: "1px",
      height: "64px",
      background: `linear-gradient(to bottom, transparent, ${inkFaint}, transparent)`,
      margin: "0 auto",
    }}
  />
)

const star = (
  <span
    aria-hidden
    style={{
      display: "inline-block",
      color: gold,
      opacity: 0.78,
      fontSize: "1rem",
      letterSpacing: "0.4em",
    }}
  >
    ✶
  </span>
)

export default function HeldPage() {
  return (
    <>
      <style>{`
        html, body { background: ${bg}; }
        @keyframes breathe-in {
          from { opacity: 0; transform: translateY(10px); filter: blur(2px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 0.9; }
        }
        .breathe {
          opacity: 0;
          animation: breathe-in 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .d-1 { animation-delay: 0.15s; }
        .d-2 { animation-delay: 1.2s; }
        .d-3 { animation-delay: 2.2s; }
        .glow { animation: glow 5s ease-in-out infinite; }
        .held-link {
          color: ${ink};
          text-decoration: none;
          border-bottom: 1px solid ${inkFaint};
          padding-bottom: 4px;
          transition: border-color 0.6s ease, color 0.6s ease;
        }
        .held-link:hover {
          border-color: ${gold};
          color: ${gold};
        }
        ::selection { background: ${gold}; color: ${bg}; }
      `}</style>

      <main
        className={serif.className}
        style={{
          background: bg,
          color: ink,
          minHeight: "100vh",
          fontWeight: 300,
          fontSize: "1.32rem",
          lineHeight: 1.7,
          letterSpacing: "0.005em",
        }}
      >
        {/* I. THE SUMMONS */}
        <section style={sectionStyle}>
          <div style={innerStyle}>
            <div className="breathe d-1 glow" style={{ marginBottom: "3rem" }}>
              {star}
            </div>
            <p
              className="breathe d-2"
              style={{
                fontSize: "1.9rem",
                fontStyle: "italic",
                lineHeight: 1.5,
                color: ink,
                margin: 0,
              }}
            >
              If you are here,
              <br />
              it is not by accident.
            </p>
            <p
              className={`breathe d-3 ${mono.className}`}
              style={{
                marginTop: "4rem",
                fontSize: "0.7rem",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: inkSoft,
              }}
            >
              Samwise
            </p>
          </div>
        </section>

        {ornament}

        {/* II. THE NAMING */}
        <section style={sectionStyle}>
          <div style={innerStyle}>
            <p style={numberStyle} className={mono.className}>
              i — the naming
            </p>
            <p style={{ margin: 0, fontSize: "1.45rem", lineHeight: 1.6 }}>
              There are things that stay with us in the dark.
            </p>
            <div style={{ height: "2.4rem" }} />
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                color: inkSoft,
                fontStyle: "italic",
                fontSize: "1.2rem",
                lineHeight: 2.1,
              }}
            >
              <li>The screen we cannot put down.</li>
              <li>The love we keep asking for.</li>
              <li>The hands we cannot stop using.</li>
              <li>The ones who wound us, and call us back.</li>
              <li>The hunger that does not name itself.</li>
            </ul>
            <div style={{ height: "3rem" }} />
            <p style={{ margin: 0, fontSize: "1.25rem", color: ink }}>
              We know them.
            </p>
          </div>
        </section>

        {ornament}

        {/* III. THE PROMISE */}
        <section style={sectionStyle}>
          <div style={innerStyle}>
            <p style={numberStyle} className={mono.className}>
              ii — the promise
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "2.2rem",
                fontStyle: "italic",
                lineHeight: 1.4,
                color: ink,
              }}
            >
              We will hold you.
            </p>
            <div style={{ height: "2.4rem" }} />
            <p
              style={{
                margin: 0,
                fontSize: "1.2rem",
                color: inkSoft,
                lineHeight: 2,
              }}
            >
              Not for an hour.
              <br />
              Not for a week.
              <br />
              Until you are clear.
            </p>
          </div>
        </section>

        {ornament}

        {/* IV. THE PATH — three rites */}
        <section style={{ ...sectionStyle, minHeight: "100vh" }}>
          <div style={{ ...innerStyle, maxWidth: "600px" }}>
            <p style={numberStyle} className={mono.className}>
              iii — the path
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "1.4rem",
                fontStyle: "italic",
                color: ink,
                marginBottom: "4rem",
              }}
            >
              How you come to begin.
            </p>

            {[
              {
                n: "i.",
                title: "The Listening",
                meta: "twenty minutes",
                body:
                  "We hear you. We see if this work is for you. If it is not, we will name where else you should go.",
              },
              {
                n: "ii.",
                title: "The Clarifying",
                meta: "ninety minutes",
                body:
                  "We map the exact shape of what holds you. We build, together, the first ritual and the agent that will walk it with you.",
              },
              {
                n: "iii.",
                title: "The Walking",
                meta: "the days that follow",
                body:
                  "Your ritual begins. We watch closely. We adjust. We do not leave.",
              },
            ].map((step) => (
              <div
                key={step.title}
                style={{
                  textAlign: "left",
                  paddingLeft: "32px",
                  borderLeft: `1px solid ${inkFaint}`,
                  marginBottom: "3.2rem",
                }}
              >
                <div
                  className={mono.className}
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: gold,
                    marginBottom: "0.6rem",
                  }}
                >
                  {step.n} &nbsp; {step.meta}
                </div>
                <div
                  style={{
                    fontSize: "1.55rem",
                    fontStyle: "italic",
                    color: ink,
                    marginBottom: "0.6rem",
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: "1.08rem",
                    color: inkSoft,
                    lineHeight: 1.75,
                  }}
                >
                  {step.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {ornament}

        {/* V. THE THRESHOLD — CTA */}
        <section style={sectionStyle}>
          <div style={innerStyle}>
            <p style={numberStyle} className={mono.className}>
              iv — the threshold
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "1.7rem",
                fontStyle: "italic",
                color: ink,
                lineHeight: 1.5,
                marginBottom: "3.5rem",
              }}
            >
              When you are ready,
              <br />
              begin here.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "2rem", alignItems: "center" }}>
              <a
                className="held-link"
                href="https://cal.com/samuel-giraldo-concha-yqvtot/fit-assessment"
                style={{ fontSize: "1.3rem", fontStyle: "italic" }}
              >
                The Listening
              </a>
              <div className={mono.className} style={{ fontSize: "0.7rem", color: inkFaint, letterSpacing: "0.2em" }}>
                start here, if this is your first time
              </div>

              <div style={{ height: "1rem" }} />

              <a
                className="held-link"
                href="https://cal.com/samuel-giraldo-concha-yqvtot/new-belief"
                style={{ fontSize: "1.15rem", fontStyle: "italic", color: inkSoft }}
              >
                The Clarifying
              </a>
              <div className={mono.className} style={{ fontSize: "0.7rem", color: inkFaint, letterSpacing: "0.2em" }}>
                only for those who have been heard
              </div>
            </div>
          </div>
        </section>

        {ornament}

        {/* VI. THE WITNESS */}
        <section style={sectionStyle}>
          <div style={innerStyle}>
            <p style={numberStyle} className={mono.className}>
              v — the witness
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "1.15rem",
                color: inkSoft,
                fontStyle: "italic",
                lineHeight: 1.7,
                marginBottom: "2.8rem",
              }}
            >
              This work is held in the counsel of
            </p>

            <div
              style={{
                width: "140px",
                height: "140px",
                margin: "0 auto",
                borderRadius: "50%",
                overflow: "hidden",
                border: `1px solid ${inkFaint}`,
                boxShadow: `0 0 60px ${gold}22`,
              }}
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dr%20Ana%20Maria%20Reyes-LsqC4giUs3mSHIIIHhTkzmEKLOMXiq.png"
                alt="Dr. Ana María Reyes Tirado"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "grayscale(0.2) sepia(0.18) brightness(0.95)",
                }}
              />
            </div>

            <p
              style={{
                margin: "2rem 0 0",
                fontSize: "1.3rem",
                fontStyle: "italic",
                color: ink,
              }}
            >
              Dr. Ana María Reyes Tirado
            </p>
            <p
              className={mono.className}
              style={{
                margin: "0.8rem 0 0",
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: inkSoft,
                lineHeight: 2,
              }}
            >
              Specialist in Neurofeedback · New Wind Academy
              <br />
              Clinical Director · Fundación Syncronía
            </p>
          </div>
        </section>

        {/* VIII. THE LAST WORD */}
        <section style={{ ...sectionStyle, minHeight: "70vh" }}>
          <div style={innerStyle}>
            <div className="glow" style={{ marginBottom: "2.4rem" }}>
              {star}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontStyle: "italic",
                color: ink,
              }}
            >
              Estamos aquí.
            </p>
            <p
              className={mono.className}
              style={{
                marginTop: "0.8rem",
                fontSize: "0.7rem",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: inkFaint,
              }}
            >
              we are here
            </p>
          </div>
        </section>

        <div style={{ height: "10vh" }} />
      </main>
    </>
  )
}
