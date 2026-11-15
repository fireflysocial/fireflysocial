# Safety & Privacy

How other products handle showing presence, consent, and safety, and what Firefly Social should adopt.

**Why this matters most for Firefly Social:** step 4 tells a room of strangers "*this person, here, right now, wants to meet people.*" That is the most sensitive thing the product does. It is also the thing that makes it useful. Get it wrong and Firefly Social becomes a tool for finding vulnerable, alone people at a known location.

## How others do it

| Product | Presence / visibility | Consent model | Blocking / reporting | Notes |
|---------|-----------------------|---------------|----------------------|-------|
| **Grindr** | Shows distance to nearby users, sorted by proximity. | Opt-out of showing distance. Auto-hidden in countries where being LGBTQ+ is dangerous. | Block, report. | Researchers repeatedly located users by **trilateration** (2014, 2016, BBC/Pen Test Partners 2019, KU Leuven 2024). **Hiding distance didn't help, because sort order still leaked location.** Grindr moved to snap-to-grid after admitting exact distances were "too high" a risk. |
| **happn** | Shows people you crossed paths with. | Opt-in location. | Block, report. | KU Leuven 2024: vulnerable to "rounded distance trilateration." |
| **Snap Map** | Friends-only map of your location. | Opt-in. **Ghost Mode** is the default once enabled. | Block, remove friend. | Launched 2017 to backlash from child-safety groups. Ghost Mode still lets you see others, and anyone with account access can turn sharing on. |
| **Strava** | Public activity maps and global heatmap. | Default-public activities. Privacy zones hide start and end near home. | Block, report. | 2018: the global heatmap **revealed military bases** and patrol routes. Aggregate data can be sensitive even when no individual is shown. |
| **Bumble / BFF** | Profile visible to people in your area and filters. | Mutual match before chat. | Block and report (covers off-app behaviour too), photo verification, optional ID-verified badge, private-image blur, snooze. | Recommends asking matches to verify before meeting. |
| **Tinder** | Distance shown (rounded). | Mutual swipe. | Block, report, "Are You Sure?" message warnings, **Share My Date** (share plan details with a friend), Noonlight emergency integration (US). | Safety centre with meeting-in-person guidance. |
| **Partiful** | Guest list visible to guests (host setting). Profiles and Mutuals. | **Crush:** anonymous, up to 10 per month, revealed only if mutual. | Block, report. | **Oct 2025: didn't strip GPS EXIF from uploaded photos**, readable from public Firebase storage. Fixed after TechCrunch report. |
| **Facebook Dating "Secret Crush"** | Hidden. | Notified only if both list each other. | Block, report. | Shows the double-blind mutual opt-in pattern is mainstream. |
| **Timeleft** | Tablemates revealed on arrival. Restaurant revealed the day before. | Mutual 4–5 rating unlocks 1:1 chat (historically). Anonymous "Impressions". | Report attendee. | No live location needed: **a fixed venue and a fixed time** solve "finding each other." |
| **Luma** | Guest list shown or hidden per host. | Host approval of RSVPs. | Host can remove guests. | Visibility is the host's choice, not the guest's. |
| **Brella / Swapcard** | Attendee directory within one event. | Request and accept meeting. | Organizer moderation. | Visibility is scoped to a single event and time window. |
| **Apple Find My / AirTags** | Precise location to chosen people. | Explicit share, per person. | **Unwanted-tracking alerts** (cross-platform standard with Google). | Industry precedent for **warning people they may be tracked**. |

## What the law requires (BC and Canada)

| Rule | What it means for Firefly Social |
|------|---------------------------|
| **BC PIPA** applies to private organizations in BC. Collection must be for purposes a reasonable person would consider appropriate, with notice and consent. | Every data point needs a stated purpose a user would find reasonable. "Open to meet" status and event attendance are personal information. |
| **Tim Hortons app investigation (OPC + BC OIPC + AB + QC, 2022):** tracked location 2,700+ times in 5 months, including while closed, and never used it for the stated purpose. Found unreasonable. **Granular location needs express, opt-in consent**, and a long privacy policy on a small screen may not count as notice. | No background location. If location is used at all, use **foreground-only, event-window-only**, and explain it in plain words at the moment of asking. |
| **PIPEDA** (federal) still applies to cross-border data. **Bill C-27 died** in 2025, and **Bill C-36** (Protecting Privacy and Consumer Data Act) was introduced Jun 15, 2026 with a definition of "sensitive information" that includes children's data. | Treat location, social handles, photos, and who-likes-whom as sensitive. Plan for C-36: data minimization, deletion on request, breach notification. |
| Age: Firefly Social is 18+. | Age gate plus verification. Minors' data is "sensitive" under C-36. |

## Principles for Firefly Social

1. **No maps, no distances, no live location. Ever.** Presence is **"checked in at this event"**, not coordinates. The venue is already public on the event page, so Firefly Social adds no new location information. This rules out the whole Grindr/happn class of attacks.
2. **Visible only to people at the same event, only during the event.** Visibility starts at check-in and ends automatically (e.g. event end + 1 hour). Nobody can browse who is "open to meet" across the city.
3. **Check-in must be proven, not claimed.** Use a host-displayed rotating QR code or host confirmation. You can't see the room unless you're in the room.
4. **Show less to strangers.** In-room cards show first name, photo, 2–3 interests, and a prompt. **No last name, socials, workplace, or school** until there's a mutual match.
5. **Mutual and private by default.** Socials and 1:1 chat unlock only on a mutual opt-in. Non-mutual choices are never revealed, and there is no "X viewed your profile."
6. **Platonic by policy, enforced.** Clear community rules: no dating, no selling, no recruiting. Repeated romantic or sales reports lead to a ban. The double opt-in reduces pressure, but rules set the norm.
7. **Verification before visibility.** Selfie liveness or photo verification is required before a user can appear in any room. Optional ID badge.
8. **One-tap block, report, and leave.** Available from every card. **Block is permanent and reciprocal**, and it removes both people from each other's rooms at future events silently. Leaving hides you instantly ("ghost mode at the event").
9. **The host is a safety ally.** Hosts see Firefly reports from their event and can remove someone. Firefly Social shares serious reports with the host (with reporter consent).
10. **Strip metadata and minimize storage.** Remove EXIF and GPS from every upload server-side. Use private storage with signed URLs. Delete in-room presence data after the event, keeping only "attended" for the user's own history.
11. **Safety features for the second meeting.** Before meeting one person 1:1, show "share plans with a friend" (like Tinder's Share My Date) and suggest public, event-based second meetings over private ones.
12. **No dark patterns.** No streaks that guilt people, and no showing "someone liked you" to push upgrades.

## Open risks

| Risk | Why it's hard | Mitigation to test |
|------|---------------|--------------------|
| **Targeting people who are alone.** "Open to meet" signals that someone came alone and wants to talk. A bad actor could buy a ticket specifically to find them. | Any visibility creates this, and it's the core feature. | Verification, check-in gating, women-only or gender-preference pods (opt-in), fast host-removal, report thresholds that auto-hide a user across all events. |
| **Off-platform harassment after a match.** | Once socials are exchanged, Firefly Social loses control. | Delay socials: unlock in-app chat first, socials only after a second meeting or on both people's request. Block-and-report covers off-app behaviour (as Bumble does). |
| **Aggregate leakage.** "How many Firefly users are going" plus the event's public guest list could identify individuals at small events. | Small numbers are identifying (Strava heatmap lesson). | Show counts only above a threshold (e.g. "5+ going"). Never show names before check-in. |
| **Screenshotting in-room cards.** | Can't prevent it technically. | Minimal card content, no last names, screenshot detection notice (iOS), watermark with viewer's name. |
| **Rejection still felt.** Seeing someone "open to meet" who doesn't pick you back could still sting. | The liking gap means people over-read silence. | Never show non-mutual outcomes. Frame matches as "keep meeting", not "chosen". |
| **Dating drift.** | Run clubs and events are already seen as dating venues (see [run clubs](competitors/clubs-and-run-groups.md)). | Platonic policy, report category "unwanted romantic advance", and mixed or same-gender pod preferences. |
| **Data breach of the "who-likes-whom" graph.** | Highly sensitive and embarrassing. | Encrypt opt-in choices, delete non-mutual choices after N days, minimize retention. |
| **Host misuse.** A host harvests the attendee interest data. | Hosts are partners, not data owners. | Hosts get aggregate stats only, never individual intent or picks. |
| **Minors at all-ages events.** | Public events may include under-18s. | Firefly Social is 18+. Users under 18 cannot be shown in rooms. Verification at signup. |

## Sources

- Grindr/trilateration: [BBC via Global Dating Insights (2019)](https://www.globaldatinginsights.com/news/grindr-and-romeo-found-to-expose-location-data-in-bbc-investigation/) · [Consumerist (2016)](https://consumerist.com/2016/05/23/turns-out-its-easy-to-pinpoint-a-grinder-users-location-even-with-privacy-settings-enabled) · [Engadget: KU Leuven, six dating apps (2024)](https://www.engadget.com/belgian-researchers-found-a-huge-privacy-hole-in-six-dating-apps-223227855.html)
- Snap Map: [CBS News](https://www.cbsnews.com/pittsburgh/news/snapchat-map-safety-concerns/) · [Tech Safety (NNEDV)](https://techsafety.org/blog/tag/location) · [Trusted Reviews](https://www.trustedreviews.com/news/snapchat-snap-map-2953805)
- Strava heatmap: widely reported Jan 2018 (e.g. The Guardian, "Fitness tracking app Strava gives away location of secret US army bases")
- Bumble: [Safety centre](https://bumble.com/safety) · [Support: safety features](https://support.bumble.com/hc/articles/28537051467293-Our-safety-features)
- Partiful: [TechCrunch GPS EXIF (Oct 2025)](https://techcrunch.com/2025/10/04/event-startup-partiful-wasnt-stripping-gps-locations-from-user-uploaded-photos/) · [Crush help](https://help.partiful.com/hc/en-us/articles/45086026179483-How-does-Crush-work)
- Timeleft: [After Dinner Feedback](https://help.timeleft.com/hc/en-150/articles/15095611119900-After-Dinner-Feedback)
- EFF: [Dating apps need to learn how consent works (2025)](https://www.eff.org/deeplinks/2025/07/dating-apps-need-learn-how-consent-works) · Mozilla: [dating apps data-hungry](https://www.mozillafoundation.org/sw/blog/everything-but-your-mothers-maiden-name-mozilla-research-finds-majority-of-dating-apps-more-data-hungry-and-invasive-than-ever)
- Canada/BC: [BC OIPC Tim Hortons report](https://oipc.bc.ca/investigation-reports/3673) · [OPC PIPEDA-2022-001](https://www.priv.gc.ca/en/opc-actions-and-decisions/investigations/investigations-into-businesses/2022/pipeda-2022-001) · [OPC meaningful consent guidelines](https://www.priv.gc.ca/en/privacy-topics/collecting-personal-information/consent/gl_omc_201805/) · [DLA Piper: Bill C-36 (Jun 2026)](https://www.dlapiper.com/insights/publications/2026/06/canada-tables-bill-c36-the-protecting-privacy-and-consumer-data-act) · [Gowling: understanding Bill C-36](https://gowlingwlg.com/en/insights-resources/articles/2026/understanding-bill-c36)
