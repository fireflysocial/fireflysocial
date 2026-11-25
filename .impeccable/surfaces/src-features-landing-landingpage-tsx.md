---
version: 1
slug: "src-features-landing-landingpage-tsx"
primary_target: "src/features/landing/LandingPage.tsx"
related_targets: []
---

# Surface: public landing page (`/`)

Scope: the web landing page at `/`, rendered by `src/features/landing/LandingPage.tsx`. Visitor mode: **Persuade**. Build path: code-led (no image generation on this machine).

Audience: a newcomer to Vancouver (co-op student, recent arrival) on a phone, looking for their people (friends, collaborators, maybe a co-founder), deciding whether Firefly is worth trying. Job: understand in seconds that Firefly finds events across Vancouver that fit them, and that it will introduce them to the people going too. Action: request an invite (UI only; the form saves nothing until the waitlist backend lands). Attendees only.

Launch truth (v4, 2026-11-25): at launch Firefly is onboarding plus a personal event feed. Groups, the Firefly corner and picks come next and must be labelled as coming, never as shipped.

Proof on hand: the mechanism (the field, the live feed demo), Hall (2019) on hours to friendship, the safety rules. No users, partners, counts or testimonials exist; never invent them. Example events and the example pod are synthetic and labelled.

Constraints: always dark (confirmed 2026-11-25; revised that day from Night to soft black #050505, no blue in the interface). One Glow per composition. Flat dots, no blur or bloom. Reduced motion gets still frames. Phone first (360 px).

## Direction contract

THESIS: A city of fireflies, and the app is the one that answers you. The page proves personal fit first (tap what you like, the feed re-ranks live), then shows where it goes: strangers falling into step. It refuses the category's stock-photo-of-friends hero and app-store-badge layout.

OWN-WORLD: Soft black #050505 edge to edge, warm white ink #F2F2EE, warm grey muted text, warm firefly-white crowd dots (#E9E6CF), one Glow (#D9F84A) per screen. Host Grotesk, very large and tight. Two-line labels, hairline rules, square controls; the header's invite cell is a warm-white block. No blue anywhere in the interface (Wing survives only inside the mark). No cards, shadows, gradients.

STORY: The visitor reads the promise, taps the dark and sees fireflies answer, tries the interest chips and watches a sample feed re-rank with reasons, learns how launch works, sees the coming pod-sync story labelled "Coming next", reads the safety promises, requests an invite.

FIRST VIEWPORT: Full-height black field of drifting warm dots. Block header: mark cell, "Firefly / Vancouver", warm-white "Get an invite" cell. H1 bottom-left at display scale: "Meet your people at the events you'd go to anyway." (revised 2026-11-25 from "Make friends…": Firefly is for people with a shared purpose, not friendship alone) Intro line beside or below. Bottom row: "/// Tap the dark. They answer." left, "Scroll" cue right. Primary action: header invite cell.

FORM: Lugano Living Lab-style civic grotesk minimalism, on black, fused with a Kuramoto-sync particle field that answers taps, plus a live re-ranking feed demo in a phone (Payy-style lime on black). seed: none (pinned) — the user: "make it like black or something with a very distinct firefly interface ... take more inspiration from superhero.io", choosing "Soft black #050505" and "Launch first, vision second", on top of the earlier pin "Beautiful https://www.luganolivinglab.ch/en. This is what it is".

SIGNATURE INTERACTION: tap or click the dark field; crowd fireflies within reach flash back in a ripple that spreads outward from the touch (call and response, as real fireflies do). Off under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Invite form backend (Supabase table + RLS) is a follow-up PR.
- Real event photography, if any, once there are consenting participants.
