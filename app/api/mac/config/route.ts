import { handleError } from "@/lib/v2/http"
import { appVersionFromRequest, deviceFromRequest, json, loadConfig, refuse } from "@/lib/mac/server"

export const dynamic = "force-dynamic"

/** What a connected Mac needs to know right now: check-in times, today's state, own words, open tasks. */
export async function GET(req: Request) {
  try {
    const device = await deviceFromRequest(req)
    if (!device) return refuse("This Mac is not connected", 401)
    const config = await loadConfig(device, appVersionFromRequest(req))
    if (!config) return refuse("This Mac is not connected", 401)
    return json(config)
  } catch (err) {
    return handleError(err)
  }
}
