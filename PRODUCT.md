# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

One React + Vite codebase ships as the web app and, wrapped with Capacitor (planned, not added yet), as the iOS and Android apps. Confirmed 2026-11-25: **one consistent Firefly design language on every platform**, not per-OS adaptive styling. Platform conventions are still respected where users expect them: safe areas, back gestures, the native share sheet, and 44×44 pt touch targets. The phone is the primary device for every attendee-facing surface; design at 360 px first, then up to about 440 px, then scale up.

## Users

**Primary: attendees, newcomer-first** (confirmed 2026-11-25). When trade-offs come up, design for someone new to Vancouver, such as a co-op student or a recent arrival. They are on their phone, often just before or after an event, and nervous about walking up to strangers. Their job: turn the events they already go to (run clubs, board-game cafés, language exchanges) into repeat meetings with the same few people, until some of them become friends. Long-time locals who want more friends use the same flows and need no separate design.

**Secondary: partner hosts and pod hosts.** Partner hosts run recurring events and want newcomers to keep coming back. They need setup that takes minutes (target: under 5 minutes per event) and aggregate stats only. Pod hosts are experienced Firefly users who volunteer to run the meeting corner.

**Internal: the Firefly team.** They vet hosts, curate "Around the city" events, run starter events and handle all moderation.

Users are 18+ only.

## Product Purpose

Firefly helps people in Vancouver make **platonic** friends. It puts them in a small group (a "pod") that meets again and again at real recurring events they would attend anyway. The flow: discover this week's events → RSVP with "put me in a pod" → see your pod before the event → meet at a fixed meeting point (the Firefly corner) → put the phone away → afterwards, privately pick who to keep meeting → mutual picks unlock chat and a suggested next event together.

Success means connections that meet again. The proposed north-star metric is the % of mutual connections who meet again within 21 days. Other proposed targets: under 2 minutes in the app during an event, and ≥90% saying they felt safe. All targets are proposals to validate in the pilot ([workflow/v3-user-flow.md](workflow/v3-user-flow.md#key-metrics-and-targets)).

## Positioning

"Get more out of the events you already go to." Firefly is a layer on existing recurring events, not a new place to find events or people. What a neighbouring product can't truthfully copy is the **host relationships plus the pod-to-circle loop on recurring events**: the same small group, at the same weekly event, re-podded together only when both people said "keep meeting." It is never positioned as an app for lonely people, and it is not a dating or swipe app.

## Operating Context

- **Before an event:** browsing this week's events, RSVPing, the pod reveal 24 hours before, pod chat opening 30 minutes before ("I'm in the green jacket").
- **At the event:** a noisy, real-world setting. Check-in by rotating QR or host confirmation, finding the Firefly corner by its printed sign, a 60-second intro, then the phone goes away. Flaky signal is normal, so check-in and picks must be safe to retry.
- **After the event:** a push notification within 2 hours asks "Who would you like to keep meeting?" Picks close after 72 hours.
- **Ongoing:** a circle of people met 2+ times, fade reminders, and pods that "graduate" into recurring circles.
- **Hosts** use setup, a live check-in count, a moderation view limited to reported accounts, and aggregate post-event stats.
- **Event types:** partner event, Around the city, starter event. **Roles:** attendee, partner host, pod host, Firefly team.

## Capabilities and Constraints

- **Status (2026-11-25):** scaffolded only. Tooling, tests and CI work, but no product features exist yet. Every flow in the spec is proposed behaviour, not shipped behaviour.
- **Privacy and safety are hard constraints** (CLAUDE.md §8, [research/safety-privacy.md](research/safety-privacy.md)):
  - No location data, maps or distances, ever.
  - Three visibility scopes (pod, room, post-event picker), each enforced in RLS.
  - Minimal stranger cards: first name, photo, 2–3 interests, a prompt.
  - Picks are private and mutual. Never imply a one-sided pick.
  - One-tap block, report and leave on every card.
  - Attendee counts are hidden below 5. No named guest lists.
  - Hosts see aggregates only.
  - No dark patterns (no guilt streaks, no "someone liked you").
- **Terminology:** use pod, pod-mate, keep meeting, pick, check in, host. Avoid match, date, swipe, like, lonely, track, locate.
- **App store requirements:** in-app account deletion, report and block on all user content, 18+ rating.
- **Accessibility tags exist in the product model:** step-free, quieter venues, captions or hearing support, language. Onboarding is planned in several languages.
- **Undecided:** routing and data-fetching libraries (likely React Router + TanStack Query), the age-assurance method, the pilot neighbourhood and its partner series.

## Brand Commitments

- **Name and mark:** Firefly. The mark is a firefly at rest seen from above, with muted wings and one glowing tail ([brand/README.md](brand/README.md); assets in [brand/](brand/)). The mark's own rules apply: no gradients, glows or outer shadows on the mark, and clear space of at least the glow's radius. Glow (`#D9F84A`) is never used for text or essential indicators on light backgrounds.
- **Brand palette** (binding): Night `#0E1424`, Glow `#D9F84A`, Wing `#313C62`. Glow is "the light": one glow per composition. Light-surface variant: wings `#C9CFDE` on `#F5F6F0`. Light and dark mode are both supported.
- **Voice (confirmed 2026-11-25): warm, plain, low-pressure.** Like a friendly regular at the run club. Short sentences, no hype, no guilt, gently encouraging. Example: "Your pod meets at the bike rack at 6:45."
- **Story behind the mark:** in a quiet room (the informal "Vancouver Freeze"), Firefly makes one signal visible: _I'm here, and I'm open to meeting people._ Use "Vancouver Freeze" as a perceived local experience, never as a diagnosis or a claim that Vancouver is uniquely lonely.

## Evidence on Hand

- **Desk research only:** [research/interviews/synthesis.md](research/interviews/synthesis.md) synthesizes 15 secondary sources (news, surveys, essays, Reddit). It contains no first-party interviews yet.
- **Founder story:** [research/problem.md](research/problem.md), about a move from Victoria to Vancouver for a co-op in September 2026.
- **Competitor notes:** [research/competitors/](research/competitors/).
- **Brand assets:** [brand/](brand/).
- **Absent, so never fabricate:** users, testimonials, partner hosts or venue logos, attendee or friendship counts, pilot results, press, app store ratings. No pilot has run. Any social proof or numbers on a surface must wait for real data.

## Product Principles

1. **The event is the product; the app gets out of the way.** Optimize for less time in the app and more time with people. The phone comes out at check-in and goes away.
2. **Safety is visible, not buried.** Privacy and consent are features to show plainly, asked for at the moment they matter.
3. **Lower the nerve it takes.** Every step should make showing up easier for a nervous newcomer: familiar faces before arrival, a fixed meeting point, and a ready-made next plan.
4. **Repetition over reach.** Favour meeting the same few people again over meeting more people.
5. **Honest and low-pressure.** No hype, guilt, manipulative nudges or fake numbers; the copy says only what is true.

## Accessibility & Inclusion

- WCAG 2.2 AA as the baseline: semantic HTML, keyboard reachable, visible focus, axe checks on key pages, 44×44 pt touch targets, reduced-motion support.
- Glow fails contrast on light backgrounds; never rely on it for text or essential indicators there.
- Users include newcomers whose first language may not be English: plain language, onboarding planned in several languages.
- Recruitment deliberately spans categories (LGBTQ+, faith-neutral, newcomer groups) and budgets (free / under $20 by default). Accessibility preferences are private.
