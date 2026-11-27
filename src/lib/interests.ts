/**
 * Interest chips for onboarding (v4 step 6), grouped loosely, in everyday words. Event categories
 * use the same ids, so ranking is a plain match.
 */
export const INTEREST_GROUPS = [
  {
    label: 'Tech & startups',
    interests: [
      { id: 'startup-meetups', label: 'Startup meetups' },
      { id: 'hackathons', label: 'Hackathons' },
      { id: 'tech-talks', label: 'Tech talks' },
    ],
  },
  {
    label: 'Careers & networking',
    interests: [
      { id: 'networking-nights', label: 'Networking nights' },
      { id: 'career-talks', label: 'Career talks' },
    ],
  },
  {
    label: 'Arts & music',
    interests: [
      { id: 'gallery-openings', label: 'Gallery openings' },
      { id: 'film-screenings', label: 'Film screenings' },
      { id: 'open-mics', label: 'Open mics' },
    ],
  },
  {
    label: 'Active',
    interests: [
      { id: 'run-clubs', label: 'Run clubs' },
      { id: 'climbing', label: 'Climbing' },
      { id: 'yoga', label: 'Yoga' },
    ],
  },
  {
    label: 'Games',
    interests: [
      { id: 'board-games', label: 'Board games' },
      { id: 'trivia', label: 'Trivia' },
    ],
  },
  {
    label: 'Creative',
    interests: [
      { id: 'pottery', label: 'Pottery' },
      { id: 'drawing', label: 'Drawing' },
      { id: 'writing', label: 'Writing' },
    ],
  },
  {
    label: 'Food & drink',
    interests: [
      { id: 'supper-clubs', label: 'Supper clubs' },
      { id: 'coffee-meetups', label: 'Coffee meetups' },
    ],
  },
  {
    label: 'Learning',
    interests: [
      { id: 'language-exchange', label: 'Language exchange' },
      { id: 'book-clubs', label: 'Book clubs' },
      { id: 'workshops', label: 'Workshops' },
    ],
  },
  {
    label: 'Outdoors',
    interests: [
      { id: 'hiking', label: 'Hiking' },
      { id: 'walking-groups', label: 'Walking groups' },
    ],
  },
  {
    label: 'Community',
    interests: [
      { id: 'volunteering', label: 'Volunteering' },
      { id: 'newcomer-meetups', label: 'Newcomer meetups' },
    ],
  },
] as const

export type InterestId = (typeof INTEREST_GROUPS)[number]['interests'][number]['id']

const LABELS = new Map<string, string>(
  INTEREST_GROUPS.flatMap((group) => group.interests.map((i) => [i.id, i.label] as const)),
)

export function isInterestId(value: unknown): value is InterestId {
  return typeof value === 'string' && LABELS.has(value)
}

export function interestLabel(id: InterestId): string {
  return String(LABELS.get(id))
}

/** The fewest interests onboarding accepts (v4 step 6). */
export const MIN_INTERESTS = 3
