/**
 * The Samwise for Mac build that samwise.life offers. The disk image is built by
 * .github/workflows/mac-app.yml on a GitHub Mac runner and copied into public/downloads.
 * To ship a new one: bump mac/VERSION, run that workflow, copy the new .dmg here and
 * update the three values below (see mac/README.md).
 */
export const MAC_RELEASE = {
  version: "1.0.1",
  file: "/downloads/Samwise-1.0.1.dmg",
  sha256: "80e30ec2ea7bf4f770b49b83fad7bc43d0d044a6dd4d499a7cac486f7c6ba4ac",
  sizeMb: "1.2",
  minMacOS: "13",
} as const

export const MAC_PAGE_URL = "https://www.samwise.life/mac"
