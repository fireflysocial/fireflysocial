import { useEffect } from 'react'
import { requestInvite, type RequestInvite } from '../../data/invites.ts'
import { EventStrip } from './EventStrip.tsx'
import { HowItWorks } from './HowItWorks.tsx'
import { InviteSection } from './InviteSection.tsx'
import { PodPreview } from './PodPreview.tsx'
import { SafetySection } from './SafetySection.tsx'
import { SiteFooter } from './SiteFooter.tsx'
import { SiteHeader } from './SiteHeader.tsx'
import { SyncStory } from './SyncStory.tsx'
import './landing.css'

const NIGHT = '#0e1424'

interface LandingPageProps {
  /** Where invite requests go. Defaults to the real data function; tests pass their own. */
  onRequestInvite?: RequestInvite
}

/**
 * The public landing page. Always Night, whatever the visitor's light/dark setting: the dark
 * is the concept (decided 2026-11-25). App screens follow the system setting as usual.
 */
export function LandingPage({ onRequestInvite = requestInvite }: LandingPageProps) {
  useNightBrowserChrome()

  return (
    <div className="landing">
      <a className="skip" href="#invite">
        Skip to the invite form
      </a>
      <SiteHeader />
      <main>
        <SyncStory />
        <HowItWorks />
        <PodPreview />
        <EventStrip />
        <SafetySection />
        <InviteSection onRequest={onRequestInvite} />
      </main>
      <SiteFooter />
    </div>
  )
}

/** Paints the mobile browser's toolbar Night while this page is open, and restores it after. */
function useNightBrowserChrome() {
  useEffect(() => {
    const metas = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'))
    const previous = metas.map((meta) => meta.content)
    for (const meta of metas) meta.content = NIGHT
    return () => {
      metas.forEach((meta, index) => {
        meta.content = previous[index] ?? meta.content
      })
    }
  }, [])
}
