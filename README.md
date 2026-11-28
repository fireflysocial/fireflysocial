# Firefly

Firefly brings together people who share a sense of purpose, at the events happening across their city: startup meetups, run clubs, gallery openings, hackathons, language exchanges and many other events where people get to talk (concerts, loud bars and large venues are left out of the feed). People come for friendship, a professional network, collaborators or a co-founder. It is built for many cities across several countries, starting with Vancouver. This repository holds the research, the product design and the app: **iOS and Android apps plus a web version**, built from one React + TypeScript + Vite codebase with Supabase, wrapped for the app stores with Capacitor. See [engineering/quality-and-ci.md §0](engineering/quality-and-ci.md#0-platforms-ios-android-and-web) for the platform plan.

**Launch scope (decided 2026-11-25):** an easy onboarding and a personal event feed, with events found by AI-assisted search ([workflow/v4-user-flow.md](workflow/v4-user-flow.md)). Groups, the Firefly corner, picks and chat come next; hosts are long-term ([workflow/v3-user-flow.md](workflow/v3-user-flow.md)).

## Status

- **Built:** tooling and CI, and the public landing page (`src/features/landing/`), frontend only. Its Get started and Log in links go straight to sign-up at `/app/sign-in` (no invite waitlist, decided 2026-11-28).
- **Launch flow (frontend):** onboarding, the personal feed, going and plans under `/app`, running on made-up example events and on-device storage until the backend and event pipeline exist.
- **Next:** the backend (auth, profiles, the going list) and the event pipeline.
- **Native apps:** Capacitor 8 with `ios/` and `android/` projects (2026-11-27). Run `npm run cap:ios` or `npm run cap:android` (needs Xcode / Android Studio). Supabase is initialised locally with no migrations.

## Pitch deck

**[Open the Firefly pitch deck](https://claude.ai/artifact/PCzS7mCZL2jRaWLY3UpTqg)** (claude.ai Slides; private until shared from its Share menu, which also exports PowerPoint and PDF).

Its source lives in [pitch/](pitch/README.md), which maps each slide to the docs it depends on. Update the slides there when the product changes, then republish to the same link.

## Getting started

```sh
nvm use                                  # Node 24 (see .nvmrc); older Node won't run the tests
npm install
cp .env.example .env.local               # then fill in the Supabase URL and publishable key
npx playwright install chromium webkit   # first time only, for E2E tests
npm run dev
```

Never commit `.env.local`, and never put the Supabase secret (service-role) key in a `VITE_` variable: those ship in the app bundle.

## Checks

All of these run in CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) on pull requests targeting `main`, and `main` only accepts changes through a PR with every check green.

| Command | Checks |
|---|---|
| `npm run lint` and `npm run format:check` | ESLint with zero warnings, Prettier |
| `npm run typecheck` | TypeScript |
| `npm run test:coverage` | Vitest unit and component tests, with **100% coverage** of `src/` required |
| `npm run test:e2e` | Playwright on iPhone, Pixel and desktop Chrome, with axe accessibility checks |
| `npm run test:db` | pgTAP database tests (needs Docker and `npm run db:start`) |

New code ships with the tests that keep coverage at 100%. See [engineering/quality-and-ci.md](engineering/quality-and-ci.md) for the full testing and CI setup, and [CLAUDE.md](CLAUDE.md) for the working rules (git workflow, Supabase, privacy and safety, code conventions).

---

Research docs: see the [documentation audit](research/documentation-audit.md) for corrections, source-access limitations, and claims still awaiting verification.

## Repository structure

```
CLAUDE.md, AGENTS.md   # guide for contributors and AI agents (kept identical)
PRODUCT.md             # product truth for design work (users, voice, principles)
DESIGN.md              # design system as built (tokens, type, components, motion)
.impeccable/           # design briefs per surface (surfaces/) and Impeccable config
research/
  README.md            # open questions + the decision each one informs
  problem.md           # inspiration and problem statement
  competitors/         # landscape overview + one file per competitor
  organizers.md        # event supply in Vancouver, the first city
  interviews/          # findings from pre-existing interviews and studies
  safety-privacy.md
  science.md
  documentation-audit.md, citation-audit.md
brand/                 # logo files, colours and usage (README.md)
workflow/
  v4-user-flow.md      # current spec for launch: onboarding, event pipeline, personal feed
  v3-user-flow.md      # next phase: pods, Firefly corner, picks, chat; hosts (long-term)
  v1-user-flow.md      # older v2 draft (filename kept)
  open-gaps.md         # gap → proposed fix → how we'll validate it
engineering/
  quality-and-ci.md    # testing strategy, coverage, CI pipeline, branch protection, Supabase workflow
pitch/                 # pitch deck source and README (live deck linked above)
src/
  lib/                 # pure logic (feed ranking, email checks, the landing page's firefly maths)
  data/                # data access; accounts and profiles (Supabase), stubs for example events and on-device plans
  components/          # shared UI (FireflyMark)
  features/landing/    # the public landing page
                       # tests sit next to the code as *.test.ts(x)
e2e/                   # Playwright specs
supabase/              # config, migrations, seed, pgTAP tests
.github/               # CI workflow, Dependabot, PR template
```
