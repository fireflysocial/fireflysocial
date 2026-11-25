const PROMISES = [
  {
    title: 'No location, ever.',
    body: 'No maps, no distances, no tracking. You pick neighbourhoods you like from a list.',
  },
  {
    title: 'Your plans stay yours.',
    body: 'Only you can see which events you’re going to.',
  },
  {
    title: 'Only what’s needed.',
    body: 'A first name and what you’re into. No photo, no last name and no socials to get started.',
  },
  {
    title: '18+ and good intent only.',
    body: 'Everyone agrees to the same pledge: no selling, no spam, no unwanted advances.',
  },
  {
    title: 'Report anything.',
    body: 'Flag a wrong listing in one tap. When you can meet people through Firefly, block and report will be on every card.',
  },
] as const

export function SafetySection() {
  return (
    <section className="section" id="safety" aria-labelledby="safety-title">
      <h2 id="safety-title" className="headline">
        Private by default.
      </h2>
      <ul className="rows">
        {PROMISES.map((promise) => (
          <li key={promise.title} className="row">
            <h3 className="row__title">{promise.title}</h3>
            <p className="row__body">{promise.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
