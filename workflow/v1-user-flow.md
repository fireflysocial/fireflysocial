# User Flow (v2 Draft)

> Replaces the v1 draft (see git history, commit `cf430cf`). Open issues are tracked in [open-gaps.md](open-gaps.md). Research behind each decision is linked inline.

## What changed from v1, and why

| v1 | v2 | Why |
|----|----|-----|
| Pull events from Luma/Eventbrite | **Partner hosts first**, plus "add an event you're going to" | Eventbrite's public search API was shut down in 2020. Luma's and Meetup's APIs only cover calendars you manage or have Pro access to ([organizers.md](../research/organizers.md)). Organizer-driven adoption is what makes in-event matching work ([event-networking-apps](../research/competitors/event-networking-apps.md)). |
| Any event | **Recurring series preferred** | Friendship takes ~50 h together. Proximity and repetition do most of the work ([science.md](../research/science.md) §1). |
| See all Firefly users at the event | **Small pod of 3–5**, plus the wider room after check-in | Conversations cap at ~4 people (Dunbar 1995). Pie found that open events get crowded and don't connect people ([pie](../research/competitors/pie.md)). |
| Find each other somehow | **Fixed meeting point and time** (host-run "Firefly corner") | Avoids live location entirely ([safety-privacy.md](../research/safety-privacy.md)). Timeleft and Brella solve this with a fixed table. |
| Swap socials on mutual match | **Mutual "keep meeting" → in-app chat → next event already suggested**. Socials are optional later | Swapping socials doesn't produce a second meeting ([bumble-bff](../research/competitors/bumble-bff.md)). Delaying socials limits off-platform harassment. |
| Recommend events connections attend | **Pod continues as a group** with a default next date | Groups beat pairs. Contact must recur before the connection decays (Roberts & Dunbar 2011). |

---

## Two sides of the flow

Firefly Social serves **attendees** (lonely or new-in-town people who want friends) and **hosts** (recurring event organizers). Hosts are the supply side and the safety partner.

### Host flow (runs in parallel)

1. **Host onboarding.** Host connects a series (Luma calendar key, Meetup group, Instagram-run club, or manual entry) and turns on "Firefly Social at this event."
2. **Setup per event.** Host picks a **meeting point** (e.g. "the table by the coffee bar, 6:45pm") and a time. Firefly Social generates a **rotating check-in QR** for the host to display, and gives the host a 60-second intro script.
3. **During the event.** The host sees a live count of pods checked in (counts only, no names or picks). The host can remove a reported user from the room.
4. **After the event.** The host gets aggregate stats: Firefly attendees, % returning next time, newcomer retention, anonymous feedback. **Hosts never see individual intent or matches.**

---

## Attendee flow

### 0. Onboarding (≈2 minutes)

- **Verify:** phone number + selfie liveness check. Required before appearing in any room. 18+ only.
- **Profile (kept small):** first name, photo, neighbourhood (optional), 3–5 interests, "new to Vancouver?" (yes/no and when), and 2 short "both-answer" prompts ("Best cheap eat in the city?").
- **Intent statement:** the user agrees to the **platonic pledge** ("I'm here for friends. No dating, no selling, no recruiting").
- **Preferences:** pod preferences (mixed / same gender / no preference), times per week they're free, budget (free / under $20 / any).
- **Socials (optional, private):** Instagram/LinkedIn are stored but hidden until the user chooses to share them with a specific match.
- **Baseline check-in:** one question, "How often do you feel lonely?" (StatCan wording), used to measure Firefly Social's impact.

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
- **Pod reveal:** first names, photos, interests, and one shared prompt answer each.
- **Pod chat opens 30 min before** (copied from Timeleft): "I'm in the green jacket", "running 5 min late".
- One **conversation starter** for the pod, escalating with how many times they've met (light at meeting 1, deeper by meeting 3; Aron 1997, Kardas 2022).

### 4. At the event

- **Check in** by scanning the host's rotating QR. Only then does the user become visible, and only to others checked in at this event.
- **Meet at the Firefly corner** at the set time. The host does a 60-second intro ("If you're here with Firefly Social, this is your pod"). No maps or distances.
- **Pod first, room second.** The pod spends the first ~20 min together. Afterwards, the user can see other checked-in Firefly attendees (cards: first name, photo, interests, an opener) and join their conversations.
- **Optional mission:** one light challenge per event ("Find someone else who moved here this year"), from the strangers-intervention research (Sandstrom et al. 2022).
- **Always available:** "Hide me" (instantly invisible), block, report, and leave.
- **Visibility ends automatically** one hour after the event ends.

### 5. After the event (same night, within 2 hours)

- **Push notification:** "Who would you like to keep meeting?" It shows the user's pod and anyone they tapped "met" in the room.
- **Liking-gap reminder** on the screen: "People usually underestimate how much others enjoyed talking to them" (Boothby 2018).
- For each person: **Keep meeting** / **Not this time** (private).
- **Mutual "keep meeting"** creates a connection and **unlocks 1:1 chat**. If 2+ pod members are mutual, it creates a **group thread** for them.
- **Non-mutual choices are never shown.** They are deleted after 30 days.
- **Quick feedback:** rate the event and pod (feeds back to matching and to the host as aggregate data). Optional "report a concern."
- **Missed the window?** One reminder the next morning, then it closes after 72h (prevents stale picks).

### 6. Second meeting (the critical step)

- With every new connection or group, Firefly Social **suggests a specific next event**, not a general recommendation: "Kits Run Club is on again next Tuesday. Want to go together?" One tap means "I'm in", and both see it.
- If the event is recurring, **the default is "same time next week"**, re-podded with the same people.
- If no shared event fits within 21 days, Firefly Social suggests a **low-cost plan template** (coffee walk, food-truck lunch) with a date and time poll, in a public place.
- **Safety:** before a 1:1 plan outside an event, offer "share plans with a friend."
- **Socials:** either person can choose to share Instagram or LinkedIn at any time after a match. Never automatic.

### 7. Ongoing: from pod to circle

- **Circle view:** people the user has met 2+ times, with "hours together" (from attended events) and last-met date.
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
| 7 | Median hours together per connection at 90 days; change in loneliness score |
