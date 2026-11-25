const KINDS = [
  'Run clubs',
  'Board-game cafés',
  'Language exchanges',
  'Craft nights',
  'Walks',
  'Volunteering',
  'Book clubs',
  'Newcomer meetups',
] as const

/**
 * The kinds of recurring events Firefly sits on top of, as one slow line of large type.
 * The list is read once by screen readers; the moving copy is decorative.
 */
export function EventStrip() {
  return (
    <section className="strip" aria-labelledby="strip-title">
      <h2 id="strip-title" className="visually-hidden">
        Events Firefly works with
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
