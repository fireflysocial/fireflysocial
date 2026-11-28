import { Link } from 'react-router'
import { FireflyMark } from '../../components/FireflyMark.tsx'
import { ArrowIcon } from '../../components/ArrowIcon.tsx'

/** Block header: mark cell, name, section links and log in (wider screens), Get started cell. */
export function SiteHeader() {
  return (
    <header className="header">
      <a className="header__home" href="#top">
        <span className="header__mark">
          <FireflyMark />
        </span>
        <span className="header__name">
          <span>Firefly</span>
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
        <Link to="/app/sign-in?mode=login">
          <span className="muted">Have an account</span>
          <span>Log in</span>
        </Link>
      </nav>
      <Link className="header__cta" to="/app/sign-in">
        Get started
        <ArrowIcon />
      </Link>
    </header>
  )
}
