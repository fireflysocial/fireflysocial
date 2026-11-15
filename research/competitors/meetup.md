# Meetup

**Category:** Event platform (recurring interest groups)
**Last researched:** 2026-11-15

## What it is

The original "find people who share your interest" platform. It's built around **groups** that run recurring events, which is closer to friendship mechanics than one-off ticketing. Owned by WeWork (2017–2020), then AlleyCorp, then **Bending Spoons** (announced Jan 2024).

## What it does

| Area | Details |
|------|---------|
| Groups | Organizers pay a subscription to run groups. Members join groups and RSVP to events. |
| Scale | Last public figures (2020 media page): 44M+ members, 330k+ groups, 84k+ events per week. No current comparable figures verified in this audit. Meetup announced inactive-account cleanup beginning January 15, 2026; do not infer a completed purge of every inactive account. |
| Pricing | Organizer subscription (standard tier allows up to 3 groups). **Meetup Pro** for networks of groups. Members have been asked to pay too (Meetup+ subscriptions or per-RSVP fees in tests). |
| Features | Event RSVPs, group discussions, member profiles, attendee lists, event chat, recommendations. |
| API | GraphQL API. **Only Meetup Pro subscribers can create OAuth consumers**, and Pro doesn't guarantee approval. |

## Strengths

- **Recurring by design.** Groups meet weekly or monthly, which gives the repeated exposure friendships need.
- Deep catalogue of niche hobbies (board games, hiking, language exchange) that event platforms miss.
- Attendee lists and profiles already exist.

## Gaps (relative to Firefly Social's goal)

1. **Walking in alone is still hard.** Established groups have regulars and inside jokes. Newcomers report feeling like outsiders, Host practices vary; whether newcomers receive introductions needs local investigation.
2. **Quality varies.** Inactive or promotional groups are a discovery risk to investigate; their prevalence was not measured here.
3. **Price hikes and trust.** Fee increases under WeWork (2019 backlash) and again under Bending Spoons (pricing complaints; the 80%+ figure comes from a competing vendor and is unverified) may motivate migration; no representative migration rate was verified.
4. **No pair or small-group follow-up.** Connection is group-level. If you click with two people, you're left to sort it out with them.
5. **Audience fit unknown.** Test perceptions locally rather than assume preferences from age.
6. **Closed data.** API access needs Pro plus approval.

## What Firefly Social should take from it

- **Recurring groups are the right unit for friendship.** Firefly Social should prefer recurring events over one-offs (see [science.md](../science.md): repeated exposure).
- Interview organizers about pricing and unmet needs before assuming a local migration opportunity.
- The newcomer problem ("I went once and nobody talked to me") is exactly the step-4 problem Firefly Social aims to solve.

## Sources

- [Meetup 2025 progress report](https://www.meetup.com/blog/2025-meetup-progress-report/) · [New organizer pricing](https://www.meetup.com/blog/new-organizer-pricing-key-improvements/)
- [Meetup help: API / OAuth consumers require Pro](https://help.meetup.com/hc/en-us/articles/41453576628749) · [Meetup GraphQL](https://www.meetup.com/en-US/graphql/)
- [Inactive account cleanup](https://help.meetup.com/hc/en-us/articles/42157296236045-Inactive-Account-Cleanup-What-Organizers-Need-to-Know)
- [Archived Meetup media page (2020)](https://web-wp.archive.org/web/20200702135742/https:/www.meetup.com/media/)
- [The Register: 2019 fee backlash](https://www.theregister.com/2019/10/15/meetup_fee_increase_backlash) · [freeCodeCamp: the WeWork Meetup debacle](https://www.freecodecamp.org/news/the-wework-meetup-debacle-and-a-new-chapter/)
- [GroupApp: Meetup alternatives](https://www.group.app/blog/meetup-alternatives/) (competitor; source of 80%+ fee claim, unverified)
