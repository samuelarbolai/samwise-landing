import { listActiveAgentLanguages } from "@/lib/v2/queries"
import { ok, handleError } from "@/lib/v2/http"

// Public on purpose: the signup form needs it before a session exists, and it
// exposes only which languages have a live agent — no user data.
// `language_agents` is READ-ONLY for this app; nothing here writes to it.
export async function GET() {
  try {
    return ok({ languages: await listActiveAgentLanguages() })
  } catch (err) {
    return handleError(err)
  }
}
