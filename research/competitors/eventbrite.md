# Eventbrite

**Category:** Event platform (ticketing marketplace)
**Last researched:** 2026-11-15

## What it is

A general-purpose self-serve ticketing marketplace. It covers everything from concerts to workshops to singles nights. It was taken private by **Bending Spoons** (deal announced Dec 2, 2025, ~US$500M, $4.50/share). Eventbrite's [SEC filing](https://www.sec.gov/Archives/edgar/data/1475115/000147511526000005/R23.htm) confirms completion on **March 10, 2026**. Bending Spoons also owns Meetup.

## What it does

| Area | Details |
|------|---------|
| Ticketing | Free and paid events. Fees are mostly passed to buyers. Organizer-side fees were introduced in 2023 and then rolled back. |
| Discovery | Consumer app and website with search by city, date, and category; personalized recommendations; "Eventbrite Ads" for promoted placement. |
| Scale (FY2024) | 269.6M total tickets, 83.8M paid tickets (down 10% YoY). Net revenue $325.1M, flat. Revenue per paid ticket $3.88. |
| Organizer tools | Email marketing, ads, check-in app, reporting. |
| API | The **public Event Search API was shut down** (Dec 2019 to Feb 2020). You can read an event by ID or list events for an org or venue you have access to. |

## Strengths

- Huge inventory and SEO. For many people, "events near me" means Eventbrite.
- Strong in categories Luma doesn't cover: classes, workshops, nightlife, cultural, and community events.
- Trusted checkout and refunds.

## Gaps (relative to Firefly's goal)

1. **Ticketing focus.** The reviewed financial and API sources do not establish a Firefly-style friendship workflow; they are not sufficient to prove the absence of every attendee or social feature.
2. **Follow-through to investigate.** Validate current attendee tools before claiming no in-event or post-event support exists.
3. **Discovery quality hypothesis.** Relevance and fee clarity are questions for user interviews; no prevalence estimate for spam was verified here.
4. **Organizer churn.** Eventbrite's own 2024 filings say pricing changes (organizer fees) hurt creator acquisition and retention and reduced event inventory.
5. **Platform dependency.** Ownership has changed. Monitor API and partner terms rather than predict changes from competitor commentary.
6. **No general public-search endpoint.** This does not imply that all public-event retrieval by ID is unavailable.

## What Firefly should take from it

- Don't build on Eventbrite data. Treat Eventbrite events as **user-submitted links** ("paste an event you're going to"), not an aggregated feed.
- Eventbrite's paid-ticket decline and organizer frustration is an opening. Whether local hosts want an additional social tool still requires interviews.

## Sources

- [Eventbrite FY2024 10-K](https://www.sec.gov/Archives/edgar/data/1475115/000147511525000026/eb-20241231.htm) · [Q4 2024 results](https://www.streetinsider.com/Business+Wire/Eventbrite+Reports+Fourth+Quarter+2024+Financial+Results/24420142.html) · [Q2 2024 shareholder letter](https://www.sec.gov/Archives/edgar/data/1475115/000147511524000161/shareholderletterq22024f.htm)
- [Insider Arbitrage: Bending Spoons acquires Eventbrite](https://www.insidearbitrage.com/2025/12/bending-spoons-acquires-eventbrite-for-500-million/) · [RegFox: what organizers need to know](https://www.regfox.com/blog/bending-spoons-acquires-eventbrite-what-event-organizers-need-to-know) · [SimpleTix: staff cuts](https://www.simpletix.com/eventbrites-new-owner-just-cut-staff-what-it-means-for-event-organizers-in-2026/) (competitor blogs; treat as biased)
- [Eventbrite API: Event Search shut down](https://groups.google.com/g/eventbrite-api/c/FT2MsDswdrA) · [Eventbrite platform changelog](https://www.eventbrite.co/platform/docs/changelog)
