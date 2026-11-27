import type { StepProps } from './Onboarding.tsx'

/** 18+ and the respect pledge (v4 step 3). Both are required. */
export function StepPledge({ draft, update }: StepProps) {
  return (
    <div className="stack">
      <h1 className="title">Before we start</h1>
      <p className="a-muted">
        Firefly is for adults who come to meet people with a shared purpose.
      </p>
      <div className="checks">
        <label className="check">
          <input
            type="checkbox"
            checked={draft.adult}
            onChange={(e) => {
              update({ adult: e.target.checked })
            }}
          />
          <span>I’m 18 or older</span>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={draft.pledge}
            onChange={(e) => {
              update({ pledge: e.target.checked })
            }}
          />
          <span>
            I’m here to meet people with good intent. No selling, no spam, no unwanted advances.
          </span>
        </label>
      </div>
    </div>
  )
}
