import type { Metadata } from "next"
import { MAC_RELEASE } from "@/lib/mac/release"
import { CopyLine } from "../copy-line"
import { INSTALL, Star } from "../parts"
import "../../landing/landing.css"
import "../mac.css"

const TITLE = "Update Samwise for Mac"
const DESCRIPTION = "How to update Samwise for Mac to the newest version. Your connection and settings stay."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://samwise.life/mac/update" },
  robots: { index: false },
}

/**
 * Where "Update available…" in the app's menu leads (download_url in /api/mac/config).
 * The app cannot replace itself, so this page says how, in the fewest steps.
 * The install script keeps the connection: the token lives in Application Support, not in the app.
 * Only the Terminal way is offered: with "Keep Samwise running" on (the default) the app has no Quit
 * and reopens when closed, so dragging a new copy over it from a download does not work cleanly.
 */
export default function MacUpdatePage() {
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
            <a href="/mac">Samwise for Mac</a>
          </div>
        </nav>
      </header>

      <main>
        <section className="mac-open-hero">
          <div className="ld-wrap">
            <div className="mac-open-hero__text">
              <p className="mac-eyebrow">Samwise for Mac · Beta</p>
              <h1 className="ld-h1">Update to Samwise for Mac {r.version}.</h1>
              <p className="ld-lead mac-open-lead">
                One line in Terminal, about half a minute. Your connection, your check-in times and your settings stay
                as they are.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="how-h" className="ld-section ld-section--paper">
          <div className="ld-wrap">
            <h2 id="how-h" className="ld-h2">
              How to update
            </h2>
            <div className="mac-install">
              <div className="mac-way">
                <p className="mac-way__p">
                  Open <b>Terminal</b> (in Applications, then Utilities), paste this line and press Return.
                </p>
                <CopyLine text={INSTALL} />
                <p className="mac-way__p">
                  It closes the Samwise you have, puts {r.version} in its place and opens it. The star comes back in
                  your menu bar, and “Update available” is gone from its menu.
                </p>
                <p className="ld-micro">
                  macOS asks nothing this way. It is the same beta as before, so the same goes: only if you trust
                  Samwise. You can{" "}
                  <a className="mac-link" href="/mac/install.sh">
                    read the script
                  </a>{" "}
                  first.
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
