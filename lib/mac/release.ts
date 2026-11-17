/**
 * The Samwise for Mac build that samwise.life offers. The disk image is built by
 * .github/workflows/mac-app.yml on a GitHub Mac runner and copied into public/downloads.
 * To ship a new one: bump mac/VERSION, run that workflow, copy the new .dmg here and
 * update the three values below (see mac/README.md).
 */
export const MAC_RELEASE = {
  version: "1.0.4",
  file: "/downloads/Samwise-1.0.4.dmg",
  sha256: "92f02cbd3b58b106491e4bb9e6d862f0eeec6e593122be3d3cde5f85f2f94ba7",
  sizeMb: "1.2",
  minMacOS: "13",
} as const

export const MAC_PAGE_URL = "https://www.samwise.life/mac"
/** Where "Update available…" in the app leads (download_url in /api/mac/config). */
export const MAC_UPDATE_URL = "https://www.samwise.life/mac/update"
