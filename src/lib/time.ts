/**
 * Time-zone maths without a date library. Every event carries its own IANA time zone and is shown
 * in that zone, never the device's (CLAUDE.md §6).
 */

export interface LocalDateTime {
  year: number
  /** 1 to 12. */
  month: number
  day: number
  hour: number
  minute: number
}

export interface LocalParts extends LocalDateTime {
  /** 0 = Sunday … 6 = Saturday, in the given zone. */
  weekday: number
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const partsFormatters = new Map<string, Intl.DateTimeFormat>()

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = partsFormatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
    partsFormatters.set(timeZone, formatter)
  }
  return formatter
}

/** The wall-clock date and time of an instant in a time zone. */
export function localParts(instant: Date, timeZone: string): LocalParts {
  const values: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {}
  for (const part of partsFormatter(timeZone).formatToParts(instant)) values[part.type] = part.value
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    weekday: WEEKDAYS.indexOf(String(values.weekday)),
  }
}

/** Minutes the zone is ahead of UTC at an instant (e.g. -480 for Vancouver in winter). */
function offsetMinutes(instantMs: number, timeZone: string): number {
  const p = localParts(new Date(instantMs), timeZone)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute)
  return Math.round((asUtc - Math.floor(instantMs / 60_000) * 60_000) / 60_000)
}

/**
 * The instant at which a wall-clock time happens in a zone. Across a DST change the offset is
 * re-checked once, so times just after the change land correctly; a time that doesn't exist (in
 * the spring-forward gap) moves forward by the gap, as clocks do.
 */
export function zonedToInstant(local: LocalDateTime, timeZone: string): Date {
  const guess = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute)
  const first = guess - offsetMinutes(guess, timeZone) * 60_000
  const second = guess - offsetMinutes(first, timeZone) * 60_000
  const exact = [first, second].find((candidate) => sameLocal(candidate, local, timeZone))
  // No exact match means the time falls in a spring-forward gap: take the later reading.
  return new Date(exact ?? Math.max(first, second))
}

function sameLocal(instantMs: number, local: LocalDateTime, timeZone: string): boolean {
  const p = localParts(new Date(instantMs), timeZone)
  return (
    p.year === local.year &&
    p.month === local.month &&
    p.day === local.day &&
    p.hour === local.hour &&
    p.minute === local.minute
  )
}

/** The calendar date `days` after the local date of `instant` in a zone (handles month ends). */
export function addLocalDays(
  instant: Date,
  days: number,
  timeZone: string,
): Pick<LocalDateTime, 'year' | 'month' | 'day'> {
  const p = localParts(instant, timeZone)
  const shifted = new Date(Date.UTC(p.year, p.month - 1, p.day + days))
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  }
}

export type DayPart = 'weekday-days' | 'weekday-evenings' | 'weekend-days' | 'weekend-evenings'

/** Which part of the week an event falls in, in its own zone. Evenings start at 5 pm. */
export function dayPart(instant: Date, timeZone: string): DayPart {
  const { weekday, hour } = localParts(instant, timeZone)
  const weekend = weekday === 0 || weekday === 6
  const evening = hour >= 17
  if (weekend) return evening ? 'weekend-evenings' : 'weekend-days'
  return evening ? 'weekday-evenings' : 'weekday-days'
}

/** "Thursday evening", "Saturday morning", in the event's zone. */
export function dayPartLabel(instant: Date, timeZone: string, locale: string): string {
  const weekday = new Intl.DateTimeFormat(locale, { timeZone, weekday: 'long' }).format(instant)
  const { hour } = localParts(instant, timeZone)
  const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  return `${weekday} ${part}`
}

/** "Thu 3 Dec · 7 p.m." (minutes only when they aren't :00), in the event's zone. */
export function formatEventWhen(instant: Date, timeZone: string, locale: string): string {
  const { minute } = localParts(instant, timeZone)
  const date = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
    .formatToParts(instant)
    .filter((part) => part.type !== 'literal')
    .map((part) => part.value.replace(/\.$/, ''))
    .join(' ')
  const time = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: 'numeric',
    ...(minute === 0 ? {} : { minute: '2-digit' }),
  }).format(instant)
  return `${date} · ${time}`
}
