import { NextResponse } from "next/server"
import { MAC_RELEASE } from "@/lib/mac/release"

// Answered per request: the redirect is built from the address that was asked for.
export const dynamic = "force-dynamic"

/** A link that always points at the current Samwise for Mac disk image. */
export function GET(req: Request) {
  return NextResponse.redirect(new URL(MAC_RELEASE.file, req.url), 302)
}
