"use client"

// The ask / offer — the user's verbatim copy (do NOT reword). Three beats:
// the autonomy ("your own price, pace and language" + the seven steps), the
// economics (50% / $25 of the $50/mo AI charge), and the honest caveat (the
// availability goal is "yet to be proven"). Reusable for the therapist-call.
//
// The seven steps named in the first paragraph are rendered separately by
// <SevenSteps/> in the collaboration section, so here the parenthetical is
// kept as the user wrote it but the heavy list lives there.
export function OfferCard() {
  return (
    <div className="t-offer">
      <p className="t-offer-line">
        We offer you to supply the sessions at your own price, pace and
        language, as long as you fulfill the steps (functional analysis of last
        relapse, desidentification, mapping of origin, identification of
        enablers, design of protection, identification of current belief
        system, design of action to new belief system).
      </p>

      <div className="t-offer-figure" aria-hidden="true">
        <span className="t-offer-share">50%</span>
        <span className="t-offer-share-note">of the AI revenue</span>
        <span className="t-offer-math">$25 / mo to you · $50 / mo charged</span>
      </div>

      <p className="t-offer-line">
        We offer you 50% of the revenue coming from the AI system. Which is 25
        USD per month, since we charge the AI agent at 50 USD monthly.
      </p>

      <p className="t-offer-caveat">
        We have the goal of increasing the availability of therapists thanks to
        efficiencies gained from Samwise, but this is yet to be proven.
      </p>
    </div>
  )
}
