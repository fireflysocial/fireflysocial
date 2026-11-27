# User Flow (v4 Draft): launch scope

> Drafted 2026-11-25 after a change of product direction. Supersedes [v3-user-flow.md](v3-user-flow.md) **for what ships at launch**. The v3 group features (pods, the Firefly corner, picks, chat, hosts) are not dropped: they are the next phase and stay in v3 as reference until they're redesigned on top of this flow.

**Status:** proposed design, not implemented behaviour. Targets are proposals to confirm with real users.

**Cities:** Firefly is built for many cities across several countries (decided 2026-11-27). **Vancouver is the first launch city and the pilot.** Everything below is per city: the pipeline runs per city, and each city has its own neighbourhood list, timezone, currency and budget defaults. Nothing in the flow is specific to Vancouver except where it says so. Each new country needs a privacy-law and app store review first (CLAUDE.md §12).

## What changed from v3, and why

**The problem is follow-through, not supply.** Big cities already have plenty of events; Vancouver, the first city, certainly does. The research points the same way: the strongest theme in the [interview synthesis](../research/interviews/synthesis.md) is that people meet at events and nothing comes of it ("We should hang out sometime", then nothing). Recruiting partner hosts one by one was also the slowest part of the v3 plan.

| v3 | v4 (launch) |
|----|-------------|
| Events come mainly from partner hosts, plus a hand-curated city list | Events come from the whole city, found by **AI-assisted search** and checked against each event's own page |
| Four roles: attendee, partner host, pod host, Firefly team | **Two roles at launch: attendee and Firefly team.** Hosts are long-term |
| Value starts when a pod forms | **Useful from the first user:** a feed of events picked for that person |
| Onboarding collects a photo, selfie check and pod preferences up front | Onboarding collects **only what the event feed needs**; photo and selfie wait until group features launch |
| Pods, Firefly corner, picks and chat in the first build | **Deferred** to the next phase (see [Later](#later-not-at-launch)) |

**The long-term product is unchanged:** people going to the same events are brought together, sharing socials is consensual, and connections grow over time while Firefly takes the friction out of approaching. Launch builds the two foundations that needs: knowing each person well, and knowing which events they're actually going to.

---

## Principles (carried over from v3)

- **No location data, ever.** Users pick neighbourhoods they like from a list; Firefly never reads GPS, shows maps or distances, or tracks where anyone is ([CLAUDE.md §8](../CLAUDE.md)).
- **Collect only what's needed, when it's needed.** If a feature at launch doesn't use a piece of data, onboarding doesn't ask for it.
- **18+ and good intent only**, from day one, even before group features exist: people come to meet others with a shared purpose (friendship, networking, collaborators, a co-founder), never to sell or spam (positioning broadened 2026-11-25 from platonic friendship only).
- **"Get more out of the events you already go to" and "new in town"**, never "lonely."
- **Events must involve talking.** Concerts, loud bars and large-venue events are filtered out of the feed (v3 #21).
- **No dark patterns:** no streaks, no fake urgency, no manipulative notifications.

---

## Roles at launch

| Role | Who | Does |
|------|-----|------|
| **Attendee** | Newcomers and anyone looking for their people (friends, a network, collaborators) | Onboards, gets a personal event feed, goes to events through Firefly |
| **Firefly team** | Staff | Runs and monitors the event pipeline, fixes bad listings, handles reports |

Partner hosts and pod hosts are long-term (v3 host flow H1–H4).

---

## The event pipeline (behind the scenes)

Firefly finds events itself instead of waiting for hosts to list them.

1. **Search on a schedule, not per user.** A scheduled job (for example nightly) searches the web for upcoming events by city, category and neighbourhood (Vancouver first), using an AI model with web search. The provider (Claude, Gemini or another) is an open decision. Searching per category, not per user, keeps cost flat as users grow and means **no personal data is sent to the AI provider**.
2. **Extract from the source page, never from memory.** For each candidate, the job fetches the event's own page and extracts structured fields: title, start and end time (in the event's IANA timezone, e.g. `America/Vancouver`), venue name and address, price and currency, category, registration link and source URL, plus accessibility facts the page states (step-free access, a quieter venue, captions or hearing support). A field the page doesn't state is left empty, not guessed. Every event keeps its source URL.
3. **Validate before it's shown.** Drop the event if the start time is in the past, the link doesn't resolve, or a required field is missing. Remove duplicates (the same event listed on several sites). Filter out events where you can't talk (#21).
4. **Store and expire.** Events are saved in Supabase with an `expires_at` and deleted after they end.
5. **Re-check before it matters.** About 24 hours before an event, re-fetch its page to catch cancellations, sell-outs and time changes (v3 #51).
6. **Human spot-checks.** The Firefly team reviews a sample of new listings each week and can hide any listing. Users can flag a wrong or dead listing in one tap.

**Open decision: source terms.** The [open-gaps](open-gaps.md) decision for #2 was "no scraping (ToS and legal risk)". An AI fetching and reading event pages is still automated extraction, so this reverses that decision and needs a check first. Proposal: respect `robots.txt`, show only facts plus a link (never copy descriptions or images wholesale), always send people to the original page to register, and run it past the privacy and legal review in the [v3 pre-pilot gates](v3-user-flow.md#pre-pilot-gates) before launch.

---

## Attendee flow at launch

### 0. Onboarding (target: under 2 minutes, value on the last screen)

The goal is to show a feed that feels personal before the person has done any real work. Every screen has one job, and only the essentials are required.

1. **Welcome:** one sentence on what Firefly is, then **Get started**.
2. **Sign up:** phone number with a one-time code (works inside the iOS and Android apps; one account per number, v3 #28).
3. **18+ and the respect pledge:** "I'm 18 or older" plus "I'm here to meet people with good intent. No selling, no spam, no unwanted advances." The full age-assurance method is still a pre-pilot gate (v3 #32).
4. **First name and city:** the first name is used to greet the person (no last name). The city is picked from the cities Firefly runs in (a list, never GPS); while Vancouver is the only city, this choice is skipped.
5. **Interests (the core screen):** tap at least 3 from a set of chips, grouped loosely (Tech & startups, Careers & networking, Arts & music, Active, Games, Creative, Food & drink, Learning, Outdoors, Community). Chips use everyday words ("startup meetups", "run clubs", "pottery").
6. **When you're free:** weekday evenings / weekend days / weekend evenings (tap any).
7. **Optional, skippable together on one screen:**
   - Neighbourhoods you'd happily go to (a list, never GPS)
   - Budget, defaulting to free or low-cost in the city's currency (under $20 in Vancouver; v3 #16)
   - "New to [city]?" (yes / no), e.g. "New to Vancouver?". Launch purpose: newcomer-welcoming events (newcomer meetups, language exchanges, "new members welcome" nights) rank higher for people who say yes. No arrival date is asked at launch.
   - Accessibility needs: step-free, quieter venues, captions or hearing support (private, v3 #42)
8. **Your feed:** onboarding ends on the first personal feed, so the first thing the person sees is the value.

**Not collected at launch:** photo, selfie check, pod preferences, socials. They come back, asked at the moment they're needed, when group features launch. Notifications are requested only when the person first saves an event or says they're going, never during onboarding.

### 1. The personal feed

- **This week's events, ranked for this person** by interests, free times, budget, neighbourhoods and accessibility needs.
- **Accessibility is never assumed.** An event whose page confirms a need the person set ranks higher and says so ("Step-free, per the organiser"). An event whose page says nothing is still shown, labelled "Accessibility not listed", never presented as confirmed. An event whose page states it doesn't meet a set need (for example, stairs only) is hidden for that person.
- **Every card says why it's there:** "Because you like board games · Thursday evening · Free".
- **One-tap feedback:** **More like this** / **Not for me** (with an optional reason: "too far", "too expensive", "not my thing"). Feedback updates the ranking right away.
- **Save** an event to come back to it.
- **Honest empty state:** if nothing fits this week, say so and offer to widen one filter, instead of padding the feed with poor matches.
- **No social signals at launch:** no "X people going", no attendee counts (privacy rule §8.6). When group features arrive, ranking may quietly favour events other Firefly users are going to, so people end up at the same events, without ever showing small counts.

### 2. Going (click through, then confirm)

Firefly can't see other sites' guest lists, so going is self-reported in two steps:

1. **Register ↗** opens the event's own page in the in-app browser. Firefly records the click as interest only.
2. **On return:** "Did you register for Kits Comedy Night?" → **Yes, I'm going** / **Not yet, remind me** / **Not going** (v3 #52). A dismissed prompt becomes a quiet card on the feed, not a repeat pop-up. The card expires when the event starts at the latest; an earlier cut-off is not decided yet.
3. **Free events with no registration** show **I'm going** directly.

**Only a confirmed Yes counts as going.** A click alone doesn't: people browse, events sell out, and plans change. The going list is what group features will be built on, so it has to be trustworthy.

**The going list is sensitive.** It says where a person will be and when. It is visible only to its owner (RLS), never shown to anyone else at launch, and deleted a set time after each event (retention to be set in the privacy review).

### 3. Around the event

- **Reminder** the day before, or a few hours before, the person's choice. Notifications are opt-in.
- **After the event:** one optional question: "Did you go? How was it?" (**Good** / **Not for me** / **Didn't go**). This improves the feed and measures whether events actually happen for people.

---

## Later (not at launch)

Designed in [v3-user-flow.md](v3-user-flow.md) and to be redesigned on top of the launch flow:

- **Groups of people going to the same event** (pods), and their size.
- **The Firefly corner:** where Firefly removes the friction of approaching. A set meeting point, a reveal before the event, an icebreaker. This is where the product's real job begins, so it gets its own design pass.
- **Picks, mutual "keep meeting", 1:1 chat and consensual socials sharing.**
- **Check-in**, photo and selfie verification, and the room.
- **Hosts:** partner hosts and pod hosts (long-term).

---

## Launch metrics

All targets are proposals to confirm with real users.

| Step | Metric | Target |
|------|--------|--------|
| 0 | Onboarding completion (start → first feed) | ≥ 80% |
| 0 | Median time to first feed | < 2 min |
| 1 | Share of feed cards that get feedback, are saved or are clicked | Set after launch |
| 1 | "Not for me" rate on the top 5 cards | Falling week on week |
| 2 | Click → confirmed "Yes, I'm going" | Set after launch |
| 3 | Confirmed going → "I went" | Set after launch |
| — | Weekly active users who confirm ≥ 1 event a month | Set after launch |
| Pipeline | Listings with a wrong time, place or dead link (spot-check + user flags) | < 2% |

## Open decisions

- **AI provider** for event search and extraction, and the cost ceiling per night. Sending any user data to it needs explicit sign-off (CLAUDE.md §12); the batch design above avoids that.
- **Source terms:** the scraping reversal above, before launch.
- **Age assurance** method (v3 #32, a pre-pilot gate).
- **Retention** for the going list and feedback.
- **Group size** and when group features start.
- **City rollout:** which cities and countries come after Vancouver, in what order, and what density of events and people a city needs before it opens.
