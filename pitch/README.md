# Pitch deck

Firefly's pre-seed pitch deck: 10 slides in the order YC-backed seed decks use (restructured 2026-11-27): title, problem, solution, traction, unique advantage, business model, market, team, ask, close. Design discipline is applied to every slide rather than given one: large type, one idea per slide, the caveats in the speaker notes. The narrative borrows from Airbnb, the product framing from Dropbox, and the business model framing from LinkedIn.

- **Live, editable deck:** <https://claude.ai/artifact/PCzS7mCZL2jRaWLY3UpTqg> (a claude.ai Slides artifact; private until shared from its Share menu, which also exports PowerPoint and PDF).
- **Source of truth:** the files in [`project/`](project/). The deck is republished from them, so change the files here and republish (or, after editing in the browser, pull the changes back here). Don't let the two drift.

## Files

| Path | What it is |
|------|------------|
| `project/deck.json` | Index: title, slide order, sections, typeface |
| `project/deck.css` | Shared styles: brand palette, type scale (160 / 88 / 44 / 32 / 24 px), cards, motion |
| `project/slides/<id>.html` | One slide each: exactly one `<section id="<id>">` on a 1920×1080 canvas, speaker notes in its last `<aside>` |

Prettier ignores this folder on purpose: the Slides format needs each file to stay a single bare `<section>`.

The typeface is Host Grotesk, uploaded to the artifact from [`src/assets/fonts/`](../src/assets/fonts/) (never loaded from a font CDN). `deck.json` points at that upload (`/_blob/…`); keep the reference as it is.

## Keeping it in step with the product

Each slide rests on a document in this repo. When that document changes, check the slide.

| Slide(s) | Depends on | Update when |
|----------|------------|-------------|
| cover, close | [PRODUCT.md](../PRODUCT.md) positioning | The one-line positioning changes |
| problem | [research/interviews/](../research/interviews/) (Daily Hive, Vancouver Foundation) | Newer or better survey data arrives |
| solution | [workflow/v4-user-flow.md](../workflow/v4-user-flow.md) onboarding and feed, [v3](../workflow/v3-user-flow.md), [research/science.md](../research/science.md) | The launch flow changes, pods or picks are redesigned or ship, or a **real screenshot** exists (replace the design-concept phone) |
| traction | [v4 launch metrics](../workflow/v4-user-flow.md#launch-metrics), CLAUDE.md "Current status" | Anything ships, or real numbers exist (waitlist, interviews, pilot results) |
| advantage | [research/competitors/](../research/competitors/), [research/organizers.md](../research/organizers.md), [statcan-friendship-surveys.md](../research/interviews/statcan-friendship-surveys.md) | A competitor changes, or the event pipeline approach or the evidence changes |
| model | [research/organizers.md](../research/organizers.md) | Pricing or revenue lines are tested with real customers |
| market | Census and newcomer data (to do) | Market sizing is done |
| team | [research/problem.md](../research/problem.md) | The team or the founder story changes |
| ask | — | The raise, its split or the milestone changes |

## Rules

- **Never invent proof.** No made-up users, numbers, partners, quotes or results ([PRODUCT.md](../PRODUCT.md), "Evidence on Hand"). Unknown figures stay as bracketed placeholders like `[__]` until they are real.
- **Don't strengthen a claim beyond its source**, and keep each slide's source line. Label one person's account as one person's account, and organizers we've mapped as mapped, not as partners.
- **Don't describe a design as shipped.** Say "next" or "design concept" until it is built.
- **Use the product vocabulary** (CLAUDE.md §10): pod, pick, check in, "new in town"; never "lonely app", match or swipe.
- **Brand:** soft black ground, Glow `#D9F84A` once per slide, Dusk `#C3A0FF` for labels, no blue in the interface ([brand/README.md](../brand/README.md)).
- **Sensitive data:** once the placeholders hold the raise, its split and contact details, think about who can read this repo before committing them.

## Republishing

Ask Claude Code to republish the deck from `pitch/` to the artifact URL above. It publishes the changed files with `root: pitch`, so the link and its sharing settings stay the same. If the deck was edited in the browser since the last publish, read the artifact back first and merge those edits into `project/`.
