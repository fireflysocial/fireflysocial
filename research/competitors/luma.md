# Luma (lu.ma / luma.com)

**Category:** Event platform (hosting, ticketing, discovery)
**Last researched:** 2026-11-15

## What it is

Luma is an event-page and ticketing tool aimed at hosts who want a good-looking page with little setup. It supports community and professional events. No market-share study was verified to support calling it the default tool in Vancouver.

## What it does

| Area | Details |
|------|---------|
| Event pages | Custom, clean event pages; free to create. Approval-gated RSVPs, waitlists, registration questions. |
| Ticketing | Paid tickets via Stripe. Platform fee on top of Stripe's fee on the free tier; paid tiers remove or reduce it. |
| Calendars | Hosts and communities run a "calendar" that people subscribe to; subscribers are notified of new events. City calendars and a Discover page surface public events. |
| Guest experience | QR check-in, guest list (host can show or hide it), guest chat/blasts, referral tracking, Zoom and virtual events. |
| Pricing | Free tier; **Luma Plus US$59/month billed annually**; Enterprise by inquiry. No US$199 Pro tier appears on the official pricing page reviewed. |
| API | Luma confirms **Plus is required**. Calendar keys access the corresponding calendar; organization keys can cover its calendars. `List Events` lists events managed by the authorized calendar. |
| Funding | Earlier notes cited a ~$3M seed round; the linked funding sources could not be retrieved in this audit. Treat amount and investors as unverified here. |

## Strengths

- Design and low setup effort are potential strengths to test in host interviews, not verified market-share findings.
- RSVP-approval questions give hosts a lightweight way to screen and learn about guests.
- A visible guest list (when enabled) already shows who is going, so guests can look people up before arriving.
- City calendars and subscriptions create repeat attendance at a community level.

## Gaps (relative to Firefly's goal)

1. **No in-room layer.** Check-in is a QR scan for the host. Nothing helps guests know who wants to meet, or find each other once inside.
2. **Guest list ≠ intent.** Seeing 150 names does not tell you who came alone or who is open to talking. Guest visibility depends on product settings; a guest list is not itself consent to a Firefly introduction.
3. **No post-event connection.** The reviewed API and pricing pages do not establish a dedicated mutual friendship or recurring-pod feature. Luma does have chat, calendars, and repeat-event tools; do not describe all follow-up as absent.
4. **Skewed toward tech and professional events.** Coverage of hobby, outdoor, and casual social events is thinner, and the vibe is networking, not friendship.
5. **Closed data.** The API is scoped to calendars you manage. The reviewed endpoint is not a general public-search feed. This technical limit does not by itself decide what aggregation is lawful; use authorized host integrations and review the applicable terms.

## What Firefly should take from it

- Partner with Luma hosts instead of scraping. A host can connect their own calendar API key (Luma Plus) or simply share a link, and Firefly layers on top.
- Copy the **calendar subscription** idea: following a recurring series is more valuable for friendship than one-off events.
- RSVP questions are a natural place to ask "Do you want to meet people here? (Firefly)".

## Sources

- [Luma pricing](https://lu.ma/pricing) · [Luma Plus help](https://help.luma.com/t/luma-plus) · [Luma vs Eventbrite](https://help.lu.ma/p/luma-vs-eventbrite)
- [Luma API: List Events](https://docs.luma.com/reference/get_v1-calendars-events-list) · [Luma API help](https://help.luma.com/p/luma-api)
- [Official API requirements](https://help.luma.com/p/luma-api) confirm Plus is required; this supersedes the earlier third-party uncertainty.
- [Official pricing](https://luma.com/pricing) supersedes the earlier unverified Toolradar Pro-tier claim.
- [Crunchbase News: Luma seed](https://news.crunchbase.com/?p=39471) · [Seedtable profile](https://seedtable.com/startups/Luma_%28online_event_company%29-MN53YKX)
