const KINDS = [
  'Startup meetups',
  'Run clubs',
  'Gallery openings',
  'Hackathons',
  'Language exchanges',
  'Design meetups',
  'Career meetups',
  'Board-game cafés',
  'Workshops',
  'Volunteering',
  'Pitch nights',
  'Newcomer meetups',
] as const

/**
 * A sample of the many kinds of events across the city that Firefly sits on top of, as one slow line of large type.
 * The list is read once by screen readers; the moving copy is decorative.
 */
export function EventStrip() {
  return (
    <section className="strip" aria-labelledby="strip-title">
      <h2 id="strip-title" className="visually-hidden">
        Events Firefly finds
      </h2>
      <ul className="visually-hidden">
        {KINDS.map((kind) => (
          <li key={kind}>{kind}</li>
        ))}
      </ul>
      <div className="strip__track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <p key={copy} className="strip__line">
            {KINDS.map((kind) => (
              <span key={kind}>
                {kind}
                <span className="strip__sep" />
              </span>
            ))}
          </p>
        ))}
      </div>
    </section>
  )
}
