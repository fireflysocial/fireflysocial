const STEPS = [
  {
    when: 'Two minutes',
    title: 'Tell Firefly what you like',
    body: 'Sign up with your phone number, pick a few interests and when you’re free. No photo, no profile to perfect.',
  },
  {
    when: 'Every week',
    title: 'Get a short list that fits',
    body: 'Events from across your city, each with a line on why it’s there. Tap “Not for me” and the list learns.',
  },
  {
    when: 'When you’re in',
    title: 'Register where you normally would',
    body: 'Firefly opens the event’s own page. Come back, tap “I’m going”, and get a reminder before it starts.',
  },
  {
    when: 'Coming next',
    title: 'Meet the people going too',
    body: 'A few people going to the same event, introduced the day before, meeting at a set spot. No walking up to strangers cold.',
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
