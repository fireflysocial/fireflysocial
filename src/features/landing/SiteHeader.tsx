import { FireflyMark } from '../../components/FireflyMark.tsx'
import { ArrowIcon } from './ArrowIcon.tsx'

/** Block header: mark cell, two-line name, section links (wider screens), invite cell. */
export function SiteHeader() {
  return (
    <header className="header">
      <a className="header__home" href="#top">
        <span className="header__mark">
          <FireflyMark />
        </span>
        <span className="header__name">
          <span>Firefly</span>
          <span className="muted">Vancouver</span>
        </span>
      </a>
      <nav className="header__nav" aria-label="Sections">
        <a href="#try">
          <span className="muted">Try it</span>
          <span>Your feed</span>
        </a>
        <a href="#how-it-works">
          <span className="muted">Launch</span>
          <span>How it works</span>
        </a>
        <a href="#safety">
          <span className="muted">Built in</span>
          <span>Safety</span>
        </a>
      </nav>
      <a className="header__invite" href="#invite">
        Get an invite
        <ArrowIcon />
      </a>
    </header>
  )
}
