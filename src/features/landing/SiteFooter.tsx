import { FireflyMark } from '../../components/FireflyMark.tsx'

export function SiteFooter() {
  return (
    <footer className="footer">
      <p className="footer__line">
        <span className="muted">Meet people at the events</span>
        <span>you already go to.</span>
      </p>
      <div className="footer__base">
        <p className="footer__word">
          <FireflyMark className="footer__mark" />
          Firefly
        </p>
        <p className="footer__meta">
          <span>Made in Vancouver</span>
          <span className="muted">© 2026 Firefly</span>
        </p>
      </div>
    </footer>
  )
}
