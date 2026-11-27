import type { CityEvent } from '../../../lib/events.ts'
import { formatEventDate, formatEventTime } from '../../../lib/time.ts'

/**
 * "Thu Dec 3 · 7 p.m. · Main Street". One line on phones; on wide screens the parts stack into
 * the row's leading "when" column (DESIGN.md, Hairline rows).
 */
export function EventWhen({ event, locale }: { event: CityEvent; locale: string }) {
  const start = new Date(event.startsAt)
  return (
    <span className="ctx when">
      <span>{formatEventDate(start, event.timeZone, locale)}</span>
      <span>{formatEventTime(start, event.timeZone, locale)}</span>
      <span>{event.neighbourhood}</span>
    </span>
  )
}
