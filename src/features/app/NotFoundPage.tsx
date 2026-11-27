import { Link } from 'react-router'
import './app.css'

export function NotFoundPage() {
  return (
    <div className="app">
      <main className="app-main app-main--bare">
        <div className="stack">
          <p className="ctx">Not found</p>
          <h1 className="title">There’s nothing at this address.</h1>
          <Link className="text-link" to="/app">
            Go to Firefly
          </Link>
        </div>
      </main>
    </div>
  )
}
