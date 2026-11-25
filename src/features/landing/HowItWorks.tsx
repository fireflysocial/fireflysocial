const STEPS = [
  {
    when: 'Before',
    title: 'Pick an event you’d go to anyway',
    body: 'Run clubs, board-game cafés, language exchanges, walks. Tap “I’m going, put me in a pod.” Free and under-$20 events come first.',
  },
  {
    when: 'The day before',
    title: 'Meet your pod on your phone',
    body: 'Pods form 24 hours before. You see first names, photos, a few interests and one prompt answer. Pod chat opens 30 minutes before, for “I’m in the green jacket.”',
  },
  {
    when: 'At the event',
    title: 'Check in, then put the phone away',
    body: 'Find the Firefly corner, say hi, and get on with the run, the game or the conversation. The app is for the first two minutes, not the whole night.',
  },
  {
    when: 'After',
    title: 'Pick who you’d like to keep meeting',
    body: 'Picks are private. If you both pick each other, chat opens and Firefly suggests the next event you could go to together.',
  },
] as const

export function HowItWorks() {
  return (
    <section className="section" id="how-it-works" aria-labelledby="how-title">
      <h2 id="how-title" className="headline">
        How it works
      </h2>
      <ol className="rows">
        {STEPS.map((step) => (
          <li key={step.when} className="row row--timed">
            <p className="row__when">{step.when}</p>
            <h3 className="row__title">{step.title}</h3>
            <p className="row__body">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
