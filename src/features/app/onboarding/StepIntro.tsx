import type { ReactNode } from 'react'

/** A step's question (the page's h1, id `step-title`) and an optional line under it. */
export function StepIntro({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="step__intro stack stack--tight">
      <h1 className="title" id="step-title">
        {title}
      </h1>
      {children && <p className="a-muted">{children}</p>}
    </div>
  )
}
