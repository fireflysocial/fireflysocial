import { FireflyMark } from '../../../components/FireflyMark.tsx'
import { useAppState } from '../appState.ts'

export function StepWelcome() {
  const { city } = useAppState()
  return (
    <div className="step">
      <div className="step__intro stack">
        <p className="lockup phone-only">
          <FireflyMark className="lockup__mark" cropped />
          <span>Firefly</span>
        </p>
        <h1 className="a-display">Get more out of the events you already go to.</h1>
      </div>
      <div className="step__body stack">
        <p className="lede">
          Tell us what you’re into and we’ll find events in {city.name} that fit you. It takes about
          two minutes.
        </p>
        <p className="small small--muted">
          For now your answers stay on this device. Signing up with your phone number comes later.
        </p>
      </div>
    </div>
  )
}
