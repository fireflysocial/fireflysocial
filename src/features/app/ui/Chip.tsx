import type { ReactNode } from 'react'

interface ChipProps {
  pressed: boolean
  onToggle: () => void
  children: ReactNode
}

/** A square toggle chip (DESIGN.md "Chips"): picked is a solid Dusk block. */
export function Chip({ pressed, onToggle, children }: ChipProps) {
  return (
    <button type="button" className="a-chip" aria-pressed={pressed} onClick={onToggle}>
      {children}
    </button>
  )
}
