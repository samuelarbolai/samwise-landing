import { NextResponse } from "next/server"
import { UnauthorizedError } from "./session"

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json()
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

/** Maps thrown errors to responses without leaking internals to the client. */
export function handleError(err: unknown) {
  if (err instanceof UnauthorizedError) return fail("Not signed in", 401)
  console.error("[v2 api]", err)
  return fail("Something went wrong", 500)
}
