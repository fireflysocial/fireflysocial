import type { EventSummary } from '../../lib/feed/rank.ts'

/**
 * Made-up events for the landing page's feed demo, set in Vancouver (the first launch city).
 * Kinds of events that really happen there, but no real organiser, venue or listing. Labelled as
 * examples on the page.
 */
export const EXAMPLE_EVENTS: readonly EventSummary[] = [
  {
    id: 'board-games',
    title: 'Board-game night',
    when: 'Thu · 7 pm',
    place: 'Commercial Drive',
    price: 'Free',
    interests: ['board-games', 'food'],
  },
  {
    id: 'startup-meetup',
    title: 'Startup founders meetup',
    when: 'Tue · 6 pm',
    place: 'Gastown',
    price: 'Free',
    interests: ['tech', 'careers'],
  },
  {
    id: 'social-run',
    title: 'Saturday 5K social run',
    when: 'Sat · 9 am',
    place: 'Kitsilano',
    price: 'Free',
    interests: ['running', 'outdoors'],
  },
  {
    id: 'language-exchange',
    title: 'Spanish–English exchange',
    when: 'Wed · 6:30 pm',
    place: 'Mount Pleasant',
    price: '$5',
    interests: ['languages', 'food'],
  },
  {
    id: 'gallery-night',
    title: 'Gallery opening night',
    when: 'Fri · 7 pm',
    place: 'Strathcona',
    price: 'Free',
    interests: ['arts'],
  },
  {
    id: 'pottery',
    title: 'Pottery drop-in',
    when: 'Sun · 2 pm',
    place: 'Main Street',
    price: '$18',
    interests: ['crafts', 'arts'],
  },
  {
    id: 'beach-clean-up',
    title: 'Beach clean-up',
    when: 'Sat · 10 am',
    place: 'Jericho Beach',
    price: 'Free',
    interests: ['volunteering', 'outdoors'],
  },
  {
    id: 'hackathon',
    title: 'Weekend hackathon',
    when: 'Sat · 10 am',
    place: 'Downtown',
    price: '$10',
    interests: ['tech'],
  },
  {
    id: 'careers-coffee',
    title: 'Career switchers’ coffee',
    when: 'Wed · 8 am',
    place: 'Yaletown',
    price: 'Free',
    interests: ['careers', 'food'],
  },
  {
    id: 'dumplings',
    title: 'Dumpling-making night',
    when: 'Thu · 6 pm',
    place: 'Chinatown',
    price: '$15',
    interests: ['food', 'crafts'],
  },
]
