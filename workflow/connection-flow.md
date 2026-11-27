# Connection Flow (Draft): intent, pods and keeping in touch

> Drafted 2026-11-27. Redesigns the group features of [v3-user-flow.md](v3-user-flow.md) (pods, the Firefly corner, picks, chat, sharing socials) on top of the launch flow in [v4-user-flow.md](v4-user-flow.md). **v4 stays the spec for launch.** This is the next phase. v3 stays the reference for hosts, check-in methods, the room, circles and the trust and safety operations, which this draft doesn't change.

**Status:** proposed design, not implemented behaviour. Nothing here is built. Every target, size and timing is a proposal to confirm in a pilot, and the [open decisions](#open-decisions) must be settled before the backend is designed.

**Where it came from:**

- The founder's initial workflow note (2026-11-27): onboarding → events that fit → register → people going to the same events are brought together. The key line: **going to the same event doesn't make two people a good fit.**
- **Pulse**, the founder's earlier project ([repo](https://github.com/adi-padmarajan/pulse-websummit-hackathon-2026); 1st place, Web Summit 2026 hackathon, per its README). Pulse matched people by a short-lived, stated intent (a "Quest"), kept identity hidden until both people agreed (a "Wave"), asked whether the conversation actually happened, and then handed off to LinkedIn. This flow keeps that loop and drops the parts that break Firefly's rules (see [What we kept from Pulse](#what-we-kept-from-pulse-and-what-we-didnt)).

---

## The idea in one line

**Match on why people are going, not only on where.** Each person says what they want out of a specific event. Firefly groups people going to the same event for compatible reasons, shows them only that reason and their interests (never gender, photo or personal details), and lets the connection grow only as far as both people choose.

## The loop

```
Going (v4) → Open to meeting people here? → Set your intent for this event
     → Pod forms (24h before) → Pod reveal: intents and interests only
     → Meet at the Firefly corner → "We met" (both say so)
     → Keep meeting? (private, mutual) → Each chooses which socials to share
     → Next shared event
```

## What changed from v3

| v3 | This draft | Why |
|----|-----------|-----|
| Pods balanced on interests, newcomer status and preferences | Pods are formed **per event, by stated intent first**, then interests | Same event ≠ good fit. A co-founder search and a run-club friendship need different people |
| Pod reveal shows first name, photo, interests, a prompt | Pod reveal shows **intent, interests and a prompt only**. No name, photo, gender, age, job or school before meeting | Lowers dating drift and judgement on looks; less to misuse if a card leaks |
| Profile collected up front (photo, socials, prompts) | Asked **at the moment it's needed**: intent when going, prompts when first joining a pod, socials when first sharing | Data minimisation (CLAUDE.md §8.9) and a short onboarding |
| "Met" tap in the room | **"We met" tapped by both people** after meeting their pod | An honest record that the meeting happened, as in Pulse |
| Mutual pick unlocks 1:1 chat; socials optional later | Mutual pick unlocks **sharing socials, one network at a time, by each person's choice**. In-app chat is an [open decision](#open-decisions) | A smaller first build; the handoff Pulse used |

---

## What we kept from Pulse, and what we didn't

| Pulse | Firefly | Kept? |
|-------|---------|-------|
| Quest: short-lived stated intent | **Intent per event**, expiring with the event | Kept |
| Match explanation ("why this person") | **"Why you're together"** line on the pod reveal | Kept |
| Wave: identity hidden until both agree | Pod reveal without identity; **picks** private and mutual | Kept |
| "Did it happen?" check before saving | **"We met"** from both people | Kept |
| LinkedIn follow-up | **Sharing socials**, each person choosing which ones | Kept, widened |
| One-on-one or a small gathering | **Small pod by default; "one person first"** option (v3 buddy, #20) | Kept |
| Live radar of people nearby, fuzzy proximity | **Removed.** No location data, ever (CLAUDE.md §8.1). People find each other at a fixed meeting point and time | No |
| "Who should I talk to right now", a 30-minute window | Pods form **24 hours before** the event: Firefly events are small and planned days ahead | No |
| Claude parsing free-text Quests, writing openers | **Intent is chosen from chips.** Openers come from templates filled with the event's category and the pod's shared interests. No user data goes to an AI provider (CLAUDE.md §8.15) | No |

---

## Attendee flow

### A. Before: intent at onboarding (launch, v4)

v4 onboarding asks **"What brings you to Firefly?"** (tap any): *new friends · a professional network · collaborators · a co-founder · just good events*. At launch it only ranks the feed (v4 step 5). In this phase it becomes the **default intent** for each event, so most people never have to type anything.

### B. Going, then opting in (per event)

After **Yes, I'm going** (v4 §2), one more screen:

1. **"Open to meeting people at this event?"** **Yes** / **Not this time**. Default is not opted in. Saying no changes nothing else: the event stays on the person's going list.
2. **"What do you want out of this one?"** Pick 1–2, prefilled from the onboarding answer:
   - *Make friends*
   - *Grow my network*
   - *Find collaborators*
   - *Meet a co-founder*
   - *Open to anything*
3. **"How do you want to meet?"** *A small group* (default) / *One person first* (v3 #20).
4. **Consent, in plain words:** "Your pod will see your intent, your interests and your prompt answer. Not your name, photo or anything else. You can leave any time before the event."
5. **First time only:** answer one prompt from a fixed list ("The last thing I got nerdy about…", "I'd love to learn…"). Short text, no links, no handles; checked for contact details and reported content.

The intent is **per event and expires with it**. It is never shown to anyone outside the pod and never used to rank other people's feeds.

### C. Pod forms (about 24 hours before)

- **Pods of 3–5**, over-formed by one so a no-show doesn't leave a pair (v3 #11).
- **Grouped by intent first, then shared interests.** Proposed compatibility: same intent, or anyone with *Open to anything*. *Find collaborators* and *Meet a co-founder* can share a pod. The exact rules are an open decision.
- **A private pod-makeup preference** (mixed / same gender / no preference, v3 #7) can be honoured without showing gender to anyone. Collecting it is an [open decision](#open-decisions).
- **People who both said "keep meeting" before** are placed together again (v3 #24).
- **Not enough people, or nobody compatible?** "No pod this time." Honest, with no hint about who else was or wasn't there.

### D. The pod reveal

Visible only to the pod's members, from the reveal until one hour after the event.

**Each pod-mate card shows:**

- A neutral label, not a name ("Pod-mate 1")
- Their intent for this event
- 2–3 interests, with the ones you share highlighted
- Their prompt answer
- **Block** and **Report**, one tap each (CLAUDE.md §8.5)

**Never shown before meeting:** name, photo, gender, age, workplace, school, socials, neighbourhood, or any other event they're going to.

**Also on the reveal:**

- **Why you're together:** "You're all here to find collaborators, and three of you like design."
- **Meeting point and time**, set by Firefly: a public spot near the entrance (v3 #50). The pod word (e.g. *Maple*) and a Firefly sign or sticker make the group easy to spot.
- **One conversation starter**, from a template using the event and the shared interests.
- **Leave this pod**, any time before the event, with no penalty up to 24 hours before (v3 #11).

### E. At the event

- **Meet at the corner** at the set time. People say their own first names, the normal way.
- **The phone goes away** (v3 #18). The only in-app action at the event is optional.
- **"We met":** tap each pod-mate you actually met. A meeting counts only when **both** people tap it. Firefly never uses location to check it.
- **Always available:** block, report (including "unwanted advance" and "selling or spam"), leave.

Check-in and the wider room stay as designed in v3 and are not needed for this loop.

### F. After the event (within 2 hours, open for 72)

- **Notification within 2 hours:** "How was Kits Run Club? Anyone you'd like to keep meeting?"
- **The keep-meeting screen** lists only the pod-mates you **both** marked as met. Now that they've met, it shows their first name (from v4 onboarding), plus their card.
- **One tap each:** **Keep meeting** / **Not this time**.
- **The liking-gap line:** "People usually underestimate how much others enjoyed talking to them" (Boothby 2018, v3 #22).
- **Picks are private.** A one-sided pick is never shown or hinted at (CLAUDE.md §8.4), is stored encrypted, and is deleted when the 72-hour window closes, subject to the privacy review's retention rules.

### G. Mutual: sharing socials

When both people pick **Keep meeting**:

1. Both see: **"You and Sam both want to keep meeting."** Nothing appears for anyone else.
2. **"Share a way to stay in touch?"** Each person chooses, separately, which socials to share with this person: Instagram, LinkedIn, or others on the list. **Nothing is pre-selected.** Socials are entered here, the first time they're needed, not in onboarding.
3. **"Not now"** is a full answer. Either person can share later from the connection.
4. **Honest about what can't be undone:** "Once Sam sees your handle, Firefly can't take it back. You can still block Sam in Firefly at any time."
5. **The connection stays in Firefly**: first names, the event you met at, and **the next event you're both likely to enjoy** ("Kits Run Club is on again Tuesday"), so meeting again doesn't depend on DMs (v3 §6).

---

## Who sees what, and when

| Data | Who sees it | When it ends |
|------|-------------|--------------|
| Going list | Owner only (v4) | Deleted a set time after each event |
| "Open to meeting" and intent for an event | Owner; pod-mates see the intent | The event ends + 1 hour (reveal), then deleted with the going list |
| Interests, prompt answer | Pod-mates, on the card | While the pod exists |
| Pod-makeup preference (if collected) | Nobody. Used only to form pods | Until the person changes it or deletes the account |
| "We met" taps | Nobody until both tap; then the two people | The 72-hour pick window |
| Picks | Nobody. Only a mutual pick is revealed, and only to the two people | Non-mutual: deleted when the window closes |
| First name | The other person, only after a mutual "We met" | With the connection |
| Socials | Only the specific people the owner shared each one with | Until the account is deleted (shared copies can't be recalled) |

All of these are enforced in RLS, not only in the UI (CLAUDE.md §8.2).

## Safety notes

- **Small events can identify people.** At a 12-person class, "co-founder, design + climbing" can point to one person. So intents are shown **only inside the pod**, never to the whole event, and nothing shows counts below the threshold (CLAUDE.md §8.6). Pods form only above a minimum number of opted-in people.
- **No gender on any card**, ever. If a pod-makeup preference is collected, it is private, used only by the pod-forming job, and covered by the privacy review.
- **Verification still applies.** Phone, 18+ check, and the v3 selfie liveness check (#28) before joining a first pod. The selfie is used only for verification and never shown.
- **Off-platform risk.** Sharing socials moves the relationship outside Firefly, where block can't reach (v3 #29). Mitigation: socials only after a mutual "We met" and a mutual pick, per network, per person; block and report still remove someone from all future pods; reports cover behaviour off the app.
- **No dark patterns.** No "someone wants to keep meeting you", no count of picks received, no streaks.

## Metrics (proposals, set at pilot)

| Step | Metric |
|------|--------|
| B | % of confirmed "I'm going" that opt in to meeting people |
| C | % of opted-in people who get a pod |
| E | % of pods where at least 3 people mutually mark "We met" |
| F | % of mutual "We met" pairs who both pick Keep meeting |
| G | % of mutual connections that share at least one social |
| — | **North star (from v3):** % of mutual connections meeting again within 21 days |
| — | "Did you feel safe?" ≥ 90% yes, zero serious incidents |

## Open decisions

- **First name before the event?** v3 showed first name and photo on the reveal so faces were familiar on arrival (#20). This draft shows neither. Pilot both if the corner turns out hard to find.
- **In-app 1:1 chat**, or sharing socials only for the first group release.
- **Intent compatibility rules** (which intents can share a pod), and whether to use a 1–2 intent limit.
- **Pod-makeup preference:** whether to collect gender privately for it at all. Needs the privacy review.
- **Which social networks** are on the list, and whether to allow a phone number.
- **Pod chat** 30 minutes before (v3) or the pod word and meeting point alone.
- **Pod size** and the minimum number of opted-in people per event.
- **Retention** for intents, "We met" taps and picks.

Gaps raised by this draft are #53–#55 in [open-gaps.md](open-gaps.md#h-connection-flow).
