import { useRef } from 'react'
import { ArrowIcon } from './ArrowIcon.tsx'
import { FireflyField } from './FireflyField.tsx'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.ts'

/**
 * The first screen: a black field of drifting fireflies, the promise, and a quiet invitation to
 * tap the dark. Taps on the field make nearby fireflies flash back (call and response).
 */
export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  // The hero's field has no scroll story: it is always the crowd.
  const progress = useRef(0)
  const still = usePrefersReducedMotion()

  return (
    <section ref={heroRef} className="hero" id="top" aria-labelledby="hero-title">
      <FireflyField
        progress={progress}
        still={still}
        stillProgress={0}
        callTarget={heroRef}
        seed={1125}
      />
      <div className="hero__copy">
        <h1 id="hero-title" className="display hero__title">
          Make friends at the events you’d go to anyway.
        </h1>
        <p className="hero__intro">
          Firefly finds events across Vancouver that fit you. Next, it’ll introduce you to the
          people going too.
        </p>
      </div>
      <div className="hero__foot">
        {!still && (
          <p className="hero__hint" aria-hidden="true">
            Tap the dark. They answer.
          </p>
        )}
        <a className="cue" href="#try">
          How it picks
          <ArrowIcon direction="down" />
        </a>
      </div>
    </section>
  )
}
