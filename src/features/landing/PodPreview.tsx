/** Synthetic example pod for the phone preview. Not real people; labelled as such on the page. */
const POD = [
  { name: 'Maya', interests: 'Trail runs · ramen · sci-fi' },
  { name: 'Jun', interests: 'New in town · bouldering' },
  { name: 'Priya', interests: 'Board games · podcasts' },
  { name: 'Sam', interests: 'Film photos · long runs' },
  { name: 'You', interests: 'Your interests here' },
] as const

/**
 * What a pod looks like the night before: the minimal card the spec allows for strangers
 * (first name, a few interests, one prompt), never last names, workplaces or socials.
 */
export function PodPreview() {
  return (
    <section className="section pod" aria-labelledby="pod-title">
      <div className="pod__text">
        <h2 id="pod-title" className="headline">
          Your pod, the night before.
        </h2>
        <p className="pod__lede">
          First names, a few interests and one prompt answer. Enough to recognise each other and
          have something to say. No last names, workplaces or socials.
        </p>
      </div>

      <figure className="phone">
        <div className="phone__screen">
          <div className="phone__event">
            <p className="label">
              <span className="muted">Tomorrow, 6:45 pm</span>
              <span>Tuesday run club</span>
            </p>
            <p className="phone__meet">
              <span className="muted">Meet at</span> the Firefly corner, by the bike rack
            </p>
          </div>
          <ul className="phone__pod" aria-label="Example pod">
            {POD.map((person) => (
              <li key={person.name} className="person">
                <span className="person__initial" aria-hidden="true">
                  {person.name.charAt(0)}
                </span>
                <span className="person__text">
                  <span className="person__name">{person.name}</span>
                  <span className="muted">{person.interests}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="phone__prompt">
            <span className="muted">Maya’s prompt</span>
            Ask me about the best dumpling spot I’ve found so far.
          </p>
          <p className="phone__chat">
            <span className="phone__dot" aria-hidden="true" />
            Pod chat opens at 6:15 pm
          </p>
        </div>
        <figcaption className="phone__caption">
          Example pod. Names and details are made up.
        </figcaption>
      </figure>
    </section>
  )
}
