import Link from "next/link"

/** The Samwise wordmark: Fraunces italic 400 with the small gold ✦ at its shoulder. */
export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="v2-brand">
      Samwise
      <svg className="v2-brand__star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0 Q13 11, 24 12 Q13 13, 12 24 Q11 13, 0 12 Q11 11, 12 0 Z" />
      </svg>
    </Link>
  )
}
