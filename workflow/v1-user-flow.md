# User Flow (v2 Draft)

> Replaces the v1 draft (see git history, commit `cf430cf`). Open issues are tracked in [open-gaps.md](open-gaps.md). Research behind each decision is linked inline.

**Status:** proposed design, not implemented behavior. Timings, group sizes, targets, and expected benefits below need pilot validation. See the [documentation audit](../research/documentation-audit.md).

## What changed from v1, and why

| v1 | v2 | Why |
|----|----|-----|
| Pull events from Luma/Eventbrite | **Partner hosts first**, plus "add an event you're going to" | Eventbrite retired public search in 2019–20. Luma requires authorized Plus calendars; Meetup has a gated API requiring Pro and approval ([organizers.md](../research/organizers.md)). Organizer support is a hypothesis to test for in-event adoption ([event-networking-apps](../research/competitors/event-networking-apps.md)). |
| Any event | **Recurring series preferred** | Hall reports estimated time ranges, not a universal 50-hour threshold. Proximity and repetition can support connection ([science.md](../research/science.md) §1). |
| See all Firefly users at the event | **Small pod of 3–5**, plus the wider room after check-in | Observational research suggests spontaneous conversations often involve four or fewer people (Dunbar 1995). Pod size and the benefit of grouping remain pilot questions ([pie](../research/competitors/pie.md)). |
| Find each other somehow | **Fixed meeting point and time** (host-run "Firefly corner") | Avoids live location entirely ([safety-privacy.md](../research/safety-privacy.md)). Timeleft and Brella solve this with a fixed table. |
| Swap socials on mutual match | **Mutual "keep meeting" → in-app chat → next event already suggested**. Socials are optional later | Swapping socials alone does not guarantee a second meeting ([bumble-bff](../research/competitors/bumble-bff.md)). Delaying socials limits off-platform harassment. |
| Recommend events connections attend | **Pod continues as a group** with a default next date | Test whether a continuing pod helps. Roberts & Dunbar (2011) associate contact recency with closeness; they do not establish group superiority or a 21-day deadline. |

---

## Two sides of the flow

Firefly Social serves **attendees** (lonely or new-in-town people who want friends) and **hosts** (recurring event organizers). Hosts are the supply side and the safety partner.

### Host flow (runs in parallel)

1. **Host onboarding.** Host connects a series (Luma calendar key, Meetup group, Instagram-run club, or manual entry) and turns on "Firefly Social at this event."
2. **Setup per event.** Host picks a **meeting point** (e.g. "the table by the coffee bar, 6:45pm") and a time. Firefly Social generates a **rotating check-in QR** for the host to display, and gives the host a 60-second intro script.
3. **During the event.** The host sees a live count of pods checked in (counts only, no names or picks). A separate moderation view exposes only the reported account and necessary case details, allowing removal without access to private picks.
4. **After the event.** The host gets aggregate stats: Firefly attendees, % returning next time, newcomer retention, anonymous feedback. **Hosts never see individual intent or matches.**

---

## Attendee flow

### 0. Onboarding (≈2 minutes)

- **Verify:** phone number + selfie liveness check before pod or room visibility. 18+ is the product policy; a separate age-assurance process must be designed and validated before pilot because liveness does not prove age.
- **Profile (kept small):** first name, photo, neighbourhood (optional), 3–5 interests, "new to Vancouver?" (yes/no and when), and 2 short "both-answer" prompts ("Best cheap eat in the city?").
- **Intent statement:** the user agrees to the **platonic pledge** ("I'm here for friends. No dating, no selling, no recruiting").
- **Preferences:** pod preferences (mixed / same gender / no preference), times per week they're free, budget (free / under $20 / any).
- **Socials (optional, private):** Instagram/LinkedIn are stored but hidden until the user chooses to share them with a specific match.
- **Baseline check-in:** one question, "How often do you feel lonely?" (StatCan wording), with consistent response options, used to track self-reported change. Without a comparison design, change is not proof of Firefly's causal impact.

### 1. Discover

- The home screen shows **this week's Firefly events**: partner-hosted events where Firefly Social is active, with recurring series ranked first ("Every Tue · Kits Beach Run Club").
- Each card shows: what it is, cost, **"Firefly corner at 6:45pm"**, and whether Firefly users are going ("5+ going" shown only above a threshold, otherwise "Be one of the first").
- **Add your own:** paste any event link (Luma, Eventbrite, Meetup, Instagram). If 3+ Firefly users add the same event, Firefly Social invites that host to partner.
- **Cold-start fallback:** if no partner event fits, Firefly Social suggests a **Firefly-run starter event** (e.g. a monthly newcomers' walk or games night) so there's always something to go to.

### 2. Join

- User RSVPs through the host's normal flow (Luma, Eventbrite, etc.) and taps **"I'm going, put me in a pod."**
- **Commitment nudge:** "4 people will be counting on you." Users who skip without cancelling lose priority in future pods.
- Users can cancel up to 24h before with no penalty.

### 3. Before the event (24h → 30 min before)

- **24h before:** Firefly Social forms **pods of 3–5** from RSVPs, balancing shared interests, newcomer status, and pod preferences. If someone has been in a pod with a person before and both said "keep meeting", they're placed together again.
- **Pod reveal:** with explicit RSVP-time consent, assigned pod members see first names, photos, interests, and one prompt answer. This is a limited pre-event exception to room visibility; declining it opts the user out of the pod.
- **Pod chat opens 30 min before** (copied from Timeleft): "I'm in the green jacket", "running 5 min late".
- One **conversation starter** for the pod, escalating with how many times they've met (light at meeting 1, deeper by meeting 3; Aron 1997, Kardas 2022).

### 4. At the event

- **Check in** by scanning the host's rotating QR. Only then does the user become visible in the wider room, to others checked in at this event. Pre-event pod visibility is separately consented. QR codes can be relayed; check-in is a mitigation, not perfect proof of presence.
- **Meet at the Firefly corner** at the set time. The host does a 60-second intro ("If you're here with Firefly Social, this is your pod"). No maps or distances.
- **Pod first, room second.** The pod spends the first ~20 min together. Afterwards, the user can see other checked-in Firefly attendees (cards: first name, photo, interests, an opener) and join their conversations.
- **Optional mission:** one light challenge per event ("Find someone else who moved here this year"), from the strangers-intervention research (Sandstrom et al. 2022).
- **Always available:** "Hide me" (instantly invisible), block, report, and leave.
- **Live room visibility ends automatically** one hour after the event ends. Eligible pod/met profile cards remain in a restricted post-event picker for up to 72 hours, with no live-presence status. Block/hide withdrawals remove access immediately.

### 5. After the event (same night, within 2 hours)

- **Push notification:** "Who would you like to keep meeting?" It shows the user's pod and anyone they tapped "met" in the room.
- **Liking-gap reminder** on the screen: "People usually underestimate how much others enjoyed talking to them" (Boothby 2018).
- For each person: **Keep meeting** / **Not this time** (private).
- **Mutual "keep meeting"** creates a connection and **unlocks 1:1 chat**. A group thread of three or more requires every included person to opt into that group; A–B and B–C matches alone do not imply A–C consent. Two people use their 1:1 chat.
- **Non-mutual choices are never shown.** Target deletion is after 30 days, subject to the legal-retention review in [safety-privacy.md](../research/safety-privacy.md#retention-qualification).
- **Quick feedback:** rate the event and pod (feeds back to matching and to the host as aggregate data). Optional "report a concern."
- **Missed the window?** One reminder the next morning, then it closes after 72h (prevents stale picks).

### 6. Second meeting (the critical step)

- With every new connection or group, Firefly Social **suggests a specific next event**, not a general recommendation: "Kits Run Club is on again next Tuesday. Want to go together?" One tap means "I'm in", and both see it.
- If the event is recurring, **the default is "same time next week"**, re-podded with the same people.
- If no shared event fits within 21 days, Firefly Social suggests a **low-cost plan template** (coffee walk, food-truck lunch) with a date and time poll, in a public place.
- **Safety:** before a 1:1 plan outside an event, offer "share plans with a friend."
- **Socials:** either person can choose to share Instagram or LinkedIn at any time after a match. Never automatic.

### 7. Ongoing: from pod to circle

- **Circle view:** people the user has met 2+ times, with **estimated shared-event hours** and last shared attendance. Co-attendance is an exposure proxy, not proof that two people interacted for the event's entire duration.
- **Fade alerts:** if a connection hasn't met in ~3 weeks, prompt with "Send a quick hi?" (Liu 2023) and suggest the next shared event.
- **Pod graduation:** once a group has met 3+ times, Firefly Social offers to make them a **recurring circle** that books its own monthly plan, so Firefly Social steps back.
- **Success check-in at 30 / 90 days:** the loneliness question again, and "Have you hung out with anyone from Firefly Social outside an event?"
- **Give back:** users with established circles can become **pod hosts** (welcome newcomers at their regular event), which keeps supply going and gives people who've succeeded a reason to stay.

---

## Key metrics per step

| Step | Metric |
|------|--------|
| 1–2 | % of active users who RSVP to ≥1 Firefly event per month |
| 3 | Pod fill rate; no-show rate |
| 4 | Check-in rate; % meeting at the corner on time |
| 5 | % completing "keep meeting"; mutual-match rate |
| 6 | % of mutual connections meeting again within 21 days (**north star**) |
| 7 | Median estimated shared-event hours per connection at 90 days; descriptive change in self-reported loneliness |
