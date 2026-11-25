# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

One React + Vite codebase ships as the web app and, wrapped with Capacitor (planned, not added yet), as the iOS and Android apps. Confirmed 2026-11-25: **one consistent Firefly design language on every platform**, not per-OS adaptive styling. Platform conventions are still respected where users expect them: safe areas, back gestures, the native share sheet, and 44×44 pt touch targets. The phone is the primary device for every attendee-facing surface; design at 360 px first, then up to about 440 px, then scale up.

## Users

**Primary: attendees, newcomer-first** (confirmed 2026-11-25). When trade-offs come up, design for someone new to Vancouver, such as a co-op student or a recent arrival, on their phone. They want to meet people, and they already go to (or would go to) events: run clubs, board-game cafés, language exchanges. Their problem isn't finding events. It's that the events don't turn into anything: a friendly chat, "we should hang out sometime", then nothing. Long-time locals who want more friends use the same flows and need no separate design.

**Internal: the Firefly team.** At launch they run and monitor the event pipeline, fix bad listings and handle reports.

**Not at launch: hosts** (confirmed 2026-11-25). Partner hosts and pod hosts are long-term; see [workflow/v3-user-flow.md](workflow/v3-user-flow.md).

Users are 18+ only.

## Product Purpose

Firefly helps people in Vancouver make **platonic** friends at the events happening across the city. The long-term loop: Firefly finds events that fit each person → they go through Firefly → people going to the same events are brought together, with Firefly taking the friction out of approaching (the Firefly corner) → consensual socials sharing → connections that grow over repeated meetings.

**Launch scope (confirmed 2026-11-25):** an extremely easy onboarding, and a feed of events picked for that person, found across the city by AI-assisted search and checked against each event's own page. Going is click-through plus "Did you register?". Groups, the Firefly corner, picks and chat come next. The current spec is [workflow/v4-user-flow.md](workflow/v4-user-flow.md).

Success at launch: onboarding completed in under 2 minutes, a feed that feels personal, and confirmed "I'm going" that turns into "I went". Long term, the north star is connections that meet again (proposed: % of mutual connections meeting again within 21 days). All targets are proposals.

## Positioning

"Get more out of the events you already go to." Firefly is a layer on top of the whole city's events, not another event platform and not a new place to browse people. It is useful to one person on day one (events that fit them), and becomes social as more people go to the same events. What a neighbouring product can't truthfully copy is **turning event registrations into repeat meetings with the same people**, with consent at each step. It is never positioned as an app for lonely people, and it is not a dating or swipe app.

## Operating Context

- **Onboarding:** first-time setup on a phone, likely in a spare minute; must reach a personal feed in under 2 minutes.
- **Browsing:** a short, ranked list of this week's events, each saying why it's there, with one-tap "More like this" / "Not for me".
- **Going:** tap through to the event's own page in the in-app browser, register there, come back and confirm.
- **Around the event:** an opt-in reminder before, one optional "Did you go?" after.
- **Later phase:** groups for the same event, the Firefly corner at the venue, picks and chat (v3 spec, to be redesigned).
- **Roles at launch:** attendee, Firefly team.

## Capabilities and Constraints

- **Status (2026-11-25):** the public landing page is built (frontend only). Onboarding, the event pipeline and the feed are the next builds. Every flow in the spec is proposed behaviour.
- **Event data:** AI-assisted web search run in scheduled batches per category and area (provider undecided), extracting facts from each event's own page and linking back to it. No personal data goes to the AI provider. Reversing the v3 "no scraping" decision needs a terms and legal check before launch.
- **Privacy and safety are hard constraints** (CLAUDE.md §8, [research/safety-privacy.md](research/safety-privacy.md)):
  - No location data, maps or distances, ever. Neighbourhoods are picked from a list.
  - The going list says where someone will be: owner-only (RLS), never shown to others at launch, deleted after the event.
  - Collect only what launch uses: no photo, selfie or socials until group features need them.
  - No attendee counts below 5, no named guest lists.
  - No dark patterns (no streaks, no fake urgency, no "someone liked you").
  - Later group features keep the v3 rules: minimal stranger cards, private mutual picks, one-tap block and report.
- **Terminology:** use pod, pod-mate, keep meeting, pick, check in. Avoid match, date, swipe, like, lonely, track, locate.
- **App store requirements:** in-app account deletion, report on user content, 18+ rating.
- **Undecided:** AI provider and cost ceiling, source terms, age-assurance method, retention periods, group size and timing, routing and data-fetching libraries.

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
- **Absent, so never fabricate:** users, testimonials, partner hosts or venue logos, attendee or friendship counts, event counts, pilot results, press, app store ratings. No pilot has run. Any social proof or numbers on a surface must wait for real data.

## Product Principles

1. **The event is the product; the app gets out of the way.** Optimize for less time in the app and more time at events. A short feed that fits beats an endless one.
2. **Useful to one person on day one.** The feed must feel personal before anyone else joins; social features build on that, never replace it.
3. **Safety is visible, not buried.** Privacy and consent are features to show plainly, asked for at the moment they matter.
4. **Lower the nerve it takes.** Every step should make showing up easier for a nervous newcomer: an easy start, events that fit, and later, familiar faces and a fixed meeting point.
5. **Repetition over reach.** Favour meeting the same few people again over meeting more people.
6. **Honest and low-pressure.** No hype, guilt, manipulative nudges or fake numbers; the copy says only what is true.

## Accessibility & Inclusion

- WCAG 2.2 AA as the baseline: semantic HTML, keyboard reachable, visible focus, axe checks on key pages, 44×44 pt touch targets, reduced-motion support.
- Glow fails contrast on light backgrounds; never rely on it for text or essential indicators there.
- Users include newcomers whose first language may not be English: plain language, onboarding planned in several languages.
- The feed deliberately spans categories (LGBTQ+, faith-neutral, newcomer groups) and budgets (free / under $20 by default). Accessibility preferences are private and only used to rank and filter events.
