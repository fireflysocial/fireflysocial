# Luma (lu.ma / luma.com)

**Category:** Event platform (hosting, ticketing, discovery)
**Last researched:** 2026-11-15

## What it is

Luma is an event-page and ticketing tool aimed at hosts who want a good-looking page with little setup. It has become the default tool for startup, tech, and creator-community events, especially in tech hubs. Vancouver's tech, AI, and founder scene uses it heavily.

## What it does

| Area | Details |
|------|---------|
| Event pages | Custom, clean event pages; free to create. Approval-gated RSVPs, waitlists, registration questions. |
| Ticketing | Paid tickets via Stripe. Platform fee on top of Stripe's fee on the free tier; paid tiers remove or reduce it. |
| Calendars | Hosts and communities run a "calendar" that people subscribe to; subscribers are notified of new events. City calendars and a Discover page surface public events. |
| Guest experience | QR check-in, guest list (host can show or hide it), guest chat/blasts, referral tracking, Zoom and virtual events. |
| Pricing | Free tier; **Luma Plus ~$59/mo**, **Pro ~$199/mo** (Toolradar, Oct 2026). |
| API | Calendar-scoped API key. `List Events` returns only events **managed by your own calendar**; third-party reviews say the API needs Luma Plus. |
| Funding | Seed of ~$3M (Maven Ventures, Venrock). No later round confirmed in this search. |

## Strengths

- Hosts like it. Good design and low friction made it the default for tech and community events.
- RSVP-approval questions give hosts a lightweight way to screen and learn about guests.
- A visible guest list (when enabled) already shows who is going, so guests can look people up before arriving.
- City calendars and subscriptions create repeat attendance at a community level.

## Gaps (relative to Firefly's goal)

1. **No in-room layer.** Check-in is a QR scan for the host. Nothing helps guests know who wants to meet, or find each other once inside.
2. **Guest list ≠ intent.** Seeing 150 names does not tell you who came alone or who is open to talking. Guest lists also expose attendees to everyone who registered, with no consent beyond the host's setting.
3. **No post-event connection.** After the event, guests get a feedback email or photos at most. Nothing turns a conversation into a second meeting.
4. **Skewed toward tech and professional events.** Coverage of hobby, outdoor, and casual social events is thinner, and the vibe is networking, not friendship.
5. **Closed data.** The API is scoped to calendars you manage. There is no public event search, so Firefly cannot legally aggregate Luma events without a partnership or the host's own API key.

## What Firefly should take from it

- Partner with Luma hosts instead of scraping. A host can connect their own calendar API key (Luma Plus) or simply share a link, and Firefly layers on top.
- Copy the **calendar subscription** idea: following a recurring series is more valuable for friendship than one-off events.
- RSVP questions are a natural place to ask "Do you want to meet people here? (Firefly)".

## Sources

- [Luma pricing](https://lu.ma/pricing) · [Luma Plus help](https://help.luma.com/t/luma-plus) · [Luma vs Eventbrite](https://help.lu.ma/p/luma-vs-eventbrite)
- [Luma API: List Events](https://docs.luma.com/reference/get_v1-calendars-events-list) · [Luma API help](https://help.luma.com/p/luma-api)
- [ZoomInfo Luma API review](https://pipeline.zoominfo.com/sales/luma-api-review) (claims API requires Plus; not confirmed by Luma)
- [Toolradar: Cvent vs Luma pricing](https://toolradar.com/compare/cvent-vs-luma)
- [Crunchbase News: Luma seed](https://news.crunchbase.com/?p=39471) · [Seedtable profile](https://seedtable.com/startups/Luma_%28online_event_company%29-MN53YKX)
