# Firefly

Research, product design, and the app: **iOS and Android apps plus a web version**, built from one React + TypeScript + Vite codebase with Supabase, wrapped for the app stores with Capacitor (planned). Tooling and CI are in place, and the public landing page is built (frontend only: its invite form is not connected yet). Attendee and host features are not built yet. See [engineering/quality-and-ci.md §0](engineering/quality-and-ci.md#0-platforms-ios-android-and-web) for the platform plan.

## Getting started

```sh
nvm use            # Node 24 (see .nvmrc)
npm install
npx playwright install chromium   # first time only, for E2E tests
npm run dev
```

Checks (all run in CI on every PR): `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run test:e2e`. Database tests (`npm run test:db`) need Docker. See [engineering/quality-and-ci.md](engineering/quality-and-ci.md) for the full testing and CI setup.

---

Research docs: See the [documentation audit](research/documentation-audit.md) for corrections, source-access limitations, and claims still awaiting verification.

## Repository structure

```
PRODUCT.md             # product truth for design work (users, voice, principles)
DESIGN.md              # design system as built (tokens, type, components, motion)
.impeccable/           # design briefs per surface (surfaces/) and Impeccable config
research/
  README.md            # open questions + the decision each one informs
  problem.md           # inspiration and problem statement
  competitors/         # landscape overview + one file per competitor
  organizers.md        # Vancouver event supply
  interviews/          # findings from pre-existing interviews and studies
  safety-privacy.md
  science.md
brand/                 # logo, colors, usage
workflow/
  v4-user-flow.md      # current spec for launch: onboarding, event pipeline, personal feed
  v3-user-flow.md      # next phase: pods, Firefly corner, picks, chat; hosts (long-term)
  v1-user-flow.md      # older v2 draft (filename kept)
  open-gaps.md         # gap → proposed fix → how we'll validate it
engineering/
  quality-and-ci.md    # testing strategy, CI pipeline, branch protection, Supabase workflow
src/                   # React app (tests colocated as *.test.tsx)
e2e/                   # Playwright specs
supabase/              # config, migrations, seed, pgTAP tests
.github/               # CI workflow, Dependabot, PR template
```
