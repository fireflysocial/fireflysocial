import { useRef } from 'react'
import { FireflyMark } from '../../components/FireflyMark.tsx'
import { ArrowIcon } from '../../components/ArrowIcon.tsx'
import { HeroField } from './HeroField.tsx'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.ts'

/**
 * The first screen, in two halves: a night meadow where yellow fireflies float over swaying
 * grass, and the Firefly logo with the promise. On phones the meadow sits above the words; from
 * 900px it takes the right half.
 */
export function Hero() {
  // The meadow's frame: where the fireflies live, and the only part that listens to a hand.
  const meadowRef = useRef<HTMLDivElement>(null)
  const still = usePrefersReducedMotion()

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <HeroField still={still} meadow={meadowRef} />
      <div ref={meadowRef} className="hero__meadow">
        {!still && (
          <p className="label hero__hint" aria-hidden="true">
            <span className="muted">Tap the meadow.</span>
            <span>They answer.</span>
          </p>
        )}
      </div>
      <p className="hero__words" aria-hidden="true">
        <span>Events</span>
        <span>People</span>
        <span>Your city</span>
      </p>
      <div className="hero__copy">
        <p className="wordmark" aria-hidden="true">
          <span className="wordmark__mark">
            <FireflyMark cropped />
          </span>
          Firefly
        </p>
        <h1 id="hero-title" className="hero__title">
          Meet your people at the events you’d go to anyway.
        </h1>
        <p className="hero__intro">
          Firefly finds events across your city that fit you. Next, it’ll introduce you to the
          people going too: future friends, collaborators, maybe a co-founder.
        </p>
      </div>
      <div className="hero__foot">
        <a className="cue" href="#try">
          How it picks
          <ArrowIcon direction="down" />
        </a>
      </div>
    </section>
  )
}
