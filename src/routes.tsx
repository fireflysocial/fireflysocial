import type { RouteObject } from 'react-router'
import { AppIndex } from './features/app/AppIndex.tsx'
import { AppRoot } from './features/app/AppRoot.tsx'
import { EventPage } from './features/app/event/EventPage.tsx'
import { HomeRoute } from './features/app/HomeRoute.tsx'
import { FeedPage } from './features/app/feed/FeedPage.tsx'
import { NotFoundPage } from './features/app/NotFoundPage.tsx'
import { Onboarding } from './features/app/onboarding/Onboarding.tsx'
import { PlansPage } from './features/app/plans/PlansPage.tsx'
import { MeetPage } from './features/app/pods/MeetPage.tsx'
import { PersonPage } from './features/app/pods/PersonPage.tsx'
import { PodPage } from './features/app/pods/PodPage.tsx'
import { TabLayout } from './features/app/TabLayout.tsx'
import { YouPage } from './features/app/you/YouPage.tsx'

/**
 * Every screen and its URL. On the web "/" is the public landing page; the attendee app lives
 * under /app, and the iOS and Android apps open straight into it.
 */
export const routes: RouteObject[] = [
  { path: '/', element: <HomeRoute /> },
  {
    path: '/app',
    element: <AppRoot />,
    children: [
      { index: true, element: <AppIndex /> },
      { path: 'start/:step', element: <Onboarding /> },
      {
        element: <TabLayout />,
        children: [
          { path: 'feed', element: <FeedPage /> },
          { path: 'plans', element: <PlansPage /> },
          { path: 'you', element: <YouPage /> },
          { path: 'events/:eventId', element: <EventPage /> },
          { path: 'events/:eventId/meet', element: <MeetPage /> },
          { path: 'events/:eventId/pod', element: <PodPage /> },
          { path: 'people/:personId', element: <PersonPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]
