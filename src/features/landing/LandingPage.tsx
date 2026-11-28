import { useEffect } from 'react'
import { EventStrip } from './EventStrip.tsx'
import { FeedDemo } from './FeedDemo.tsx'
import { Hero } from './Hero.tsx'
import { HowItWorks } from './HowItWorks.tsx'
import { SafetySection } from './SafetySection.tsx'
import { SiteFooter } from './SiteFooter.tsx'
import { SiteHeader } from './SiteHeader.tsx'
import { StartSection } from './StartSection.tsx'
import { SyncStory } from './SyncStory.tsx'
import './landing.css'

/** The page's ground: soft black (decided 2026-11-25). */
const GROUND = '#050505'

/**
 * The public landing page. Always dark (soft black), whatever the visitor's light/dark setting:
 * the dark is the concept (decided 2026-11-25). App screens follow the system setting as usual.
 */
export function LandingPage() {
  useNightBrowserChrome()

  return (
    <div className="landing">
      <a className="skip" href="#start">
        Skip to getting started
      </a>
      <SiteHeader />
      <main>
        <Hero />
        <FeedDemo />
        <HowItWorks />
        <SyncStory />
        <EventStrip />
        <SafetySection />
        <StartSection />
      </main>
      <SiteFooter />
    </div>
  )
}

/** Paints the mobile browser's toolbar black while this page is open, and restores it after. */
function useNightBrowserChrome() {
  useEffect(() => {
    const saved = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
      (meta) => ({ meta, content: meta.content }),
    )
    for (const { meta } of saved) meta.content = GROUND
    return () => {
      for (const { meta, content } of saved) meta.content = content
    }
  }, [])
}
