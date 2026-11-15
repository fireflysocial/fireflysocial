# Eventbrite

**Category:** Event platform (ticketing marketplace)
**Last researched:** 2026-11-15

## What it is

The largest general-purpose self-serve ticketing marketplace. It covers everything from concerts to workshops to singles nights. It was taken private by **Bending Spoons** (deal announced Dec 2, 2025, ~US$500M, $4.50/share). One vendor blog says the deal closed in March 2026. Bending Spoons also owns Meetup.

## What it does

| Area | Details |
|------|---------|
| Ticketing | Free and paid events. Fees are mostly passed to buyers. Organizer-side fees were introduced in 2023 and then rolled back. |
| Discovery | Consumer app and website with search by city, date, and category; personalized recommendations; "Eventbrite Ads" for promoted placement. |
| Scale (FY2024) | 269.6M total tickets, 83.8M paid tickets (down 10% YoY). Net revenue $325.1M, flat. Revenue per paid ticket $3.88. |
| Organizer tools | Email marketing, ads, check-in app, reporting. |
| API | Org-scoped only. The **public Event Search API was shut down** (Dec 2019 to Feb 2020). You can read an event by ID or list events for an org or venue you have access to. |

## Strengths

- Huge inventory and SEO. For many people, "events near me" means Eventbrite.
- Strong in categories Luma doesn't cover: classes, workshops, nightlife, cultural, and community events.
- Trusted checkout and refunds.

## Gaps (relative to Firefly Social's goal)

1. **Transactional, not social.** The product ends at the ticket. Attendees cannot see each other, and there's no social graph.
2. **Nothing at or after the event.** There is no way to find people inside, and no way to reconnect afterwards.
3. **Quality and spam.** Low-cost listing has filled discovery with low-effort, duplicate, and "networking mixer" events. Users complain about clutter and surprise fees at checkout.
4. **Organizer churn.** Eventbrite's own 2024 filings say pricing changes (organizer fees) hurt creator acquisition and retention and reduced event inventory.
5. **Ownership uncertainty.** Bending Spoons has a well-documented pattern (Evernote, WeTransfer, Meetup) of deep layoffs and monetization pushes after acquisition. API and partner terms could change without notice.
6. **No public data access.** Firefly Social cannot pull public Eventbrite events through the official API.

## What Firefly Social should take from it

- Don't build on Eventbrite data. Treat Eventbrite events as **user-submitted links** ("paste an event you're going to"), not an aggregated feed.
- Eventbrite's paid-ticket decline and organizer frustration is an opening. Hosts are looking for tools that make their events **better**, not just ticketed.

## Sources

- [Eventbrite FY2024 10-K](https://www.sec.gov/Archives/edgar/data/1475115/000147511525000026/eb-20241231.htm) · [Q4 2024 results](https://www.streetinsider.com/Business+Wire/Eventbrite+Reports+Fourth+Quarter+2024+Financial+Results/24420142.html) · [Q2 2024 shareholder letter](https://www.sec.gov/Archives/edgar/data/1475115/000147511524000161/shareholderletterq22024f.htm)
- [Insider Arbitrage: Bending Spoons acquires Eventbrite](https://www.insidearbitrage.com/2025/12/bending-spoons-acquires-eventbrite-for-500-million/) · [RegFox: what organizers need to know](https://www.regfox.com/blog/bending-spoons-acquires-eventbrite-what-event-organizers-need-to-know) · [SimpleTix: staff cuts](https://www.simpletix.com/eventbrites-new-owner-just-cut-staff-what-it-means-for-event-organizers-in-2026/) (competitor blogs; treat as biased)
- [Eventbrite API: Event Search shut down](https://groups.google.com/g/eventbrite-api/c/FT2MsDswdrA) · [Eventbrite platform changelog](https://www.eventbrite.co/platform/docs/changelog)
