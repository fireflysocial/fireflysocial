import type { InterestId } from '../lib/interests.ts'
import type { Prompt, SocialNetwork } from '../lib/pods/answers.ts'
import type { EventIntent } from '../lib/pods/intents.ts'

/**
 * MADE-UP people for the example pod, shown until the backend exists. They are not real users,
 * the UI says so, and their replies ("met you back", "keep meeting") are simulated so the whole
 * flow can be tried. Never present them as real (PRODUCT.md, "Evidence on Hand").
 */
export interface ExamplePerson {
  id: string
  firstName: string
  intents: EventIntent[]
  interests: InterestId[]
  prompt: Prompt
  answer: string
  /** What they'd share back after a mutual keep-meeting. */
  shares: Partial<Record<SocialNetwork, string>>
  /** Simulated: whether they mark "We met" for you if you mark them. */
  metBack: boolean
  /** Simulated: whether they'd choose to keep meeting you. */
  keepsMeeting: boolean
}

export const EXAMPLE_PEOPLE: readonly ExamplePerson[] = [
  {
    id: 'example-1',
    firstName: 'Sam',
    intents: ['find-collaborators'],
    interests: ['startup-meetups', 'board-games', 'climbing'],
    prompt: 'The last thing I got nerdy about',
    answer: 'variable fonts',
    shares: { linkedin: 'linkedin.com/in/example-sam' },
    metBack: true,
    keepsMeeting: true,
  },
  {
    id: 'example-2',
    firstName: 'Priya',
    intents: ['meet-cofounder', 'grow-network'],
    interests: ['startup-meetups', 'tech-talks', 'pottery'],
    prompt: 'I’d love to learn',
    answer: 'woodworking',
    shares: { instagram: '@example.priya' },
    metBack: true,
    keepsMeeting: false,
  },
  {
    id: 'example-3',
    firstName: 'Jo',
    intents: ['open-to-anything'],
    interests: ['board-games', 'coffee-meetups', 'language-exchange'],
    prompt: 'Ask me about',
    answer: 'my sourdough experiments',
    shares: { instagram: '@example.jo' },
    metBack: false,
    keepsMeeting: true,
  },
  {
    id: 'example-4',
    firstName: 'Mateo',
    intents: ['make-friends'],
    interests: ['run-clubs', 'board-games', 'trivia'],
    prompt: 'A small thing that makes my week',
    answer: 'the Saturday market',
    shares: { instagram: '@example.mateo' },
    metBack: true,
    keepsMeeting: true,
  },
  {
    id: 'example-5',
    firstName: 'Aiko',
    intents: ['make-friends', 'open-to-anything'],
    interests: ['pottery', 'drawing', 'language-exchange'],
    prompt: 'I’d love to learn',
    answer: 'to throw a bowl that stays round',
    shares: { instagram: '@example.aiko' },
    metBack: true,
    keepsMeeting: true,
  },
  {
    id: 'example-6',
    firstName: 'Dev',
    intents: ['grow-network'],
    interests: ['career-talks', 'networking-nights', 'tech-talks'],
    prompt: 'Ask me about',
    answer: 'switching careers at 30',
    shares: { linkedin: 'linkedin.com/in/example-dev' },
    metBack: true,
    keepsMeeting: true,
  },
  {
    id: 'example-7',
    firstName: 'Lena',
    intents: ['make-friends'],
    interests: ['book-clubs', 'writing', 'walking-groups'],
    prompt: 'The last thing I got nerdy about',
    answer: 'old maps of the city',
    shares: { instagram: '@example.lena' },
    metBack: true,
    keepsMeeting: false,
  },
  {
    id: 'example-8',
    firstName: 'Omar',
    intents: ['find-collaborators', 'make-friends'],
    interests: ['hackathons', 'board-games', 'volunteering'],
    prompt: 'A small thing that makes my week',
    answer: 'fixing a bike for a neighbour',
    shares: { linkedin: 'linkedin.com/in/example-omar' },
    metBack: true,
    keepsMeeting: true,
  },
]
