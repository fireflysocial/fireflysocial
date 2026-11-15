# Open Gaps

Each gap: what's wrong → proposed fix → how we'll validate it (research source, pilot event, etc.).

- **Step** refers to [v1-user-flow.md](v1-user-flow.md) (v2 draft): 0 Onboarding · 1 Discover · 2 Join · 3 Before · 4 At event · 5 After · 6 Second meeting · 7 Ongoing · H Host flow · — Company-level.
- **Priority:** **P0** = could kill the product or harm users; must solve before the first pilot. **P1** = must solve before scaling past the pilot. **P2** = matters later.

## Summary: the 9 P0s

1 Cold start · 2 Event data access · 3 Finding each other · 5 Mutual match, then nothing · 8 Targeting people who are alone · 9 Organizer incentive · 11 No-shows · 36 Retention when it works · 46 No first-party interviews yet

---

## A. Supply & cold start

| # | Gap | Step | P | Proposed fix | How we'll validate |
|---|-----|------|---|--------------|--------------------|
| 1 | **Cold start:** user opens an event and 0 other Firefly users are going | 1 | P0 | Launch **one series at a time** (e.g. 3 run clubs, 2 games nights) until each has 8+ Firefly regulars, rather than spreading across the city. Firefly-run starter events as a fallback. Hide counts below 5 ("Be one of the first"). | Pilot with 2–3 partner series in one neighbourhood for 6 weeks. Measure % of events with ≥4 Firefly check-ins. |
| 2 | **Event data access:** Eventbrite and Luma APIs don't allow pulling public events | 1, H | P0 | **Confirmed by research:** Eventbrite search API shut down 2019–20. Luma API is scoped to calendars you manage (Plus). Meetup needs Pro + approval. → **Host partnerships** (host connects own key or enters manually) plus user-pasted links. No scraping (ToS and legal risk). | Done (desk research, [organizers.md](../research/organizers.md)). Validate that 5 hosts will connect a calendar in < 10 min. |
| 9 | **Organizer incentive:** why would hosts partner with Firefly Social? | H | P0 | Offer: (a) **newcomer retention** (people come back because they have friends there), (b) free promotion to Firefly users, (c) a 60-second intro script and meeting-point kit, (d) aggregate stats on returning attendees. Free for hosts. | 10 host interviews (run clubs, board-game cafés, language exchanges). Pilot: compare returning-newcomer rate at Firefly Social vs. non-Firefly weeks. |
| 12 | **Host burden:** hosts are volunteers; adding a corner, QR code, and intro takes effort | H, 4 | P1 | Make the corner optional. Firefly Social provides a printed sign plus static QR fallback. A volunteer **"pod host"** (experienced Firefly user) runs the corner instead of the organizer. | Time-and-motion at pilot: host setup must be < 5 min per event. |
| 13 | **Host quality varies:** dead groups, MLM fronts, "networking" events disguised as social | 1 | P1 | Manual vetting of partner hosts. Auto-flag events with low return rates or sales reports. | Track report rate per host. Delist below threshold. |
| 14 | **Platform dependency:** Luma/Meetup/Eventbrite (now Bending Spoons-owned) could block or compete | 1, H | P2 | Never depend on one platform. Firefly Social's own RSVP layer works with any event. The relationship is with the host, not the platform. | Quarterly review of API terms. |
| 15 | **Category coverage:** partner events skew to tech and running; not everyone runs or codes | 1 | P1 | Recruit across categories deliberately: games, crafts, outdoor, food, language, faith-neutral volunteering, LGBTQ+, newcomer-specific. | Onboarding interest data vs. available event categories. Gap report monthly. |
| 16 | **Cost barrier:** Vancouver is expensive, and paid events exclude people | 1 | P1 | "Free / under $20" filter by default. Prioritize free recurring events (run clubs, park meetups, library events). | Share of RSVPs to free vs. paid events. Survey drop-off reasons. |

## B. In the room

| # | Gap | Step | P | Proposed fix | How we'll validate |
|---|-----|------|---|--------------|--------------------|
| 3 | **Finding each other in the room:** how do people locate one another at a crowded event? | 4 | P0 | **Fixed meeting point and time** set by host ("Firefly corner, 6:45"), a pod chat 30 min before, a host intro, and physical marker optional (sticker or lanyard). **No live location.** | Pilot: % of pod members who meet within 10 min of the set time. Target ≥ 80%. |
| 6 | **Groups vs. pairs:** friendships often form in groups of 3–6, not one-on-one | 3–6 | P1 | **Pods of 3–5** (conversation limit ≈ 4, Dunbar 1995). Group thread when 2+ pod members are mutual. Re-pod the same people at the next event. | A/B at pilot: pod of 4 vs. open room. Compare mutual-match rate and 21-day re-meet rate. |
| 11 | **No-shows:** a pod of 4 with 2 no-shows becomes an awkward pair | 3–4 | P0 | Pod commitment nudge. Penalty-free cancel up to 24h. Reliability score affects pod priority. Over-form pods (5 for a target of 4). Merge half-empty pods at the corner. | Measure no-show rate per event. Target < 15%. Get a baseline from partner hosts' own no-show data first. |
| 17 | **Pod chemistry fails:** one dominant person, or a pod that just doesn't click | 4 | P1 | After 20 min the "room" opens so people can drift. Prompts are "both answer" (Sprecher 2013). Feedback trains future pods (222-style). | Post-event pod rating. Track % pods rated ≤2/5. |
| 18 | **Awkwardness of the app at a social event:** looking at phones kills conversation | 4 | P1 | The phone is used at check-in and then put away. Everything else happens after the event. No in-event feed. | Observe at pilot. Time-in-app during event should be < 2 min. |
| 19 | **Not everyone at the event is on Firefly Social:** Firefly users cluster and ignore non-users | 4 | P2 | Host frames it as "newcomers' welcome" open to anyone. Non-users can join the corner. QR code for instant signup. | Host feedback. % of corner joiners who are new signups. |
| 20 | **Introverts and social anxiety:** even with a pod, walking up is hard | 4 | P1 | Pod reveal with photos beforehand. Missions give a reason to talk. Option to arrive with a "buddy" assigned 1:1 first. Liking-gap and strangers research shown in-app. | Survey self-rated anxiety before vs. after 3 events. |
| 21 | **Loud or large venues** (bars, concerts) make conversation impossible | 1, 4 | P2 | Only enable Firefly Social at events with a talking component. Host self-selects venue type. | Event-type vs. match-rate analysis. |

## C. After the event & second meeting

| # | Gap | Step | P | Proposed fix | How we'll validate |
|---|-----|------|---|--------------|--------------------|
| 4 | **Post-event drop-off:** users don't return to choose connections | 5 | P1 | Prompt within 2h while it's fresh. Fast UI (one tap per person). Morning reminder. 72h window. Pod faces shown so no memory is needed. | % completing "keep meeting" within 24h. Target ≥ 70% (set at pilot; no public benchmark found). |
| 5 | **Mutual match, then nothing:** swapping socials doesn't guarantee a second meeting | 6 | P0 | Replace "swap socials" with **"same time next week?"**: a specific next event suggested with one-tap commitment. Re-pod together. Plan template if no event fits within 21 days. | **North-star:** % of mutual connections meeting again within 21 days. Compare to a control group given socials only. |
| 22 | **Liking gap suppresses picks:** people don't choose others because they assume it isn't mutual | 5 | P1 | Show the finding at the pick screen. Make picks cheap and private ("keep meeting", not "I like you"). | A/B test the liking-gap message. Measure picks per user. |
| 23 | **Memory problem:** "Who was the person in the blue jacket?" | 5 | P1 | The pick screen shows pod and room people with photos. Users can tap "met" on cards during the event. | % of picks made from the "met" list vs. pod. |
| 24 | **Asymmetric interest** (A wants to meet again, B doesn't): A keeps seeing B at the same series | 5–7 | P2 | Non-mutual picks are never shown. Re-podding only happens if mutual. Block is available if needed. | Qualitative interviews. Report rate. |
| 25 | **Scheduling friction for the second meeting** | 6 | P1 | Default to the next instance of the same recurring event (zero scheduling). Otherwise a 3-option time poll. | Time from match to confirmed second meeting. |
| 26 | **Connection decay:** after 2–3 meetings, contact stops | 7 | P1 | Fade alerts at ~3 weeks. "Send a quick hi" nudge (Liu 2023). Circles book their own monthly plan. | Hours-together curves per connection at 30/60/90 days. |
| 27 | **Transition to "real" friendship:** meeting only at events keeps people as "run-club friends" | 7 | P1 | After 3 event meetings, suggest a **non-event plan** (coffee, a walk). Celebrate "first hangout outside an event." | 90-day survey: "hung out with a Firefly connection outside an event?" Target ≥ 30%. |

## D. Trust, safety & misuse

| # | Gap | Step | P | Proposed fix | How we'll validate |
|---|-----|------|---|--------------|--------------------|
| 7 | **Misuse:** used for dating or networking spam | All | P1 | Platonic pledge at onboarding. Report categories "unwanted romantic advance" and "selling or recruiting". Strike system. Same-gender or mixed pod preference. | Report rate per 100 events. Qualitative interviews with women users specifically. |
| 8 | **Safety and privacy:** showing who is present and open to talk lets bad actors target people who are alone | 4 | P0 | **Full model in [safety-privacy.md](../research/safety-privacy.md):** no location or distance; visible only after QR check-in and only during the event window; first name only; verified profiles; one-tap hide, block, and report; host can remove. | Pre-pilot threat-model review. Pilot safety survey ("Did you feel safe?" ≥ 90% yes). Zero serious incidents. |
| 28 | **Fake or impersonation accounts** | 0 | P1 | Selfie liveness check required to appear in rooms. Optional ID badge. One account per phone number. | Verification pass rate. Fake-account reports. |
| 29 | **Off-platform harassment after socials exchanged** | 6 | P1 | Socials never automatic. Chat first. Block-and-report covers off-app conduct. Banned users are removed from all events. | Report follow-up audits. |
| 30 | **Who-likes-whom data breach** | 5 | P1 | Encrypt picks. Delete non-mutual picks after 30 days. Strip EXIF/GPS from photos (Partiful lesson). Private storage with signed URLs. | Security review before launch. Annual pen test. |
| 31 | **Privacy law compliance (BC PIPA, PIPEDA, upcoming Bill C-36)** | All | P1 | Plain-language consent at each sensitive moment. No background location. Data minimization. Deletion on request. Breach plan. | Privacy review with a BC privacy lawyer or clinic before public launch. |
| 32 | **Minors at all-ages events** | 0, 4 | P1 | 18+ only, enforced at verification. | Verification audit. |
| 33 | **Host misuse of attendee data** | H | P2 | Hosts get aggregate stats only. No individual intent or picks. Partner agreement. | Partner agreement review. |
| 34 | **Small-event re-identification** ("2 Firefly users going" plus the public guest list) | 1 | P2 | Count threshold (≥ 5) before showing any number. | Desk review of event-size distribution. |
| 35 | **Emergency or crisis situations** (user in distress, unsafe second meeting) | 4, 6 | P2 | "Share plans with a friend" before 1:1 meetups. Link to local crisis resources (e.g. 9-8-8 Canada). Escalation path for serious reports. | Safety runbook reviewed before pilot. |

## E. Retention, motivation & product–market fit

| # | Gap | Step | P | Proposed fix | How we'll validate |
|---|-----|------|---|--------------|--------------------|
| 36 | **Retention when it works:** once users have friends, they leave (the friendship-app paradox) | 7 | P0 | Treat graduation as success. Turn graduates into **pod hosts** for newcomers. Keep value for established circles (planning their monthly hangout). Revenue doesn't depend on lonely-user subscriptions alone. | Track graduated-user activity. % becoming pod hosts. |
| 37 | **Low urgency:** friendship is less urgent than dating, so users don't push through friction (TNW 2026) | 1–2 | P1 | Target moments of high need: **newcomers in their first 3 months**, co-op and new grad cohorts, post-breakup or post-move. Partner with universities, employers, and immigration services. | Activation rate by user segment. |
| 38 | **Stigma of a "friend app"**: people don't want to admit they're lonely | 0, 1 | P1 | Position as "**get more out of the events you already go to**" and "**new in town**," not "lonely." Pod language, not "match." | Message testing on landing pages (A/B conversion). |
| 39 | **One-and-done users:** attend one event, have a mediocre pod, never return | 2–5 | P1 | Follow-up "try a different series" with a better-matched pod. 222's advice: judge after ~5 events. Starter "3 events in 3 weeks" path. | Event-2 return rate. Target ≥ 50%. |
| 40 | **Measuring real outcomes:** downloads and matches don't equal friendships | 7 | P1 | North star = re-meet within 21 days. Outcome = loneliness score (StatCan wording) at 0/30/90 days. | Built into the flow (steps 0, 7). |
| 41 | **Demographic imbalance** (e.g. mostly women, as on Bumble BFF; mostly tech workers) | 0, 3 | P2 | Monitor pod composition. Targeted outreach. Category diversity (#15). | Monthly demographics dashboard. |
| 42 | **Accessibility:** mobility, hearing, neurodivergence, language barriers for newcomers | 1, 4 | P2 | Accessibility tags on events. Quieter-venue filter. Multilingual onboarding. Language-exchange events as a category. | Accessibility audit. Newcomer-specific interviews. |

## F. Business

| # | Gap | Step | P | Proposed fix | How we'll validate |
|---|-----|------|---|--------------|--------------------|
| 10 | **Business model:** how Firefly Social sustains itself | — | P1 | Options to test, in order: (1) **B2B2C**: employers, universities, and co-op programs pay for newcomer onboarding (like event-networking apps where the organizer pays); (2) **venue partnerships** (cafés and bars pay for featured Firefly corners that bring regular groups); (3) optional user "Plus" (more pods per week, priority) that never gates safety or matching. Avoid charging hosts (Meetup lesson). | Willingness-to-pay interviews with 5 employers/universities and 5 venues. LOI before building billing. |
| 43 | **Competitive response:** Partiful adds a platonic Crush, Timeleft adds recurring tables, Luma adds in-room matching | — | P1 | The moat is **host relationships plus the pod-to-circle loop on recurring events**, not any single feature. Win Vancouver density first. | Monitor competitor changelogs quarterly ([competitors/](../research/competitors/)). |
| 44 | **Ops cost of starter events** (Dinner Lab lesson) | 1 | P2 | Starter events are cheap (walks, park games, library rooms) and stop once partner density exists. | Cost per starter event. Sunset criteria. |
| 45 | **Moderation cost scales with users** | All | P2 | Host-assisted moderation. Report thresholds that auto-hide. Verified-only rooms. | Reports per moderator hour. |

## G. Validation gaps (research we still need)

| # | Gap | Step | P | Proposed fix | How we'll validate |
|---|-----|------|---|--------------|--------------------|
| 46 | **No first-party user interviews yet** | — | P0 | 15 interviews: newcomers (< 1 yr in Vancouver), co-op students, run-club regulars. Add them to [interviews/](../research/interviews/synthesis.md). A synthesis of 15 pre-existing sources is already done; first-party interviews should probe the gap it found (people who tried a friendship app and quit). | Synthesis complete before pilot design is frozen. |
| 47 | **No Vancouver organizer list** | H | P1 | Build [organizers.md](../research/organizers.md) table: 30 recurring Vancouver events across categories. **7 listed so far** (mostly running, walking, and newcomer groups; see #15 on category coverage). | List complete. 10 contacted. |
| 48 | **Unverified assumption that people will mark themselves "open to meet" publicly** | 2, 4 | P1 | Concierge MVP: a manual pilot with a printed sign and a Google Form before building the app. | % of attendees who opt in when asked at the door. |
