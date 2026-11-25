import type { EventSummary } from '../../lib/feed/rank.ts'

/**
 * Made-up events for the landing page's feed demo. Kinds of events that really happen in
 * Vancouver, but no real organiser, venue or listing. Labelled as examples on the page.
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
    id: 'pottery',
    title: 'Pottery drop-in',
    when: 'Sun · 2 pm',
    place: 'Main Street',
    price: '$18',
    interests: ['crafts'],
  },
  {
    id: 'seawall-walk',
    title: 'Sunset seawall walk',
    when: 'Fri · 7:30 pm',
    place: 'English Bay',
    price: 'Free',
    interests: ['outdoors'],
  },
  {
    id: 'book-club',
    title: 'Book club, newcomers welcome',
    when: 'Tue · 7 pm',
    place: 'Fairview',
    price: 'Free',
    interests: ['books'],
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
    id: 'dumplings',
    title: 'Dumpling-making night',
    when: 'Thu · 6 pm',
    place: 'Chinatown',
    price: '$15',
    interests: ['food', 'crafts'],
  },
]
