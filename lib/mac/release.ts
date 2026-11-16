/**
 * The Samwise for Mac build that samwise.life offers. The disk image is built by
 * .github/workflows/mac-app.yml on a GitHub Mac runner and copied into public/downloads.
 * To ship a new one: bump mac/VERSION, run that workflow, copy the new .dmg here and
 * update the three values below (see mac/README.md).
 */
export const MAC_RELEASE = {
  version: "1.0.2",
  file: "/downloads/Samwise-1.0.2.dmg",
  sha256: "22436bfcaadb0b590fdfd48d8d8cc0aedb71a960ff65c6e03f31aa78e36ec814",
  sizeMb: "1.2",
  minMacOS: "13",
} as const

export const MAC_PAGE_URL = "https://www.samwise.life/mac"
