---
version: 1
slug: "src-features-landing-landingpage-tsx"
primary_target: "src/features/landing/LandingPage.tsx"
related_targets: []
---

# Surface: public landing page (`/`)

Scope: the web landing page at `/`, rendered by `src/features/landing/LandingPage.tsx`. Visitor mode: **Persuade**. Build path: code-led (no image generation on this machine).

Audience: a newcomer to Vancouver (co-op student, recent arrival) on a phone, deciding whether Firefly is worth trying. Job: understand in seconds that Firefly puts you in the same small pod at an event you already go to, week after week. Action: request an invite (UI only for now; the form saves nothing until the waitlist backend lands in a later PR). Attendees only; hosts get their own page later.

Proof on hand: the mechanism itself (demonstrated by the field), Hall (2019) on hours to friendship, the safety rules. No users, partners, counts or testimonials exist; never invent them. The example pod is synthetic and labelled.

Constraints: always Night on this page (confirmed 2026-11-25, an exception to the app's light/dark rule). One Glow per composition: the pod. Flat dots, no blur or bloom. Reduced motion gets a still, already-synced frame. Phone first (360 px).

## Direction contract

THESIS: Friendship is repetition made visible. Fireflies that keep meeting start flashing in unison; the page dramatizes that sync instead of shipping the category's photo-of-smiling-friends hero with app-store badges.

OWN-WORLD: Night ground (#0E1424) edge to edge, hundreds of faint Wing-light (#C9CFDE) dots, one Glow (#D9F84A) pod of five. Host Grotesk, very large and tight, white on Night; small two-line labels (muted line over white line); hairline rules; solid block header cells; no cards, no shadows, no gradients.

STORY: The visitor sees a city of strangers, watches five dots gather into a pod at a named event, sees their flashes converge week by week, learns the three steps and the safety rules, then requests an invite.

FIRST VIEWPORT: Full-height Night field of drifting dim dots. Block header across the top: mark cell, two-line "Firefly / Vancouver", "Get an invite" cell on the right. Three event labels across the middle. Bottom-left, the H1 "Keep meeting the same faces." at display scale over two to three lines; bottom-right "/// Scroll". The primary action is the header's invite cell.

FORM: Lugano Living Lab-style civic grotesk minimalism fused with a scroll-driven Kuramoto-sync particle field. seed: none (pinned) — the user: "Beautiful https://www.luganolivinglab.ch/en. This is what it is, get started with the implementation of the homepage", approving the "Fireflies sync up" concept.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Invite form backend (Supabase table + RLS) is a follow-up PR.
- Real event photography, if any, once the pilot has consenting participants.
