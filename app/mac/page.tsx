import type { Metadata } from "next"
import { MAC_RELEASE } from "@/lib/mac/release"
import type { ReactNode } from "react"
import { CopyLine } from "./copy-line"
import { Arrow, DOWNLOAD_HREF, INSTALL, OPEN_HREF, Star } from "./parts"
import "../landing/landing.css"
import "./mac.css"

const TITLE = "Samwise for Mac: a check-in alarm you cannot miss"
const DESCRIPTION =
  "One minute before your check-in, Samwise takes over every screen of your Mac and rings. To get your screen back, you type one line."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://samwise.life/mac" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "https://samwise.life/mac", siteName: "Samwise", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

const STEPS = [
  {
    title: "Five minutes before.",
    body: "A small countdown appears at the top of your screen. Time to wrap up.",
  },
  {
    title: "One minute before.",
    body: "Every screen is taken over, on top of full-screen apps, with a chime. At check-in time it rings, and the ring grows louder if nobody answers.",
  },
  {
    title: "You type one line.",
    body: "That gives your screen back. Fifteen minutes later it asks if you finished, and takes the screen again if there is no answer.",
  },
]

const CHARGE = [
  {
    label: "Snooze",
    body: "Five minutes, twice. The count is there so the check-in cannot be pushed away all afternoon. You can change both numbers in Settings.",
  },
  {
    label: "Skip",
    body: "Type “I choose to skip this check-in” and your screen is yours again. Always possible.",
  },
  {
    label: "Pause or turn off",
    body: "Pause the alarms until tomorrow or for a few days from the star in your menu bar. In Settings you can turn Samwise off for good.",
  },
]

const QUESTIONS: { q: string; a: ReactNode }[] = [
  {
    q: "Do I need a Samwise account?",
    a: "No. Without one it rings at 16:00 on your Mac’s clock, and you can set other times. Connected to your account, it follows your real check-in times.",
  },
  {
    q: "What does it send to Samwise?",
    a: "Nothing until you connect an account. After that: what the alarm did (shown, snoozed, skipped, done) and the name and macOS version of this Mac, so Samwise can tell when an alarm failed to show. Never what you type, read or have open.",
  },
  {
    q: "Can other people see it on my screen?",
    a: "Your own words stay hidden until you press Tab. Samwise also asks macOS to keep the alarm out of screenshots and screen recordings.",
  },
  {
    q: "What if my Mac is asleep?",
    a: "A sleeping Mac or a closed lid cannot ring. So from 30 minutes before a check-in, Samwise keeps an open Mac from falling asleep on its own. You can turn that off in Settings. If the Mac was asleep anyway, open it within four hours of the check-in and the alarm comes up then. Your check-in call from Samwise does not depend on your Mac.",
  },
  {
    q: "Why does macOS say it could not verify Samwise?",
    a: (
      <>
        Because that is true. Samwise for Mac is a beta and is not signed with an Apple developer certificate yet,
        so Apple has not checked it, and macOS will not open it until you allow it once in System Settings. Only do
        that if you trust Samwise.{" "}
        <a className="mac-link" href={OPEN_HREF}>
          The steps, with pictures
        </a>
        .
      </>
    ),
  },
  {
    q: "How do I remove it?",
    a: "Open Settings from the star in your menu bar and choose “Turn off and remove from this Mac”. Then drag Samwise from Applications to the Trash.",
  },
]

export default function MacPage() {
  const r = MAC_RELEASE

  return (
    <div className="ld-root mac-root">
      <header className="ld-top">
        <nav aria-label="Main" className="ld-wrap ld-nav">
          <a className="ld-brand" href="/">
            Samwise
            <Star className="ld-brand__star" />
          </a>
          <div className="ld-nav__links">
            <a href="#how">How it works</a>
            <a href="#install">Install</a>
            <a href="#faq">Questions</a>
            <a className="ld-btn ld-btn--small" href={DOWNLOAD_HREF}>
              Download
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section id="top" className="ld-hero">
          <div className="ld-wrap ld-hero__grid">
            <div className="ld-hero__text">
              <p className="mac-eyebrow">Samwise for Mac · Beta</p>
              <h1 className="ld-h1">A check-in alarm you cannot miss.</h1>
              <p className="ld-lead mac-lead">
                One minute before your check-in, Samwise takes over every screen of your Mac and rings. To get your
                screen back, you type one line.
              </p>
              <p className="mac-line" aria-label="The line you type">
                I am doing my check-in now
              </p>
              <div className="ld-cta">
                <a className="ld-btn" href={DOWNLOAD_HREF}>
                  Download for Mac <Arrow />
                </a>
                <p className="ld-micro">
                  Free, in beta. Version {r.version}, {r.sizeMb} MB. macOS {r.minMacOS} or newer, Apple silicon and
                  Intel.
                </p>
                <p className="mac-beta">
                  Apple has not checked this beta yet, so your Mac stops it the first time and you allow it once, by
                  hand. Only do that if you trust Samwise.{" "}
                  <a className="mac-link" href={OPEN_HREF}>
                    See the steps
                  </a>
                </p>
              </div>
            </div>

            <figure className="ld-visual">
              <div className="mac-screen">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mac/alarm.png" alt="The alarm covering the whole screen: “It’s time for your check-in.” with the line to type underneath." width={1024} height={768} />
              </div>
              <figcaption className="ld-caption">The alarm at check-in time, on a Mac without an account.</figcaption>
            </figure>
          </div>
        </section>

        <section id="how" aria-labelledby="how-h" className="ld-section mac-section--tight">
          <div className="ld-wrap">
            <h2 id="how-h" className="ld-h2">
              How it works
            </h2>
            <ol className="ld-steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className="ld-step">
                  <span className="ld-step__n" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="ld-h3">{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="charge-h" className="ld-section ld-section--paper">
          <div className="ld-wrap">
            <h2 id="charge-h" className="ld-h2 ld-h2--narrow">
              Insistent because you asked. You stay in charge.
            </h2>
            <ol className="ld-net">
              {CHARGE.map((c, i) => (
                <li key={c.label} className={i === CHARGE.length - 1 ? "ld-net__item ld-net__item--last" : "ld-net__item"}>
                  <span className="ld-net__label">{c.label}</span>
                  <p>{c.body}</p>
                </li>
              ))}
            </ol>
            <p className="mac-note">
              A reminder is easy to swipe away. This alarm waits for a decision, and every decision is yours: the alarm
              always says why your screen is taken and how to get it back.
            </p>
          </div>
        </section>

        <section id="install" aria-labelledby="install-h" className="ld-section">
          <div className="ld-wrap">
            <h2 id="install-h" className="ld-h2">
              Install
            </h2>
            <div className="mac-install">
              <div className="mac-way">
                <h3 className="ld-h3">Download and open</h3>
                <p className="mac-way__p">
                  Samwise for Mac is a beta that Apple has not checked yet, so macOS stops it the first time and you
                  allow it once. Only do that if you trust Samwise.
                </p>
                <ol className="mac-steps">
                  <li>
                    <a className="mac-link" href={DOWNLOAD_HREF}>
                      Download Samwise for Mac
                    </a>
                    , open the file, and drag Samwise to Applications.
                  </li>
                  <li>
                    Open Samwise from Applications. macOS says <b>“Samwise” Not Opened</b>. Click <b>Done</b>.
                  </li>
                  <li>
                    Open <b>System Settings</b>, then <b>Privacy &amp; Security</b>. Scroll down to Security and click{" "}
                    <b>Open Anyway</b> next to Samwise.
                  </li>
                  <li>
                    Click <b>Open Anyway</b> once more and confirm with your password or Touch ID. Samwise opens with a
                    short welcome. Press <b>Test the alarm now</b> to see it once.
                  </li>
                </ol>
                <p className="ld-micro">
                  <a className="mac-link" href={OPEN_HREF}>
                    See each step with a picture
                  </a>
                  . On macOS 14 or older: right-click Samwise in Applications, choose Open, then Open again.
                </p>
              </div>

              <div className="mac-way">
                <h3 className="ld-h3">Or one line in Terminal</h3>
                <p className="mac-way__p">
                  Open Terminal, paste this line and press Return. It downloads the same file, copies Samwise to
                  Applications and opens it.
                </p>
                <CopyLine text={INSTALL} />
                <p className="ld-micro">
                  It asks for no password and installs nothing else. macOS shows no warning this way, because it only
                  checks what a browser downloads. It is the same beta, so the same goes: only if you trust Samwise.
                  You can{" "}
                  <a className="mac-link" href="/mac/install.sh">
                    read the script
                  </a>{" "}
                  first.
                </p>
              </div>
            </div>

            <p className="mac-after">
              After the first open, macOS shows a “Background Items Added” notice. That is Samwise asking to start when
              you log in and to reopen if it closes, because an alarm that quits by accident is an alarm you miss. You
              can turn that off in Settings.
            </p>
            <p className="mac-sum">
              SHA-256 of {r.file.split("/").pop()}: <code>{r.sha256}</code>
            </p>
          </div>
        </section>

        <section aria-labelledby="connect-h" className="ld-section ld-section--paper">
          <div className="ld-wrap ld-yours">
            <h2 id="connect-h" className="ld-h2">
              Better with your Samwise account
            </h2>
            <ul className="ld-yours__list">
              <li>
                <Star className="ld-yours__star" />
                <span>It follows your real check-in times, and changes when you change them.</span>
              </li>
              <li>
                <Star className="ld-yours__star" />
                <span>
                  It tells you when Samwise is calling your phone, when a call was missed or did not count, and when
                  Samwise would call your trusted people.
                </span>
              </li>
              <li>
                <Star className="ld-yours__star" />
                <span>It stops by itself when your check-in is done.</span>
              </li>
              <li>
                <Star className="ld-yours__star" />
                <span>It shows your own opening words, opens your journal, and lists what you planned for after.</span>
              </li>
              <li className="mac-connect-how">
                <span>
                  To connect: open Settings from the star in your menu bar, choose Connect to Samwise, and enter the
                  code Samwise sends to your WhatsApp.
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section id="faq" aria-labelledby="faq-h" className="ld-section">
          <div className="ld-wrap">
            <h2 id="faq-h" className="ld-h2">
              Questions
            </h2>
            <dl className="ld-faq">
              {QUESTIONS.map((f) => (
                <div key={f.q}>
                  <dt>{f.q}</dt>
                  <dd>{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="close-h" className="ld-close-wrap">
          <div className="ld-wrap">
            <div className="ld-close">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ld-close__art" src="/samwise-night.png" alt="" width={120} height={120} />
              <h2 id="close-h" className="ld-h2">
                The part of the day you chose to protect.
              </h2>
              <a className="ld-btn" href={DOWNLOAD_HREF}>
                Download for Mac <Arrow />
              </a>
              <p className="ld-micro">
                New to Samwise?{" "}
                <a className="mac-link" href="/">
                  See how the daily check-in works
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="ld-foot">
        <div className="ld-wrap ld-foot__row">
          <span>
            Samwise ·{" "}
            <a className="ld-foot__link" href="/">
              samwise.life
            </a>
          </span>
          <span>Samwise for Mac {r.version}. Samwise is an independent tool.</span>
        </div>
      </footer>
    </div>
  )
}
