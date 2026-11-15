#!/usr/bin/env node
// Drive one page of a running samwise-landing like a user and save evidence.
// Usage: node drive-page.mjs <url> <evidence-dir> '<steps-json>'
// Steps (run in order): {"fill":"#name","value":"Ana"}  {"select":"select[aria-label=Country]","value":"US"}
//   {"click":"button[type=submit]"}  {"waitText":"Enter a valid phone number"}  {"shot":"after-submit"}
//   {"expectRequest":"/api/v2/phone-code"}  (asserts the page called that path; status is logged)
// Writes: NN-<name>.png (before/after each step), network.json (every /api/ call with status + body),
// console.json, result.json ({ok, failedStep, error}). Exit code 1 when a step fails.
import { createRequire } from "node:module"
// Plain require resolves the machine's preinstalled Playwright (NODE_PATH); ESM import does not.
const { chromium } = createRequire(import.meta.url)("playwright")
import fs from "node:fs"
import path from "node:path"

const [url, outDir, stepsJson = "[]"] = process.argv.slice(2)
if (!url || !outDir) { console.error("usage: drive-page.mjs <url> <evidence-dir> '<steps-json>'"); process.exit(2) }
const steps = JSON.parse(stepsJson)
fs.mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 }) // phone first: users arrive from WhatsApp
const network = [], consoleLog = []
page.on("console", (m) => consoleLog.push({ type: m.type(), text: m.text() }))
page.on("response", async (r) => {
  if (!r.url().includes("/api/")) return
  let body = null
  try { body = await r.text() } catch {}
  network.push({ method: r.request().method(), url: r.url(), status: r.status(), request: r.request().postData(), body })
})
let n = 0
const shot = (name) => page.screenshot({ path: path.join(outDir, `${String(++n).padStart(2, "0")}-${name}.png`), fullPage: true })
const result = { url, ok: true, failedStep: null, error: null, at: new Date().toISOString() }
try {
  await page.goto(url, { waitUntil: "networkidle" })
  await shot("loaded")
  for (const [i, s] of steps.entries()) {
    try {
      if (s.fill) await page.fill(s.fill, s.value)
      else if (s.select) await page.selectOption(s.select, s.value)
      else if (s.click) await page.click(s.click)
      else if (s.waitText) await page.getByText(s.waitText).first().waitFor({ timeout: 15000 })
      else if (s.expectRequest) {
        await page.waitForTimeout(500)
        if (!network.some((x) => x.url.includes(s.expectRequest))) throw new Error(`no request to ${s.expectRequest}`)
      }
      if (s.shot || s.click || s.waitText) { await page.waitForTimeout(300); await shot(s.shot ?? `step${i + 1}`) }
    } catch (e) { result.ok = false; result.failedStep = { index: i, step: s }; result.error = String(e.message ?? e); await shot("FAILED"); break }
  }
} catch (e) { result.ok = false; result.error = String(e.message ?? e) }
fs.writeFileSync(path.join(outDir, "network.json"), JSON.stringify(network, null, 2))
fs.writeFileSync(path.join(outDir, "console.json"), JSON.stringify(consoleLog, null, 2))
fs.writeFileSync(path.join(outDir, "result.json"), JSON.stringify(result, null, 2))
await browser.close()
console.log(JSON.stringify(result))
process.exit(result.ok ? 0 : 1)
