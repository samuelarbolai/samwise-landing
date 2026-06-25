"use client"

// The partnership ask — three blocks (build / ask / yet-to-be-proven), no money
// in the card. Organizer-audience register: a peer making a clear, modest
// proposal. Honest caveat preserved — this Charedi-couples adaptation has not
// run yet.
export function OfferCard() {
  return (
    <div className="l-offer">
      <div className="l-offer-block">
        <p className="l-offer-block-head">What we'd build for Lekatchila</p>
        <p className="l-offer-line">
          A Samwise variant tuned to your model — your madrichim's voice, your
          alignment-point cadence, your language(s), no English defaults. The
          technical and AI cost is ours.
        </p>
      </div>

      <div className="l-offer-block">
        <p className="l-offer-block-head">What we'd ask of Lekatchila</p>
        <p className="l-offer-line">
          A pilot with five couples through their first year. Thirty minutes
          after each agent call, the next morning, so we can sharpen. Honest
          signal — when something doesn't fit, you tell us. Permission to learn
          from what you've already built.
        </p>
      </div>

      <p className="l-offer-caveat">
        Yet to be proven. The framework runs with non-Charedi clinicians today;
        the Charedi-couples adaptation is what we would build together.
      </p>
    </div>
  )
}
