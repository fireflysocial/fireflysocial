# Competitors / What Already Exists

Overview of the landscape. Add one `.md` file per competitor in this folder (e.g. `timeleft.md`, `bumble-bff.md`).

## What already exists

The tools people use to meet others today fall into four groups, and each one stops short of friendship in its own way.

* **Event platforms (Meetup, Eventbrite, Luma):** They help you find something to attend. Once you arrive, you are on your own, and nothing connects you to the people you met once the event ends.
* **Matching apps (Bumble BFF):** They connect you with people who share your interests. The conversation usually starts in a chat, and many matches fizzle before anyone meets in person.
* **Planned meetups (Timeleft, 222):** They solve the first meeting by placing you at a table with strangers. They are built around the night itself, so what happens with those people afterward is mostly left to you.
* **Clubs and run groups:** They offer the repeated contact friendships need, but they assume you will find the right one, walk in alone, and work your way into a group that already exists.

## The gap none of them address

* **Intent is invisible.** At a run club, a coffee shop, or a gym, there are often others who are just as alone and just as eager to meet someone. Nothing sets them apart, so everyone assumes no one else is looking.
* **Approaching feels too risky.** Without knowing whether a stranger is open to talking, saying hello feels like a gamble, so most people stay on their phones instead.
* **No one owns the follow up.** Even when a good first meeting happens, nothing brings the same people back together, and the connection fades.

People who are looking for the same thing pass each other every day without ever finding out. Firefly is built to make that intent visible and to keep bringing the right people back together until a meaningful connection develops.

## Competitor files

| File | Category | One-line gap |
|------|----------|--------------|
| [luma.md](luma.md) | Event platform | Great event pages, but no in-room layer, no follow-up, and the API is limited to your own calendar |
| [eventbrite.md](eventbrite.md) | Event platform | Purely transactional. Public search API removed in 2020. New owner (Bending Spoons) |
| [meetup.md](meetup.md) | Event platform (groups) | Recurring by design, but newcomers still walk in alone. Fee backlash |
| [partiful.md](partiful.md) | Event platform (social invites) | Has a co-attendance graph and mutual "Crush", but romantic only and for existing friend circles |
| [facebook-events-groups.md](facebook-events-groups.md) | Events + groups | Reach without intent. Brand fatigue among under-30s |
| [bumble-bff.md](bumble-bff.md) | Matching app | Chat-first, meet-never. Pivoted to groups in 2025 |
| [timeleft.md](timeleft.md) | Planned meetups | Solves the first meeting, but each week is a new table |
| [222.md](222.md) | Planned meetups | Feedback-trained matching, but mixed friend/romance intent. Not in Vancouver |
| [pie.md](pie.md) | IRL events app | Pays hosts per RSVP. Events got crowded, so it added grouping |
| [event-networking-apps.md](event-networking-apps.md) | In-event matchmaking (B2B) | Proves organizer-driven adoption works, but transactional |
| [clubs-and-run-groups.md](clubs-and-run-groups.md) | Offline communities | Repeated contact is built in, but intent is invisible and discovery is hard |
| [failed-and-stalled.md](failed-and-stalled.md) | Post-mortems | Retention, chat-first design, and the cost of running events killed predecessors |

## Comparison matrix

| | Find events | Visible intent to meet | Help in the room | Post-event mutual opt-in | Engineered 2nd meeting | Group-first | Free for users |
|---|---|---|---|---|---|---|---|
| Luma | ✅ | ❌ | ❌ | ❌ | ❌ | — | ✅ |
| Eventbrite | ✅ | ❌ | ❌ | ❌ | ❌ | — | ✅ |
| Meetup | ✅ | ❌ | ❌ | ❌ | ⚠️ recurring groups | ✅ | ⚠️ |
| Partiful | ⚠️ friends' only | ❌ | ❌ | ✅ romantic only | ❌ | — | ✅ |
| Bumble BFF | ❌ | ✅ | ❌ | ✅ (pre-meeting) | ❌ | ⚠️ new | ⚠️ freemium |
| Timeleft | ❌ own events | ✅ | ✅ table | ✅ | ❌ | ✅ | ❌ |
| 222 | ❌ own events | ✅ | ✅ group | ⚠️ feedback | ❌ | ✅ | ❌ |
| Pie | ✅ own feed | ⚠️ | ⚠️ "Sparked" events | ❌ | ❌ | ✅ | ✅ |
| Brella/Swapcard | ❌ | ✅ | ✅ tables | ⚠️ | ❌ | ❌ | ✅ (org pays) |
| Run clubs | ❌ | ❌ | ❌ | ❌ | ✅ weekly | ✅ | ✅ |
| **Firefly (target)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Takeaway:** each column is solved by *someone*, but no one combines visible intent + in-room help + mutual opt-in + an engineered second meeting on top of **existing** events. The closest threats are **Partiful** (could ship platonic Crush) and **Timeleft** (could add recurring tables).
