import type { ReactNode } from 'react'

/**
 * Made-up content must always say so (PRODUCT.md, "Evidence on Hand"). A Dusk context line over
 * a muted note: Dusk marks something not yet live (DESIGN.md, the Quiet Dusk Rule).
 */
export function ExampleNote({ children }: { children: ReactNode }) {
  return (
    <p className="label2 note">
      <span className="ctx ctx--dusk">Example data</span>
      <span className="small a-muted">{children}</span>
    </p>
  )
}
