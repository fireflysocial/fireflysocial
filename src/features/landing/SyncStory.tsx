import { useRef } from 'react'
import { WEEKS_SHOWN } from '../../lib/fireflies/story.ts'
import { FireflyField } from './FireflyField.tsx'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.ts'
import { useStoryProgress } from './useStoryProgress.ts'

/**
 * "Coming next": where Firefly goes after launch. A sticky field sits behind five full-screen
 * text blocks; as the visitor scrolls, five strangers gather into a group, light up, and fall
 * into step week by week. Every idea is in the text, so it reads fine with the field off.
 */
export function SyncStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const { progress, chapter, week } = useStoryProgress(sectionRef)
  const still = usePrefersReducedMotion()
  const shownWeek = still ? WEEKS_SHOWN : week

  return (
    <section ref={sectionRef} className="story" id="coming-next" aria-labelledby="story-title">
      <div className="story__stage">
        <FireflyField progress={progress} still={still} callTarget={sectionRef} />
        {/* Repeats what the text says, as a caption on the field; hidden from screen readers. */}
        <div className="story__hud" aria-hidden="true">
          {/* Shown through every chapter: none of this has launched yet. */}
          <p className="label" data-shown="true">
            <span className="muted">Coming next</span>
            <span>{still || chapter >= 2 ? 'Example: Tuesday run club' : 'People to go with'}</span>
          </p>
          <p className="story__week" data-shown={still || chapter >= 3}>
            <span className="muted">Week</span>
            <span className="story__week-number">{shownWeek}</span>
          </p>
        </div>
      </div>

      <div className="story__chapters">
        <div className="chapter">
          <h2 id="story-title" className="statement">
            <span className="visually-hidden">Coming next: </span>
            Then, the people going too.
          </h2>
          <p className="chapter__note">
            Firefly will introduce a few people going to the same event, the day before.
          </p>
        </div>

        <div className="chapter">
          <p className="statement">Vancouver is full of people you’ve almost met.</p>
          <p className="chapter__note">
            You see them at the run club, the board-game night, the language exchange. You chat
            once. “We should hang out sometime.” Then nothing.
          </p>
        </div>

        <div className="chapter">
          <p className="statement">Firefly will put a few of you together.</p>
          <p className="chapter__note">
            Meet at a set spot, with a little help to break the ice. No walking up to strangers
            cold.
          </p>
        </div>

        <div className="chapter">
          <p className="statement">Same event. Same faces. Week after week.</p>
          <p className="chapter__note">
            If you all want to keep meeting, Firefly will keep you together next time.
          </p>
        </div>

        <div className="chapter chapter--last">
          <p className="statement">Until you’re in step.</p>
          <p className="chapter__note">
            Friendship takes time together. One study puts it at 40 to 60 hours to go from stranger
            to casual friend. Firefly will help those hours add up, one event at a time.
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
