# Event Organizers (Vancouver)

Potential partners running recurring events. Started from the [interviews](interviews/synthesis.md) research (2026-11-15). Several founders started their clubs because they were lonely newcomers. "Not verified" = check before outreach.

| Organizer / Event | Type | Frequency | Typical size | Platform (Luma, Meetup, etc.) | Notes |
|-------------------|------|-----------|--------------|-------------------------------|-------|
| Mondays Run Club | Social run (5K seawall + beer) | Weekly, Mondays | 150+ | Not verified | Founded Apr 2021 by Veronica Skye after moving from Toronto. Free. [Source](interviews/vanmag-mondays-run-club.md) |
| VanCity Girls Who Walk | Women's walking group | Weekly, Sundays | 70–80, up to 200 | Not verified | Founder Maryam Marissen, an immigrant who was lonely after moving. Free. [Source](interviews/daily-hive-girls-who-walk.md) |
| We Should Be Friends | Social club (meetups, book club) | Recurring | 100+ at first meetup | Not verified | Founder Katrina Martin, moved from Ontario in 2017. [Source](interviews/vanmag-we-should-be-friends.md) |
| Lumi | Social club for newcomers | Recurring | Capped at 30 per event; 1,000+ participants | Not verified | Co-founders Judy Lee and Serena Wong. Mostly mid-to-late 20s. [Source](interviews/bcit-news-lumi-social-clubs.md) |
| Let's Adventure Vancouver | Social/outdoor group | Not verified | Not verified | Not verified | Founder Sebastian Breuninger, German expat. [Source](interviews/emi-namoro-vancouver-loneliness.md) |
| VanCity Newcomers (20's-30's) | Newcomer socials | 1–2 per month | 5,500+ members | Meetup | [Meetup](https://www.meetup.com/vancity-newcomers-20s-30s/) |
| Are you new in Vancouver? Come make friends! | Newcomer socials | Not verified | 7,300+ members | Meetup | [Meetup](https://www.meetup.com/vancouver-newcomers/) |

## What organizers might want from Firefly Social

-

## Event data access (platform APIs)

Researched 2026-11-15. **Conclusion: no major platform lets a third party search public events through an official API. Firefly Social gets events through host partnerships and user-pasted links, not aggregation.**

| Platform | Public event search? | Notes |
|----------|---------------------|-------|
| Eventbrite | ❌ No | Event Search API (`GET /v3/events/search/`) shut down Dec 2019, with whitelist extension to Feb 20, 2020. Remaining API is org-scoped: get an event by ID, list events for an org or venue you have access to. Now owned by Bending Spoons, so terms may change. [Shutdown notice](https://groups.google.com/g/eventbrite-api/c/FT2MsDswdrA) · [Changelog](https://www.eventbrite.co/platform/docs/changelog) |
| Luma | ❌ No | API keys are **calendar-scoped**. `List Events` returns only events managed by your calendar. Third-party reviews say the API requires Luma Plus (~$59/mo). A partner host can generate a key for Firefly Social. [List Events docs](https://docs.luma.com/reference/get_v1-calendars-events-list) · [Luma API help](https://help.luma.com/p/luma-api) |
| Meetup | ⚠️ Gated | GraphQL API has a `keywordSearch` query, but **only Meetup Pro subscribers can create OAuth consumers**, and approval isn't guaranteed. [Meetup help](https://help.meetup.com/hc/en-us/articles/41453576628749) · [GraphQL](https://www.meetup.com/en-US/graphql/) |
| Partiful | ❌ No public API | Mostly private invites anyway. |
| Facebook Events | ❌ No | Public event search via Graph API was removed years ago. |
| Scraping (Apify etc.) | Technically possible | Violates platform ToS. Legal and reputational risk. Breaks often. **Not recommended.** |
