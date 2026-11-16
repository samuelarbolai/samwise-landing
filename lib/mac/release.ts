/**
 * The Samwise for Mac build that samwise.life offers. The disk image is built by
 * .github/workflows/mac-app.yml on a GitHub Mac runner and copied into public/downloads.
 * To ship a new one: bump mac/VERSION, run that workflow, copy the new .dmg here and
 * update the three values below (see mac/README.md).
 */
export const MAC_RELEASE = {
  version: "1.0.0",
  file: "/downloads/Samwise-1.0.0.dmg",
  sha256: "e9e82a527d263fb56db21cc50c1bbe073b9747a96c22c874c92c58648cbde8b0",
  sizeMb: "1.2",
  minMacOS: "13",
} as const

export const MAC_PAGE_URL = "https://www.samwise.life/mac"
