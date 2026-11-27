import { createContext, useContext } from 'react'

/**
 * "Now", injectable. Screens read the time through this so tests can fix it (CLAUDE.md §6:
 * never depend on the real clock).
 */
export const ClockContext = createContext<() => Date>(() => new Date())

export function useClock(): () => Date {
  return useContext(ClockContext)
}
