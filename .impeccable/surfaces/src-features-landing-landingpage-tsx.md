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

Constraints: always dark (confirmed 2026-11-25; revised that day from Night to soft black #050505, no blue in the interface). The field is a three-tone firefly cloud (Glow, Dusk violet, Ember warm white), approved 2026-11-25: "I want more colors like luganolivinglab". In the interface, Glow stays the one bright highlight per screen; Dusk is a quiet second accent for state and 'coming next'. Flat squares and dots, no blur or bloom. Reduced motion gets still frames. Phone first (360 px), 60fps on phones.

## Direction contract

THESIS: A city of fireflies, and the app is the one that answers you. The page proves personal fit first (tap what you like, the feed re-ranks live), then shows where it goes: strangers falling into step. It refuses the category's stock-photo-of-friends hero and app-store-badge layout.

OWN-WORLD: Soft black #050505 edge to edge, warm white ink #F2F2EE, warm grey muted text. The field: thousands of tiny flat squares in clumps and dark voids, drifting along a curl-noise flow like smoke, in Glow #D9F84A, Dusk #C3A0FF and Ember #F2ECCE, thinning to near-black behind text. Interface accents: one Glow highlight per screen; Dusk for picked chips, the 'Coming next' marker and strip separators. Host Grotesk, very large and tight. Two-line labels, hairline rules, square controls; warm-white invite cell. No blue in the interface. No cards, shadows, gradients.

STORY: The visitor reads the promise, taps the dark and sees fireflies answer, tries the interest chips and watches a sample feed re-rank with reasons, learns how launch works, sees the coming pod-sync story labelled "Coming next", reads the safety promises, requests an invite.

FIRST VIEWPORT: Full-height black field with a dense three-tone firefly cloud gathered in the open upper band, thinning to clean black behind the text. Block header: mark cell, "Firefly / Vancouver", warm-white "Get an invite" cell. H1 bottom-left at display scale: "Meet your people at the events you'd go to anyway." Intro beside it (wide) or below it (phone). Bottom row: "Tap the dark. They answer." left, "How it picks ↓" jump to the feed demo right. Primary action: header invite cell.

FORM: Lugano Living Lab-style civic grotesk minimalism, on black, fused with a Lugano-style dense colour particle cloud (curl-noise drift, pointer stir, tap answers) and a Kuramoto-sync pod, plus a live re-ranking feed demo in a phone (Payy-style lime on black). seed: none (pinned) — the user (2026-11-25, with a Lugano screenshot): "can we more colors and this kind of animation as shown in luganolivinglab.ch"; earlier: the user: "make it like black or something with a very distinct firefly interface ... take more inspiration from superhero.io", choosing "Soft black #050505" and "Launch first, vision second", on top of the earlier pin "Beautiful https://www.luganolivinglab.ch/en. This is what it is".

SIGNATURE INTERACTION: move a pointer (or finger) through the dark and the lights along its path are swept aside, then spring back home (the cloud heals; it never scars), and every light it wakes falls into step with the beat of the Firefly mark's tail, flashing together before drifting apart; tap and the lights within reach flash back in a ripple spreading outward from the touch (call and response). Off under reduced motion. Revised 2026-11-25 after the user reported fast cursor movement leaving a weird pattern, and asked for a unique Firefly touch and the brand embedded in the hero.

HERO MARK: part of the hero cloud gathers into the Firefly mark in the open band (centred above the text on phones, above the intro column on wide screens), Dusk and Ember wings with a solid Glow tail that keeps the beat. It is the cloud taking the mark's shape, not the logo file, so it uses the cloud's tones. Gathered already under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Invite form backend (Supabase table + RLS) is a follow-up PR.
- Real event photography, if any, once there are consenting participants.
