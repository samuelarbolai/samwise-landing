import type { Metadata } from "next"
import { headers } from "next/headers"
import { MAC_RELEASE } from "@/lib/mac/release"
import { CopyLine } from "../copy-line"
import { FILE_HREF, INSTALL, Star } from "../parts"
import { DownloadLine } from "./download-line"
import "../../landing/landing.css"
import "../mac.css"

const TITLE = "Open Samwise for Mac the first time"
const DESCRIPTION =
  "Samwise for Mac is a beta that Apple has not checked yet, so your Mac stops it the first time. How to allow it, step by step, and what you are trusting when you do."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://samwise.life/mac/open" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "https://samwise.life/mac/open", siteName: "Samwise", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

/**
 * The pictures were taken on a real Mac by mac/scripts/first-open.sh (workflow "Mac first open"),
 * which walks these same steps. They are shown at the size they were taken, never stretched.
 * `ring` marks the button to click, in percent of the picture: left, top, width, height.
 */
type Shot = { src: string; w: number; h: number; alt: string; kind: "window" | "crop"; ring?: [number, number, number, number] }

const SHOT_DISK_IMAGE: Shot = {
  src: "/mac/open-disk-image.png",
  w: 352,
  h: 136,
  alt: "The window of the disk image, named Samwise: the Applications folder on the left and Samwise on the right.",
  kind: "crop",
}
const SHOT_NOT_OPENED: Shot = {
  src: "/mac/open-not-opened.png",
  w: 260,
  h: 268,
  alt: "The macOS dialog: “Samwise” Not Opened. Apple could not verify “Samwise” is free of malware that may harm your Mac or compromise your privacy. Two buttons: Move to Trash and Done.",
  kind: "window",
  ring: [4.6, 82.8, 90.8, 12.3],
}
const SHOT_SETTINGS: Shot = {
  src: "/mac/open-anyway.png",
  w: 475,
  h: 182,
  alt: "System Settings, Privacy & Security, under the heading Security: “Samwise” was blocked to protect your Mac, with an Open Anyway button on the right.",
  kind: "crop",
  ring: [73.3, 46.7, 24.6, 18.7],
}
const SHOT_QUESTION: Shot = {
  src: "/mac/open-question.png",
  w: 260,
  h: 350,
  alt: "The macOS dialog: Open “Samwise”? Apple is not able to verify that it is free from malware that could harm your Mac or compromise your privacy. Don’t open this unless you are certain it is from a trustworthy source. Three buttons: Move to Trash, Open Anyway and Done.",
  kind: "window",
  ring: [4.6, 76.9, 90.8, 9.7],
}

function Picture({ shot, caption }: { shot: Shot; caption: string }) {
  return (
    <figure className={`mac-shot mac-shot--${shot.kind}`}>
      <div className="mac-shot__frame" style={{ width: shot.w }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} loading="lazy" />
        {shot.ring ? (
          <span
            className="mac-ring"
            aria-hidden="true"
            style={{ left: `${shot.ring[0]}%`, top: `${shot.ring[1]}%`, width: `${shot.ring[2]}%`, height: `${shot.ring[3]}%` }}
          />
        ) : null}
      </div>
      <figcaption className="ld-caption">{caption}</figcaption>
    </figure>
  )
}

export default async function MacOpenPage({ searchParams }: { searchParams: Promise<{ dl?: string | string[] }> }) {
  // A Download button brought the person here: on a Mac the download starts by itself (see DownloadLine).
  // On a phone or a PC the file is of no use, so nothing starts and the page says to open it on the Mac.
  // (An iPad that asks for desktop pages calls itself a Mac, and is treated as one.)
  const onMac = /Macintosh/.test((await headers()).get("user-agent") ?? "")
  const auto = onMac && (await searchParams).dl !== undefined
  const r = MAC_RELEASE
  const file = r.file.split("/").pop() ?? "Samwise.dmg"

  return (
    <div className="ld-root mac-root">
      <header className="ld-top">
        <nav aria-label="Main" className="ld-wrap ld-nav">
          <a className="ld-brand" href="/">
            Samwise
            <Star className="ld-brand__star" />
          </a>
          <div className="ld-nav__links">
            <a href="/mac">Samwise for Mac</a>
            <a href="#steps">The steps</a>
            <a href="#trust">What you are trusting</a>
          </div>
        </nav>
      </header>

      <main>
        <section className="mac-open-hero">
          <div className="ld-wrap">
            <div className="mac-open-hero__text">
              <p className="mac-eyebrow">Samwise for Mac · Beta</p>
              <h1 className="ld-h1">Your Mac will stop Samwise the first time.</h1>
              <p className="ld-lead mac-open-lead">
                Samwise for Mac is a beta. Apple has not checked it yet, so macOS will not open it until you allow it,
                once, by hand. <b>Only do that if you trust Samwise.</b> It takes four steps and about a minute.
              </p>
              <DownloadLine auto={auto} onMac={onMac} href={FILE_HREF} file={file} size={r.sizeMb} />
            </div>
          </div>
        </section>

        <section id="steps" aria-labelledby="steps-h" className="ld-section ld-section--paper">
          <div className="ld-wrap">
            <h2 id="steps-h" className="ld-h2">
              How to open it
            </h2>
            <ol className="mac-open-list">
              <li className="mac-open-step">
                <div className="mac-open-step__text">
                  <span className="mac-open-step__n" aria-hidden="true">
                    1
                  </span>
                  <h3 className="ld-h3">Put Samwise in Applications.</h3>
                  <p>
                    Open the file you downloaded, <b>{file}</b>. In the window that opens, drag Samwise onto the
                    Applications folder next to it.
                  </p>
                </div>
                <Picture shot={SHOT_DISK_IMAGE} caption="The window that opens. Drag Samwise onto Applications." />
              </li>

              <li className="mac-open-step">
                <div className="mac-open-step__text">
                  <span className="mac-open-step__n" aria-hidden="true">
                    2
                  </span>
                  <h3 className="ld-h3">Open Samwise. macOS refuses.</h3>
                  <p>
                    Open Samwise from Applications. macOS says <b>“Samwise” Not Opened</b>, because Apple could not
                    verify it. Click <b>Done</b>.
                  </p>
                  <p>The blue button, Move to Trash, deletes Samwise. That is the one to click if you do not trust it.</p>
                </div>
                <Picture shot={SHOT_NOT_OPENED} caption="What macOS shows. Click Done." />
              </li>

              <li className="mac-open-step">
                <div className="mac-open-step__text">
                  <span className="mac-open-step__n" aria-hidden="true">
                    3
                  </span>
                  <h3 className="ld-h3">Find Open Anyway.</h3>
                  <p>
                    Open <b>System Settings</b>, then <b>Privacy &amp; Security</b>, and scroll down to <b>Security</b>.
                    Under “Samwise” was blocked to protect your Mac, click <b>Open Anyway</b>.
                  </p>
                  <p className="ld-micro">
                    The button stays for about an hour after step 2. If it is gone, open Samwise again, click Done, and
                    come back.
                  </p>
                </div>
                <Picture shot={SHOT_SETTINGS} caption="System Settings, Privacy & Security, at the bottom." />
              </li>

              <li className="mac-open-step">
                <div className="mac-open-step__text">
                  <span className="mac-open-step__n" aria-hidden="true">
                    4
                  </span>
                  <h3 className="ld-h3">Say yes once more.</h3>
                  <p>
                    macOS asks one last time: <b>Open “Samwise”?</b> Click <b>Open Anyway</b>, the middle button. The
                    blue one is Move to Trash again.
                  </p>
                  <p>
                    Then macOS asks for your Mac’s password, or Touch ID, because allowing an app Apple has not checked
                    takes an administrator.
                  </p>
                  <p>
                    Samwise opens with a short welcome. Press <b>Test the alarm now</b> to see it once. From now on it
                    opens like any other app.
                  </p>
                </div>
                <Picture shot={SHOT_QUESTION} caption="The last question. Click Open Anyway, in the middle." />
              </li>
            </ol>
          </div>
        </section>

        <section id="trust" aria-labelledby="trust-h" className="ld-section">
          <div className="ld-wrap">
            <h2 id="trust-h" className="ld-h2 ld-h2--narrow">
              What you are trusting
            </h2>
            <div className="mac-trust">
              <div>
                <h3 className="ld-h3">Why macOS stops it</h3>
                <p>
                  Apple checks an app when its maker signs it with an Apple developer certificate and sends it in.
                  Samwise for Mac is a beta and has not been through that yet. So the warning is true: Apple could not
                  verify it.
                </p>
              </div>
              <div>
                <h3 className="ld-h3">What allowing it means</h3>
                <p>
                  You are trusting that this file comes from Samwise and does what we say: it shows your check-in
                  alarm, starts when you log in, and keeps an open Mac awake before a check-in. Without an account it
                  sends nothing. With one it talks only to samwise.life.
                </p>
              </div>
              <div>
                <h3 className="ld-h3">If you are not sure</h3>
                <p>
                  Then do not open it. Click Move to Trash. Your daily check-in and the call from Samwise work the same
                  without the Mac app.
                </p>
              </div>
            </div>
            <p className="mac-sum">
              To check the file you downloaded: SHA-256 of {file} is <code>{r.sha256}</code>
            </p>
          </div>
        </section>

        <section aria-labelledby="terminal-h" className="ld-section ld-section--paper">
          <div className="ld-wrap">
            <h2 id="terminal-h" className="ld-h2">
              Or one line in Terminal
            </h2>
            <div className="mac-install">
              <div className="mac-way">
                <p className="mac-way__p">
                  Open Terminal, paste this line and press Return. It downloads the same file, copies Samwise to
                  Applications and opens it.
                </p>
                <CopyLine text={INSTALL} />
                <p className="ld-micro">
                  macOS shows no warning this way, because it only checks what a browser downloads. It is the same beta,
                  so the same goes: only if you trust Samwise. You can{" "}
                  <a className="mac-link" href="/mac/install.sh">
                    read the script
                  </a>{" "}
                  first.
                </p>
              </div>
              <div className="mac-way">
                <h3 className="ld-h3">On macOS 14 or older</h3>
                <p className="mac-way__p">
                  The first dialog is different there. Right-click Samwise in Applications, choose <b>Open</b>, then
                  click <b>Open</b> again.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="ld-foot">
        <div className="ld-wrap ld-foot__row">
          <span>
            Samwise ·{" "}
            <a className="ld-foot__link" href="/mac">
              Samwise for Mac
            </a>
          </span>
          <span>Samwise for Mac {r.version}, beta. Samwise is an independent tool.</span>
        </div>
      </footer>
    </div>
  )
}
