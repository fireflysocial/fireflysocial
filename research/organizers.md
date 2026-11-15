# Event Organizers (Vancouver)

Potential partners running recurring events.

| Organizer / Event | Type | Frequency | Typical size | Platform (Luma, Meetup, etc.) | Notes |
|-------------------|------|-----------|--------------|-------------------------------|-------|
| | | | | | |

## What organizers might want from Firefly

-

## Event data access (platform APIs)

Researched 2026-11-15. **Conclusion: no major platform lets a third party search public events through an official API. Firefly gets events through host partnerships and user-pasted links, not aggregation.**

| Platform | Public event search? | Notes |
|----------|---------------------|-------|
| Eventbrite | ❌ No | Event Search API (`GET /v3/events/search/`) shut down Dec 2019, with whitelist extension to Feb 20, 2020. Remaining API is org-scoped: get an event by ID, list events for an org or venue you have access to. Now owned by Bending Spoons, so terms may change. [Shutdown notice](https://groups.google.com/g/eventbrite-api/c/FT2MsDswdrA) · [Changelog](https://www.eventbrite.co/platform/docs/changelog) |
| Luma | ❌ No | API keys are **calendar-scoped**. `List Events` returns only events managed by your calendar. Third-party reviews say the API requires Luma Plus (~$59/mo). A partner host can generate a key for Firefly. [List Events docs](https://docs.luma.com/reference/get_v1-calendars-events-list) · [Luma API help](https://help.luma.com/p/luma-api) |
| Meetup | ⚠️ Gated | GraphQL API has a `keywordSearch` query, but **only Meetup Pro subscribers can create OAuth consumers**, and approval isn't guaranteed. [Meetup help](https://help.meetup.com/hc/en-us/articles/41453576628749) · [GraphQL](https://www.meetup.com/en-US/graphql/) |
| Partiful | ❌ No public API | Mostly private invites anyway. |
| Facebook Events | ❌ No | Public event search via Graph API was removed years ago. |
| Scraping (Apify etc.) | Technically possible | Violates platform ToS. Legal and reputational risk. Breaks often. **Not recommended.** |
