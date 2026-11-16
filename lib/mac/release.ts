/**
 * The Samwise for Mac build that samwise.life offers. The disk image is built by
 * .github/workflows/mac-app.yml on a GitHub Mac runner and copied into public/downloads.
 * To ship a new one: bump mac/VERSION, run that workflow, copy the new .dmg here and
 * update the three values below (see mac/README.md).
 */
export const MAC_RELEASE = {
  version: "1.0.3",
  file: "/downloads/Samwise-1.0.3.dmg",
  sha256: "78c77b4cf70fefad5c243f4e590b8aa6bfe5ed7bc8698ef082303909a711292c",
  sizeMb: "1.2",
  minMacOS: "13",
} as const

export const MAC_PAGE_URL = "https://www.samwise.life/mac"
