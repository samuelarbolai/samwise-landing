import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const COOKIE = "samwise_v2_session"
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error("SESSION_SECRET is not set")
  return new TextEncoder().encode(s)
}

export async function createSession(userId: number): Promise<void> {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())

  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE)
}

/** Returns the authenticated user id, or null. Every data query is scoped to this. */
export async function getSessionUserId(): Promise<number | null> {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    const uid = payload.uid
    return typeof uid === "number" ? uid : null
  } catch {
    return null
  }
}

export async function requireSessionUserId(): Promise<number> {
  const uid = await getSessionUserId()
  if (uid === null) throw new UnauthorizedError()
  return uid
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized")
    this.name = "UnauthorizedError"
  }
}
