# Partiful

**Category:** Event platform (social invites for personal gatherings)
**Last researched:** 2026-11-15

## What it is

A free, fun-to-use invite tool for parties and casual gatherings. It replaced Facebook Events for Gen Z and young millennials and won Google Play's "Best App of 2024."

## What it does

| Area | Details |
|------|---------|
| Invites | Themed event pages, RSVPs by text link (no account needed to start), guest list, text blasts, photo albums. |
| Scale | ~500k average monthly users in Q1 2025 (Sensor Tower, +400% YoY), ~90% in the US. Company says +2M new users in 2025 and 60%+ of active users check weekly. |
| Social graph | "Mutuals" = people you've attended events with. Profiles, feed of friends' events, shared photos (added late 2025). |
| **Crush** (Dec 2025+) | Pick up to 10 Mutuals per month to anonymously signal romantic interest. The recipient learns *someone* is interested, and a match is revealed only if it's mutual. Hosts can run "matchmaking events." |
| Business model | Free core, with monetization experiments (Instacart group orders, premium org profiles). |

## Strengths

- **Built a social graph from real-world co-attendance.** "We were at the same party" is exactly the graph Firefly Social wants.
- Crush is a **double-blind mutual opt-in after an event**. That's Firefly Social's step 5, already shipped at scale (for dating).
- Viral loop: every invite brings new users.

## Gaps (relative to Firefly Social's goal)

1. **Mostly friends-of-friends.** Events are private and invite-only, so it strengthens existing circles and doesn't help newcomers break in.
2. **Crush is romantic.** There is no platonic "I'd like to see you again" signal.
3. **No in-room help.** Nothing helps strangers at the same party find or approach each other.
4. **Privacy incidents.** In Oct 2025, TechCrunch found Partiful **was not stripping GPS metadata from uploaded photos** (including profile photos), and anyone could read the originals from its Firebase storage. It was fixed after the report.
5. **US-centric.** Limited presence and network density in Canada.

## What Firefly Social should take from it

- A **platonic version of Crush** is a clear opening, and Partiful could ship it quickly. That's a competitive threat to watch.
- The co-attendance graph ("people you've been to things with") is the right basis for recommending a second meeting.
- Privacy hygiene: strip EXIF and GPS data from every upload, and never expose raw storage buckets (see [safety-privacy.md](../safety-privacy.md)).

## Sources

- [CNBC/NBC: Meet Partiful](https://www.nbcnewyork.com/news/business/money-report/meet-partiful-the-gen-z-party-planning-staple-thats-taking-on-apple/6231135/?amp=1)
- [NoGood: Partiful marketing strategy](https://nogood.io/blog/partiful-marketing-strategy/)
- [Partiful help: How does Crush work](https://help.partiful.com/hc/en-us/articles/45086026179483-How-does-Crush-work) · [Partiful matchmaking events](https://partiful.com/matchmaking-events) · [Global Dating Insights: Crush](https://www.globaldatinginsights.com/featured/partifuls-crush-tool-brings-dating-style-matching-to-event-app/) · [YPulse](https://www.ypulse.com/newsfeed/2026/01/28/partiful-is-officially-throwing-their-hat-in-the-dating-app-ring/)
- [TechCrunch: Partiful wasn't stripping GPS from photos (Oct 4, 2025)](https://techcrunch.com/2025/10/04/event-startup-partiful-wasnt-stripping-gps-locations-from-user-uploaded-photos/)
