# Event Organizers (Vancouver)

Potential partners running recurring events. Started from the [interviews](interviews/synthesis.md) research (2026-11-15). Several founders started their clubs because they were lonely newcomers. Historical article figures describe the source publication date, not current attendance. "Not verified" = check before outreach. These are prospective partners, not confirmed partnerships.

| Organizer / Event | Type | Frequency | Reported attendance / membership (different measures) | Platform (Luma, Meetup, etc.) | Notes |
|-------------------|------|-----------|--------------|-------------------------------|-------|
| Mondays Run Club | Social run + post-run socializing | Weekly, Mondays | 150+ | Not verified | Founded by Veronica Skye after moving from Toronto; the feature describes an initial 3K run. Free. [Source](interviews/vanmag-mondays-run-club.md) |
| VanCity Girls Who Walk | Women's walking group | Weekly, Sundays | 70–80, up to 200 | Not verified | Founder Maryam Marissen, an immigrant who was lonely after moving. Free. [Source](interviews/daily-hive-girls-who-walk.md) |
| We Should Be Friends | Social club (meetups, book club) | Recurring | 100+ at first meetup | Not verified | Founder Katrina Martin, moved from Ontario in 2017. [Source](interviews/vanmag-we-should-be-friends.md) |
| Lumi | Social club for newcomers | Recurring | Capped at 30 per event; 1,000+ participants | Not verified | Co-founders Judy Lee and Serena Wong. Mostly mid-to-late 20s. [Source](interviews/bcit-news-lumi-social-clubs.md) |
| Let's Adventure Vancouver | Social/outdoor group | Not verified | Not verified | Not verified | Founder Sebastian Breuninger, German expat. [Source](interviews/emi-namoro-vancouver-loneliness.md) |
| VanCity Newcomers (20's-30's) | Newcomer socials | 1–2 per month | 5,387 members in the retrieved page; group title still says 5500+ | Meetup | [Meetup](https://www.meetup.com/vancity-newcomers-20s-30s/) |
| Are you new in Vancouver? Come make friends! | Newcomer socials | Not verified | 7,234 members in the retrieved page; group title still says 7300+ | Meetup | [Meetup](https://www.meetup.com/vancouver-newcomers/) |

## What organizers might want from Firefly

Hypotheses for host interviews: improved newcomer return rates, promotion, a low-effort introduction kit, and aggregate attendance reporting. None has been validated with these organizers.

## Event data access (platform APIs)

Researched 2026-11-15. **Conclusion: unrestricted public-event aggregation is not a dependable launch plan. Meetup offers gated GraphQL access, so the blanket claim that no platform permits search was incorrect. Firefly proposes host partnerships and user-pasted links; API permissions still need checking for each integration.**

| Platform | Public event search? | Notes |
|----------|---------------------|-------|
| Eventbrite | ❌ No | Event Search API (`GET /v3/events/search/`) shut down Dec 2019, with whitelist extension to Feb 20, 2020. Other endpoints can retrieve authorized event and organization data; removal of search does not mean every public event is inaccessible by ID. Now owned by Bending Spoons, so terms may change. [Shutdown notice](https://groups.google.com/g/eventbrite-api/c/FT2MsDswdrA) · [Changelog](https://www.eventbrite.co/platform/docs/changelog) |
| Luma | ❌ No | API keys are **calendar-scoped**. `List Events` returns only events managed by your calendar. Luma itself confirms an active Plus subscription is required (US$59/month when billed annually). Organization keys can cover multiple calendars. A partner host can generate a key for Firefly. [List Events docs](https://docs.luma.com/reference/get_v1-calendars-events-list) · [Luma API help](https://help.luma.com/p/luma-api) |
| Meetup | ⚠️ Gated | GraphQL API has a `keywordSearch` query, but **only Meetup Pro subscribers can create OAuth consumers**, and approval isn't guaranteed. [Meetup help](https://help.meetup.com/hc/en-us/articles/41453576628749) · [GraphQL](https://www.meetup.com/en-US/graphql/) |
| Partiful | Not verified | No documented general event-search API found in this review. Public events and Explore do exist; see [Partiful](competitors/partiful.md). |
| Facebook Events | Not verified for this integration | Do not assume broad event-search access; current permissions and approval requirements need an official API review before implementation. |
| Scraping (Apify etc.) | Technically possible | Permission depends on the platform, data, method, and terms; API restrictions alone do not establish illegality. **Not the proposed launch approach.** |
