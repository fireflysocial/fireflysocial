const PROMISES = [
  {
    title: 'No location, ever.',
    body: 'No maps, no distances, no live location. You meet at a set place and time, and that’s all anyone needs to know.',
  },
  {
    title: 'Picks stay private.',
    body: 'Nobody finds out who picked them. Chat only opens when two people both choose to keep meeting.',
  },
  {
    title: 'Small cards for strangers.',
    body: 'First name, photo and a few interests. No last name, workplace or socials until you decide to share them.',
  },
  {
    title: 'Block and report from every card.',
    body: 'One tap. Blocks are permanent, work both ways, and keep you out of each other’s pods.',
  },
  {
    title: '18+ and friends only.',
    body: 'Everyone agrees to the same pledge: no dating, no selling, no recruiting.',
  },
] as const

export function SafetySection() {
  return (
    <section className="section" id="safety" aria-labelledby="safety-title">
      <h2 id="safety-title" className="headline">
        Easy to meet. Hard to find.
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
