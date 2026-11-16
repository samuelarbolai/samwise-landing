/** Pieces shared by the Samwise for Mac pages (/mac and /mac/open). */

export const INSTALL = "curl -fsSL https://www.samwise.life/mac/install.sh | bash"

/** The page that shows how to open the app the first time. */
export const OPEN_HREF = "/mac/open"
/** Where every Download button leads: that page, which then starts the download by itself. */
export const DOWNLOAD_HREF = "/mac/open?dl=1"
/**
 * The disk image itself (always the current version), as that page asks for it. Without ?from=open
 * a browser is sent to the page first: see app/download/mac/route.ts.
 */
export const FILE_HREF = "/download/mac?from=open"

/** The house sparkle, same path as the landing page. */
export function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0 Q13 11, 24 12 Q13 13, 12 24 Q11 13, 0 12 Q11 11, 12 0 Z" />
    </svg>
  )
}

export function Arrow() {
  return (
    <svg className="ld-btn__arrow" width="13" height="9" viewBox="0 0 13 9" aria-hidden="true">
      <path d="M0 4.5h11M8 1l3.5 3.5L8 8" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  )
}
