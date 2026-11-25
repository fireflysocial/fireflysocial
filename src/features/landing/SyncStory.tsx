import { useRef } from 'react'
import { WEEKS_SHOWN } from '../../lib/fireflies/story.ts'
import { ArrowIcon } from './ArrowIcon.tsx'
import { FireflyField } from './FireflyField.tsx'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.ts'
import { useStoryProgress } from './useStoryProgress.ts'

/**
 * The opening of the page. A sticky night field sits behind five full-screen text blocks; as
 * the visitor scrolls through them, five strangers gather into a pod, light up, and fall into
 * step week by week. Every idea is in the text, so it reads fine with the field switched off.
 */
export function SyncStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const { progress, chapter, week } = useStoryProgress(sectionRef)
  const still = usePrefersReducedMotion()
  const shownWeek = still ? WEEKS_SHOWN : week

  return (
    <section ref={sectionRef} className="story" aria-labelledby="story-title">
      <div className="story__stage">
        <FireflyField progress={progress} still={still} />
        {/* Repeats what the text says, as a caption on the field; hidden from screen readers. */}
        <div className="story__hud" aria-hidden="true">
          <p className="label" data-shown={still || chapter >= 2}>
            <span className="muted">Tuesday run club</span>
            <span>6:45 pm, Firefly corner</span>
          </p>
          <p className="story__week" data-shown={still || chapter >= 3}>
            <span className="muted">Week</span>
            <span className="story__week-number">{shownWeek}</span>
          </p>
        </div>
      </div>

      <div className="story__chapters">
        <div className="chapter chapter--opening" id="top">
          <ul className="story__kinds" aria-label="Events Firefly works with">
            <li>Run clubs</li>
            <li>Board-game cafés</li>
            <li>Language exchanges</li>
          </ul>
          <div className="opening">
            <h1 id="story-title" className="display">
              <span className="nowrap">Keep meeting</span>{' '}
              <span className="nowrap">the same faces.</span>
            </h1>
            <p className="opening__intro">
              Firefly puts you in a small pod at the events you already go to in Vancouver, and
              helps you keep meeting them.
            </p>
          </div>
          <a className="cue" href="#city">
            <span aria-hidden="true">///</span> Scroll to see how
            <ArrowIcon direction="down" />
          </a>
        </div>

        <div className="chapter" id="city">
          <p className="statement">Vancouver is full of people you’ve almost met.</p>
          <p className="chapter__note">
            You see them at the run club, the board-game night, the language exchange. You chat
            once. “We should hang out sometime.” Then nothing.
          </p>
        </div>

        <div className="chapter">
          <p className="statement">Firefly puts five of you in a pod.</p>
          <p className="chapter__note">
            The day before, you see first names, photos and a few interests, so the faces are
            familiar when you arrive. You meet at a set spot: the Firefly corner.
          </p>
        </div>

        <div className="chapter">
          <p className="statement">Same run. Same five. Week after week.</p>
          <p className="chapter__note">
            If you both want to keep meeting, Firefly puts you in the same pod again next time.
            Nothing to schedule.
          </p>
        </div>

        <div className="chapter chapter--last">
          <p className="statement">Until you’re in step.</p>
          <p className="chapter__note">
            Friendship takes time together. One study puts it at 40 to 60 hours to go from stranger
            to casual friend. Firefly helps those hours add up, one event at a time.
          </p>
          <p className="source">
            Hall, J. A. (2019). How many hours does it take to make a friend? Journal of Social and
            Personal Relationships, 36(4).
          </p>
        </div>
      </div>
    </section>
  )
}
