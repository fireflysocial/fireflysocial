# User Flow (v3 Draft)

> **Update 2026-11-25:** [v4-user-flow.md](v4-user-flow.md) is now the spec for launch: no hosts, no groups, an easy onboarding and a personal feed of events found across the city. This v3 flow remains the reference for the next phase (pods, the Firefly corner, picks, chat, check-in) and for hosts (long-term). It will be redesigned on top of v4.

> **Update 2026-11-27:** the group features (pods, the pod reveal, picks, sharing socials) are redesigned in [connection-flow.md](connection-flow.md): pods form by each person's intent for the event, and pod-mates see intents and interests only. Where the two differ, connection-flow.md is the newer draft. Hosts, check-in, the room, circles and trust and safety operations below are unchanged.

> Builds on the v2 draft ([v1-user-flow.md](v1-user-flow.md)) and folds in the proposed fix for every gap in [open-gaps.md](open-gaps.md). Each fix is tagged with its gap number, e.g. **[#11]**. The [gap traceability table](#gap-traceability) at the end maps all 52 gaps to where they're handled.

**Platforms:** Firefly ships as **iOS and Android apps** (App Store and Google Play) plus a web version, from one codebase. Push notifications, QR check-in and the in-app browser in this flow assume the native apps. See [engineering/quality-and-ci.md §0](../engineering/quality-and-ci.md#0-platforms-ios-android-and-web).

**Status:** proposed design, not implemented behavior. Putting a fix into the flow closes the gap *in the design* only. Targets, timings and group sizes still need pilot validation, and some gaps can only be closed by work outside the product (interviews, legal review). Those are listed as [pre-pilot gates](#pre-pilot-gates). See the [documentation audit](../research/documentation-audit.md).

## What changed from v2

| v2 | v3 | Gaps |
|----|----|------|
| Gap fixes lived in a separate table | Fixes are built into each step of the flow | All |
| Host and Firefly were the only roles | Four roles: attendee, partner host, **pod host** (volunteer), Firefly team | #12, #36, #45, #50 |
| One event type plus a city list | Three event types (partner, Around the city, starter), each with its own meeting point, check-in and moderation rules | #44, #49, #50 |
| No-shows handled by a nudge | Over-formed pods, a reliability score, and merging half-empty pods at the corner | #11 |
| No recovery after a bad first event | A "try a different series" path and a "3 events in 3 weeks" starter path | #39 |
| Validation work mixed into the design | Separate **pre-pilot gates** that must be cleared before the first pilot | #8, #9, #30–32, #35, #46–48 |

---

## Principles (apply to every step)

- **No live location, ever.** No maps, distances or background location. People find each other through a fixed meeting point and time. **[#3, #8, #31]**
- **Collect only what's needed, and ask at the moment it matters.** Consent is in plain language and requested at each sensitive step (pod reveal, room visibility, sharing socials). **[#31]**
- **The phone goes away at the event.** It's used at check-in and then put down. There's no in-event feed; picks happen afterwards. **[#18]**
- **Good intent only.** Every user agrees to the respect pledge, and the report options cover unwanted advances and selling or spam. **[#7]** (Revised 2026-11-25: Firefly is for people with a shared purpose, not friendship alone.)
- **Positioned as "get more out of the events you already go to" and "new in town"**, never "lonely." The product says "pod" and "keep meeting," not "match." **[#38]**
- **No dependence on any one platform.** Firefly's own RSVP layer works with any event; the relationship is with the host, not with Luma, Meetup or Eventbrite. **[#14]**
- **Events must involve talking.** Concerts, loud bars and large-venue events aren't eligible. **[#21]**

---

## Pre-pilot gates

These P0 and P1 gaps can't be closed by designing the flow. Each one must be done before the first pilot that involves real users' personal information.

| Gate | Done when | Gaps |
|------|-----------|------|
| **Concierge pilot** | 2–3 events run with a printed sign, a Google Form and pods matched by hand over text, measuring opt-in at the door | #48 |
| **First-party user interviews** | 15 interviews (newcomers < 1 yr, co-op students, run-club regulars), including people who tried a friendship app and quit; added to [interviews/](../research/interviews/synthesis.md) | #46 |
| **Host interviews** | 10 organizer interviews (run clubs, board-game cafés, language exchanges) on the value offer and the time they'd spend | #9 |
| **Organizer list** | 30 recurring Vancouver events across categories in [organizers.md](../research/organizers.md); 10 contacted | #47, #15 |
| **Privacy review** | Review with a BC privacy lawyer or clinic (BC PIPA, applicable PIPEDA), with a breach plan and retention rules decided | #31, #30 |
| **Age assurance** | An 18+ check that's separate from phone and selfie checks, chosen and tested | #32 |
| **Threat model** | Written review of how a bad actor could use pods, room visibility and picks | #8 |
| **Safety runbook** | Escalation path for serious reports, current local crisis-resource links, reviewed | #35 |
| **Security review** | Picks encrypted, photos stored privately with signed URLs, EXIF/GPS stripped; review passed | #30 |

---

## Roles

| Role | Who | Does |
|------|-----|------|
| **Attendee** | Newcomers and anyone looking for their people (friends, a network, collaborators) | Joins events, meets their pod, picks who to keep meeting |
| **Partner host** | Organizer of a recurring event who has partnered with Firefly | Runs the event; optionally runs the Firefly corner |
| **Pod host** | Experienced Firefly user, volunteering | Runs the Firefly corner in place of a busy host, or at events with no host **[#12, #36]** |
| **Firefly team** | Staff | Vets hosts, curates the city list, runs starter events, handles all moderation **[#13, #44, #45, #49]** |

## Event types

| | **Partner event** | **Around the city** | **Starter event** |
|---|---|---|---|
| Source | Host connects a Luma calendar, Meetup group, or enters events by hand **[#2]** | Curated by hand by the Firefly team, 20–40 per week in 1–2 neighbourhoods; no scraping **[#49]** | Run by Firefly: walks, park games, library rooms **[#44]** |
| Registration | Host's normal flow | Link out to the event's own page, then confirm on return **[#51, #52]** | In Firefly |
| Meeting point | Set by host | Set by Firefly: a public spot near the entrance **[#50]** | Set by Firefly |
| Check-in | Host's rotating QR, or host confirms in person **[#12]** | Pod host's QR, or a code from pod chat confirmed by a pod-mate **[#50]** | Pod host or Firefly staff QR |
| Pods offered | Always, if enough RSVPs | Only at public venues, above a minimum number of confirmed users **[#50]** | Always |
| Moderation | Host can remove, Firefly reviews | Firefly only **[#50]** | Firefly only |
| Lifespan | Ongoing | Promoted to partner after 3+ Firefly registrations | Stopped once partner events in that area are busy enough **[#44]** |

---

## Host flow

### H1. Vetting and onboarding

- **Manual vetting** by the Firefly team before a host goes live, screening out dead groups, MLM fronts and sales events presented as social ones. **[#13]**
- Host connects a series: Luma calendar key, Meetup group, an Instagram-run club, or manual entry. Target: under 10 minutes. **[#2]**
- Host signs a **partner agreement**: aggregate data only, plus account details only when needed to handle a report; never private picks. **[#33]**
- **What the host gets, for free:** newcomers who keep coming back because they've made friends, promotion to Firefly users, a meeting-point kit and intro script, and stats on returning attendees. **[#9]**
- Recruitment covers many categories on purpose: games, crafts, outdoor, food, language exchange, faith-neutral volunteering, LGBTQ+, newcomer groups. **[#15]**

### H2. Setup per event

- Host turns on "Firefly at this event," picks a **meeting point** and time, and gets a **rotating check-in QR**, a **printed sign**, and a 60-second intro script. Target: under 5 minutes. **[#12]**
- **The corner is optional for the host.** They can hand it to a pod host. **[#12]**
- Host tags the event: cost, venue type (talking-friendly or not), and accessibility (step-free, quiet, language). **[#16, #21, #42]**

### H3. During the event

- Live count of pods checked in. Counts only, no names or picks.
- **Fallback check-in:** if a phone can't scan, the host confirms the person in the app. A reused static QR alone never opens room visibility. **[#12]**
- Host frames the corner as a **"newcomers' welcome"** open to anyone. Non-users can join and sign up from a QR on the sign. **[#19]**
- **Moderation view:** shows only the reported account and the details needed, so the host can remove someone without seeing private picks. **[#8, #33]**

### H4. After the event

- Aggregate stats: Firefly attendees, % returning next time, **newcomer retention compared with weeks without Firefly**, anonymous feedback. **[#9]**
- **Quality flags:** events with low return rates or reports of selling are flagged for Firefly review. Hosts below the threshold are delisted. **[#13]**
- **Hosts never see individual intent or matches.**

---

## Attendee flow

### 0. Onboarding (≈3 minutes)

- **Ways in:** the App Store or Google Play, a QR at a Firefly corner **[#19]**, or a partner channel (universities, co-op programs, employers, immigrant-services groups) aimed at people at high-need moments. **[#37]**
- **Before launch: the public landing page.** Proposal: a web page that explains the pod idea and collects an email address for an invite when the first pods open. Its UI was built on 2026-11-25 (`src/features/landing/`). The form is **not connected yet**: storing emails needs a table with RLS, a retention rule (delete once the person is invited or unsubscribes) and a line in the privacy review before it goes live. Attendees only; hosts get their own page later.
- **Verify:**
  - Phone number, **one account per phone number**. **[#28]**
  - **Selfie liveness check**, required before a user can appear in any pod or room. **[#28]**
  - **Age check (18+)** using the method chosen in the age-assurance gate. Liveness does not prove age. **[#32]**
  - Optional ID badge for users who want extra trust. **[#28]**
- **Profile (kept small):** first name, photo (EXIF and GPS removed on upload **[#30]**), neighbourhood (optional), 3–5 interests, "new to [city]?" with when, and 2 short "both-answer" prompts. **[#17]**
- **Life stage (optional):** newly arrived, student or co-op, new grad, recently moved, other. Used to measure who benefits most; never shown to others. **[#37]**
- **Respect pledge:** "I'm here to meet people with good intent. No selling, no spam, no unwanted advances." **[#7]**
- **Preferences:**
  - Pod makeup: mixed / same gender / no preference. **[#7]**
  - Free times per week.
  - Budget, **defaulting to free / under $20**. **[#16]**
  - Accessibility needs (optional, private): step-free access, quieter venues, captions or hearing support. **[#42]**
  - App language. Onboarding is available in several languages. **[#42]**
- **Socials (optional, private):** stored but hidden until the user shares them with a specific match. **[#29]**
- **Baseline check-in:** "How often do you feel lonely?" (StatCan wording). **[#40]**

### 1. Discover

- **Start dense, not wide.** The pilot covers 2–3 partner series in one neighbourhood until each has 8+ Firefly regulars. **[#1]**
- The home screen shows **this week's events**:
  - **Partner events first**, recurring series at the top ("Every Tue · Kits Beach Run Club"), each with "Firefly corner at 6:45pm."
  - **Around the city** below, with a "Register on Luma / Eventbrite / Meetup ↗" button. **[#49]**
  - **Starter events** when nothing else fits. **[#1, #44]**
- **Counts are hidden below 5** ("Be one of the first"), so people can't be identified by matching a small count against a public guest list. **[#1, #34]**
- **Filters:** free / under $20 (on by default) **[#16]**, category **[#15]**, accessibility and quieter venues **[#42]**, language exchange **[#42]**.
- **New-user path:** "3 events in 3 weeks" suggests three events in a row, so one bad first pod isn't the whole experience. **[#39]**
- **Promotion to partner:** 3+ Firefly registrations at a city event triggers an invite to its organizer.

### 2. Join

- **Partner and starter events:** RSVP through the usual flow and tap **"I'm going, put me in a pod."**
- **Around-the-city events (register and return):**
  1. **Register ↗** opens the event's page in the in-app browser, or Firefly notices when the app is reopened.
  2. On return: **"Did you register for Kits Comedy Night?"** → **Yes, I'm registered** / **Not yet, remind me** / **Not going**. **[#52]**
  3. **Yes** counts as "put me in a pod." It's self-reported; check-in confirms attendance. **[#51]**
  4. A dismissed prompt becomes a home-screen card, not a repeat pop-up. The card expires when pods form. **[#52]**
  5. Free events with no registration show **"I'm going"** directly.
- **Consent at RSVP:** the user agrees to the pod reveal (step 3). Saying no means no pod for this event. **[#8, #31]**
- **Buddy option:** "I'd like to meet one person first." The user is paired 1:1 before joining the pod. **[#20]**
- **Commitment nudge:** "4 people will be counting on you." **[#11]**
- **Cancel with no penalty** up to 24h before. Not showing up without cancelling lowers the user's **reliability score**, which lowers their priority in future pods. **[#11]**

### 3. Before the event (24h → 30 min before)

- **24h before: pods form.**
  - **Over-formed:** 5 people for a target of 4, so one no-show doesn't leave a pair. **[#11]**
  - Balanced on shared interests, newcomer status and pod preferences. Overall pod makeup (gender mix, occupation) is tracked monthly so imbalance is caught early. **[#41]**
  - **People are re-podded together only if both said "keep meeting."** **[#6, #24]**
  - **Pilot variant:** some events use an open room with no pods, to test whether pods help. **[#6]**
- **Around-the-city checks:** the Firefly team re-checks the listing for cancellations or sell-outs **[#51]**. If confirmed users are below the minimum, users get "No pod this time" with a partner event suggestion. **[#50]**
- **Pod reveal:** pod members see first names, photos, interests and one prompt answer, so the faces are familiar on arrival. **[#20]**
- **Pod chat opens 30 min before:** "I'm in the green jacket," "running 5 min late." **[#3]**
- One **conversation starter** for the pod, getting deeper with each meeting (Aron 1997, Kardas 2022).

### 4. At the event

- **Check in** (method depends on event type; see [Event types](#event-types)). Only checked-in users appear in the wider room. Check-in reduces relayed-QR abuse but isn't perfect proof of presence. **[#12, #50]**
- **Meet at the Firefly corner** at the set time. The sign plus an optional **sticker or lanyard** makes the group easy to spot. **[#3]**
- **The host or pod host does a 60-second intro.** Non-Firefly attendees are welcome to join. **[#19]**
- **Half-empty pods merge** at the corner, so nobody is left in a pair. **[#11]**
- **Pod first, room second.** After ~20 min the room opens, so anyone whose pod isn't clicking can move around. **[#17]**
- **Tap "met"** on the card of anyone met in the room, so they show up at pick time. **[#23]**
- **Optional mission:** one light challenge ("Find someone else who moved here this year"). **[#20]**
- **Then the phone goes away.** Target: under 2 minutes in the app during the event. **[#18]**
- **Always available:** Hide me, block, report (with "unwanted advance" and "selling or spam" options **[#7]**), leave, and **local crisis resources** **[#35]**. A host or Firefly can remove someone on the spot. **[#8]**
- **Live room visibility ends** one hour after the event. Pod and "met" cards stay in a restricted picker for 72 hours. Block or hide removes access immediately. **[#8]**

### 5. After the event (same night, within 2 hours)

- **Push notification within 2 hours:** "Who would you like to keep meeting?" **[#4]**
- **The pick screen shows photos** of the user's pod and everyone they tapped "met," so they don't need to remember names. **[#23]**
- **Liking-gap message on the pick screen:** "People usually underestimate how much others enjoyed talking to them" (Boothby 2018). **[#22]**
- **One tap per person:** **Keep meeting** / **Not this time**. Picks are private and low-stakes, and they're encrypted. **[#22, #30]**
- **Mutual "keep meeting"** unlocks 1:1 chat. A group thread needs every member to opt in; A–B and B–C matches don't imply A–C. **[#6]**
- **Non-mutual picks are never shown** and are deleted after 30 days, subject to the privacy review's retention rules. **[#24, #30]**
- **Feedback:** rate the event and the pod, plus **"Did you feel safe?"** and an optional "report a concern." **[#8, #17]**
- **Reminder the next morning; picks close after 72 hours.** **[#4]**
- **Recovery after a bad event:** if the user rated their pod 2/5 or lower, or got no mutual matches, Firefly suggests **"try a different series"** with a better-matched pod. **[#17, #39]**

### 6. Second meeting (the critical step)

- With every new connection or group, Firefly **suggests a specific next event**: "Kits Run Club is on again next Tuesday. Want to go together?" One tap means "I'm in," and both see it. **[#5]**
- **Recurring event? The default is "same time next week,"** re-podded together. Nothing to schedule. **[#5, #25]**
- **Otherwise:** a 3-option time poll **[#25]**, or a low-cost plan template (coffee walk, food-truck lunch) in a public place if no shared event fits within 21 days. **[#5]**
- **Before a 1:1 plan outside an event:** "Share plans with a friend." **[#35]**
- **Chat comes first; socials are optional.** Either person can share Instagram or LinkedIn later, never automatically. **[#29]**
- **Bans apply everywhere.** Block and report cover behaviour off the app, and a banned user is removed from all events. **[#29]**

### 7. Ongoing: from pod to circle

- **Circle view:** people the user has met 2+ times, with estimated shared-event hours and the last time they were at an event together.
- **Fade alerts:** after ~3 weeks without meeting, "Send a quick hi?" plus the next shared event. **[#26]**
- **Beyond events:** after 3 event meetings, Firefly suggests a non-event plan (coffee, a walk) and celebrates the **first hangout outside an event**. **[#27]**
- **Pod graduation:** a group that has met 3+ times can become a **recurring circle** that books its own monthly plan in Firefly. Graduating counts as success, not churn. **[#26, #36]**
- **Pod hosts:** users with established circles can volunteer to welcome newcomers at their regular event, which also lightens the load on partner hosts. **[#12, #36]**
- **Check-ins at 30 and 90 days:** the loneliness question again, and "Have you hung out with anyone from Firefly outside an event?" **[#27, #40]**

---

## Trust and safety operations

- **Moderation is run by the Firefly team**, with hosts helping at partner events. **[#45]**
- **Auto-hide** an account once reports pass a threshold, pending review. **[#45]**
- **Strike system** for pledge violations. **[#7]**
- **Only verified users** appear in pods or rooms. **[#28, #45]**
- **Escalation path** for serious reports, from the safety runbook. **[#35]**
- **Data handling:** picks encrypted; photos stored privately behind signed URLs; deletion requests honoured subject to the legal retention rules; breach plan in place. **[#30, #31]**

## Business model (not part of the first build)

These shape the design but aren't built until willingness to pay is tested. **[#10]**

1. **Partner channels:** universities, co-op programs and employers pay for newcomer onboarding. This is the same channel as onboarding's ways in. **[#10, #37]**
2. **Venues:** cafés and bars pay to host featured Firefly corners. **[#10]**
3. **Optional "Plus" for users:** more pods per week, priority placement. Never gates safety or matching. **[#10]**

What competitors can't easily copy is the **host relationships plus the pod-to-circle loop on recurring events**, built city by city across several countries, starting with Vancouver. Competitor changelogs are reviewed quarterly. **[#43]**

---

## Key metrics and targets

All targets are proposals to confirm in the pilot.

| Step | Metric | Target | Gap |
|------|--------|--------|-----|
| H1 | Time for a host to connect a calendar | < 10 min | #2 |
| H2 | Host setup time per event | < 5 min | #12 |
| H4 | Returning-newcomer rate, weeks with vs. without Firefly | Higher with Firefly | #9 |
| 1 | % of pilot events with ≥4 Firefly check-ins | Set at pilot | #1 |
| 1–2 | % of active users who RSVP to ≥1 event per month; % of Register taps confirmed "Yes" | Set at pilot | #51, #52 |
| 3 | Pod fill rate; no-show rate | No-show < 15% | #11 |
| 4 | % of pod members who meet within 10 min of the set time | ≥ 80% | #3 |
| 4 | Time in app during the event | < 2 min | #18 |
| 5 | % completing "keep meeting" within 24h; mutual-match rate | ≥ 70% | #4 |
| 5 | "Did you feel safe?" | ≥ 90% yes, zero serious incidents | #8 |
| 5 | % of pods rated 2/5 or lower | Set at pilot | #17 |
| 2–5 | Users who return for a second event | ≥ 50% | #39 |
| 6 | **% of mutual connections meeting again within 21 days (north star)** | Set at pilot | #5, #40 |
| 7 | Hung out with a Firefly connection outside an event, at 90 days | ≥ 30% | #27 |
| 7 | Change in self-reported loneliness at 30 / 90 days (descriptive, not causal) | — | #40 |

---

## Gap traceability

**Status key:** **Designed** = the fix is in the flow above. **Gate** = needs work outside the product before the pilot. **Pilot test** = designed, but the pilot must confirm it works. **Later** = designed, not in the first build.

| # | Gap | Handled in | Status |
|---|-----|-----------|--------|
| 1 | Cold start | Discover (dense pilot, hidden counts, starter events) | Pilot test |
| 2 | Event data access | Event types; H1 | Designed |
| 3 | Finding each other | Principles; Before (pod chat); At event (corner, marker) | Pilot test |
| 4 | Post-event drop-off | After (2h prompt, reminder, 72h) | Pilot test |
| 5 | Mutual match, then nothing | Second meeting | Pilot test |
| 6 | Groups vs. pairs | Before (pods, pilot variant); After (group consent) | Pilot test |
| 7 | Unwanted advances and spam | Principles; Onboarding (pledge, pod makeup); At event (report options); T&S (strikes) | Designed |
| 8 | Targeting people who are alone | Principles; Join (consent); At event; After (safety survey); threat-model gate | Gate |
| 9 | Organizer incentive | H1 value offer; H4 stats; host-interview gate | Gate |
| 10 | Business model | Business model | Later |
| 11 | No-shows | Join (nudge, reliability score); Before (over-forming); At event (merging) | Pilot test |
| 12 | Host burden | Roles (pod host); H2 (optional corner, kit); H3 (fallback check-in) | Pilot test |
| 13 | Host quality | H1 vetting; H4 flags | Designed |
| 14 | Platform dependency | Principles | Designed |
| 15 | Category coverage | H1 recruitment; Discover filters; organizer-list gate | Gate |
| 16 | Cost barrier | Onboarding budget default; Discover filter; H2 tags | Designed |
| 17 | Pod chemistry | Onboarding prompts; At event (room opens); After (rating, recovery) | Pilot test |
| 18 | Phones at the event | Principles; At event | Pilot test |
| 19 | Non-users at the event | Onboarding (QR); H3; At event | Designed |
| 20 | Introverts and anxiety | Join (buddy); Before (pod reveal); At event (mission) | Pilot test |
| 21 | Loud venues | Principles; H2 venue tag | Designed |
| 22 | Liking gap | After (message, private picks) | Pilot test |
| 23 | Remembering people | At event ("met"); After (photos) | Designed |
| 24 | One-sided interest | Before (re-pod only if mutual); After (never shown) | Designed |
| 25 | Scheduling friction | Second meeting (default next week, poll) | Designed |
| 26 | Connection decay | Ongoing (fade alerts, circles) | Pilot test |
| 27 | Event-only friendships | Ongoing (non-event plan, 90-day check) | Pilot test |
| 28 | Fake accounts | Onboarding (phone, liveness, ID badge); T&S | Designed |
| 29 | Off-platform harassment | Onboarding (private socials); Second meeting (chat first, bans everywhere) | Designed |
| 30 | Picks data breach | Onboarding (EXIF); After (encryption, deletion); T&S; security-review gate | Gate |
| 31 | Privacy law | Principles; Join (consent); T&S; privacy-review gate | Gate |
| 32 | Minors | Onboarding (age check); age-assurance gate | Gate |
| 33 | Host misuse of data | H1 agreement; H3 moderation view | Designed |
| 34 | Re-identification from counts | Discover (hidden below 5) | Designed |
| 35 | Emergencies | At event (crisis resources); Second meeting (share plans); T&S; runbook gate | Gate |
| 36 | Users leaving once it works | Roles (pod host); Ongoing (graduation, circles) | Pilot test |
| 37 | Low urgency | Onboarding (partner channels, life stage) | Pilot test |
| 38 | "Friend app" stigma | Principles (positioning) | Pilot test |
| 39 | One-and-done users | Discover (3 in 3); After (recovery) | Pilot test |
| 40 | Measuring real outcomes | Onboarding baseline; Ongoing check-ins; Metrics | Designed |
| 41 | Demographic imbalance | Before (makeup tracked monthly) | Designed |
| 42 | Accessibility | Onboarding (needs, language); Discover filters; H2 tags | Designed |
| 43 | Competitive response | Business model (moat, quarterly review) | Later |
| 44 | Starter-event cost | Event types (cheap formats, stopped once busy) | Designed |
| 45 | Moderation cost | T&S operations | Later |
| 46 | No first-party interviews | Interview gate | Gate |
| 47 | Organizer list incomplete | Organizer-list gate | Gate |
| 48 | "Open to meet" opt-in untested | Concierge-pilot gate | Gate |
| 49 | Sourcing city events | Event types (hand-curated) | Designed |
| 50 | Events with no host | Event types; Before (minimum count); At event (check-in) | Pilot test |
| 51 | Self-reported registration | Join; Before (listing re-check) | Designed |
| 52 | Return-prompt timing | Join (three answers, home card) | Designed |
