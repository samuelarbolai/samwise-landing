"use client"

import { useEffect } from "react"

/**
 * The line under the headline of /mac/open.
 *
 * Every Download button on the site leads to /mac/open?dl=1. On a Mac the page is then rendered
 * with `auto`, this line says the download has started, and half a second later it starts: the
 * browser saves the disk image and stays on this page, where the steps for opening it are.
 * Opened any other way, the line offers the download instead. On a phone or a PC (`onMac` false)
 * nothing starts by itself, because the file is of no use there: the line says to open the page on
 * the Mac.
 */
export function DownloadLine({
  auto,
  onMac,
  href,
  file,
  size,
}: {
  auto: boolean
  onMac: boolean
  href: string
  file: string
  size: string
}) {
  useEffect(() => {
    if (!auto) return
    const timer = window.setTimeout(() => {
      // Drop ?dl=1 first, so that a reload or the Back button does not download a second copy.
      window.history.replaceState(null, "", window.location.pathname + window.location.hash)
      window.location.assign(href)
    }, 500)
    return () => window.clearTimeout(timer)
  }, [auto, href])

  if (auto) {
    return (
      <p className="mac-dl mac-dl--on" role="status">
        <span>
          <span className="mac-dl__on">Your download has started.</span> {file}, {size} MB.
        </span>
        <a className="mac-link" href={href}>
          Nothing happened? Download it here
        </a>
      </p>
    )
  }
  if (!onMac) {
    return (
      <p className="mac-dl mac-dl--on" role="status">
        <span>
          <span className="mac-dl__on">This download is for a Mac.</span> Open samwise.life/mac on your Mac to get it.
        </span>
        <a className="mac-link" href={href}>
          Download {file} here anyway
        </a>
      </p>
    )
  }
  return (
    <p className="mac-dl">
      <a className="ld-btn" href={href}>
        Download Samwise for Mac
      </a>
      <span className="ld-micro">
        {file}, {size} MB
      </span>
    </p>
  )
}
