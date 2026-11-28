import { Link } from 'react-router'
import { ArrowIcon } from '../../components/ArrowIcon.tsx'

/** The close of the page: straight into sign-up, or log in for people coming back. */
export function StartSection() {
  return (
    <section className="section start" id="start" aria-labelledby="start-title">
      <h2 id="start-title" className="display">
        Get started.
      </h2>
      <div className="start__body">
        <p className="start__lede">
          Firefly is starting in Vancouver. Sign up with your email, tell it what you’re into, and
          see your first feed in a few minutes.
        </p>
        <div className="start__actions">
          <Link className="start__go" to="/app/sign-in">
            Get started
            <ArrowIcon />
          </Link>
          <p className="start__login">
            Already have an account? <Link to="/app/sign-in?mode=login">Log in</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
