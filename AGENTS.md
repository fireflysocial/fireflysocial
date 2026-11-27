# Firefly: agent guide

This file tells AI coding agents (and humans) how to work in this repository. Read it fully before making changes. `AGENTS.md` is a copy of this file for agents that read that name instead; keep the two identical.

---

## 1. What Firefly is

Firefly brings together people who share a sense of purpose, at the events happening across their city: startup meetups, run clubs, gallery openings, hackathons, language exchanges, volunteer days and many other events where people get to talk (concerts, loud bars and large venues are left out of the feed). People come for different things: friendship, a professional network, collaborators, a co-founder (positioning broadened 2026-11-25 from platonic friendship only). The problem it solves is follow-through, not supply: there are plenty of events, but they rarely turn into anything. Firefly finds events that fit each person, and over time brings together people going to the same events, takes the friction out of approaching, and helps connections grow with consent at every step. It is aimed at newcomers and anyone looking for their people, and is positioned as "get more out of the events you already go to", never as an app for lonely people.

**Multi-city, multi-country (decided 2026-11-27):** Firefly is built to run in many cities across several countries. Vancouver is the first launch city and the pilot, not the product's identity. Never hard-code a city, country, timezone, currency, language or neighbourhood list; each comes from the event or the person's chosen city. The research in `research/` is Vancouver-based because that's where it started: keep citing it as Vancouver evidence, and don't generalise its numbers to other places.

**Launch scope (decided 2026-11-25):** an extremely easy onboarding and a personal event feed, with events found by AI-assisted search. No hosts and no groups at launch; groups, the Firefly corner, picks and chat come next, and hosts are long-term.

**Platforms: iOS and Android apps (App Store and Google Play) plus a web version, all from this one React codebase.** The native apps wrap the Vite web build with Capacitor (added 2026-11-27; app ID `com.fireflysocial.app`). Treat the phone as the primary device for every attendee-facing feature. See section 9 ("Mobile-first and cross-platform") and [engineering/quality-and-ci.md §0](engineering/quality-and-ci.md#0-platforms-ios-android-and-web).

Key documents (read the relevant ones before building a feature):

| Document                                                       | Read it when                                                                                                                                          |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [workflow/v4-user-flow.md](workflow/v4-user-flow.md)           | Building any user-facing feature. This is the **current product spec** for launch: the event pipeline, onboarding, the personal feed, going, metrics. |
| [workflow/v3-user-flow.md](workflow/v3-user-flow.md)           | Building group features (pods, the Firefly corner, picks, chat, check-in) or host features. Next phase and long-term; to be redesigned on top of v4.  |
| [workflow/open-gaps.md](workflow/open-gaps.md)                 | A flow step references a gap number like **[#11]**.                                                                                                   |
| [research/safety-privacy.md](research/safety-privacy.md)       | Touching profiles, visibility, check-in, picks, chat, photos, reports, blocking, or data retention.                                                   |
| [engineering/quality-and-ci.md](engineering/quality-and-ci.md) | Changing tooling, tests, CI, or the Supabase workflow.                                                                                                |
| [brand/README.md](brand/README.md)                             | Doing any visual or UI work.                                                                                                                          |
| [PRODUCT.md](PRODUCT.md)                                       | Doing any design work. Product truth for design (users, voice, principles, evidence that must never be invented), read by `/impeccable`.              |
| [DESIGN.md](DESIGN.md)                                         | Doing any visual or UI work. The design system (tokens, type, components, motion) as built; read by `/impeccable`.                                    |
| `.impeccable/surfaces/*.md`                                    | Changing a designed surface. Each holds that page's brief and direction contract (e.g. the landing page's).                                           |
| [pitch/README.md](pitch/README.md)                             | Changing anything a pitch slide states: positioning, launch scope, status, metrics, research. Maps each slide to the docs it depends on.              |

`workflow/v1-user-flow.md` is the older v2 draft (the filename was kept). Use v4 for launch and v3 for later group and host features.

### Current status

- **Built:** the public landing page (`src/features/landing/`), frontend only. Its invite form is UI only: `src/data/invites.ts` is a stub that always fails honestly until the waitlist table, RLS and pgTAP tests land in a follow-up PR. Don't deploy the page publicly before then.
- **Next to build:** onboarding, the event pipeline and the personal feed ([v4](workflow/v4-user-flow.md)). No attendee features exist yet.
- **Capacitor 8 is set up** (added 2026-11-27): `capacitor.config.ts`, the generated `ios/` and `android/` projects, and the Browser and App plugins (no native permissions beyond Android's default internet access). Building the apps needs Xcode (iOS) and Android Studio (Android) on the developer's machine; CI builds the web only. App icons and splash screens are still Capacitor's defaults.
- Supabase is initialised locally (`supabase/`) with no migrations. The cloud project exists, and its URL and publishable key go in `.env.local` (git-ignored).
- The flow documents describe **proposed** behaviour, not implemented behaviour. Don't describe a design as shipped.

---

## 2. Stack

| Area                   | Choice                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| UI                     | React 19, TypeScript, Vite 8                                                                                          |
| Native apps            | Capacitor 8 wrapping the web build for iOS and Android (`@capacitor/browser`, `@capacitor/app`)                       |
| Backend                | Supabase (Postgres, Auth, Storage, Edge Functions)                                                                    |
| Unit / component tests | Vitest 5 + React Testing Library + jest-dom (jsdom)                                                                   |
| E2E tests              | Playwright on mobile Safari (iPhone 17, WebKit), mobile Chrome (Pixel 10) and desktop Chrome + `@axe-core/playwright` |
| DB tests               | pgTAP via `supabase test db`                                                                                          |
| Lint / format          | ESLint 10 (typescript-eslint strict type-checked, react-hooks, jsx-a11y) + Prettier                                   |
| Git hooks              | Husky + lint-staged (lint + format staged files on commit)                                                            |
| CI                     | GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml))                                                 |
| Review                 | CodeRabbit on every PR (settings in `.coderabbit.yaml`)                                                               |
| Design review          | Impeccable agent skill (`/impeccable`), vendored in `.claude/skills/`; see engineering/quality-and-ci.md §2           |
| Package manager        | **npm** (not pnpm or yarn)                                                                                            |
| Node                   | **24** (pinned in `.nvmrc`; run `nvm use` first)                                                                      |

### Version pins: do not change without a reason

- **TypeScript stays on `~6.0`.** typescript-eslint doesn't support TypeScript 7 yet ([typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)). Upgrading breaks `npm ci` and every CI job. Migrate only once typescript-eslint ships TS 7 support.
- **`@types/node` stays on 24**, matching the Node major in `.nvmrc`.
- **The `overrides` entry for `eslint-plugin-jsx-a11y`** in `package.json` lets it install alongside ESLint 10, which its peer range doesn't list yet. Its rules have been verified to run. Remove it when the plugin officially supports ESLint 10.
- Don't add or swap frameworks or major libraries (state management, router, UI kit, ORM, cross-platform framework) without asking. Capacitor is the chosen native wrapper; don't introduce React Native, Expo, Ionic UI components or a PWA-only approach. Routing and data fetching are still open decisions (likely React Router + TanStack Query).

---

## 3. Commands

Run `nvm use` once per shell first. On older Node (e.g. 22), Vitest refuses to start and tells you to run `nvm use`: jsdom's dependencies need Node 24.

| Command                                   | Does                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `npm run dev`                             | Vite dev server                                                                                        |
| `npm run dev:host`                        | Dev server reachable from a phone or tablet on the same Wi-Fi (see engineering/quality-and-ci.md §3.6) |
| `npm run build`                           | Typecheck + production build                                                                           |
| `npm run preview`                         | Serve the production build                                                                             |
| `npm run cap:sync`                        | Build the web app and copy it and the plugins into `ios/` and `android/`                               |
| `npm run cap:ios` / `npm run cap:android` | Sync, then open the project in Xcode / Android Studio to run it on a simulator, emulator or device     |
| `npm run typecheck`                       | `tsc -b`                                                                                               |
| `npm run lint` / `npm run lint:fix`       | ESLint, **zero warnings allowed**                                                                      |
| `npm run format` / `npm run format:check` | Prettier                                                                                               |
| `npm test`                                | Vitest in watch mode                                                                                   |
| `npm run test:run`                        | Vitest once                                                                                            |
| `npm run test:coverage`                   | Vitest with the 100% coverage threshold (what CI runs)                                                 |
| `npx vitest run src/path/file.test.ts`    | Run one test file                                                                                      |
| `npm run test:e2e`                        | Playwright (builds and previews the app automatically)                                                 |
| `npm run test:e2e:ui`                     | Playwright interactive UI                                                                              |
| `npm run db:start` / `db:stop`            | Start / stop local Supabase (**requires Docker**)                                                      |
| `npm run db:reset`                        | Recreate local DB from migrations + seed                                                               |
| `npm run test:db`                         | pgTAP tests (local Supabase must be running)                                                           |
| `npm run db:types`                        | Regenerate `src/types/database.ts` from the local schema                                               |

**Before saying a change is done**, run: `npm run lint && npm run typecheck && npm run test:coverage` (it must stay at 100%), plus `npm run test:e2e` if UI or routing changed and `npm run test:db` if the schema changed (or say clearly that you couldn't run it, e.g. Docker isn't available).

---

## 4. Repository layout

```
src/
  main.tsx              # entry point
  App.tsx               # root component
  index.css             # global tokens (brand palette, safe areas), self-hosted font, base styles
  test/setup.ts         # Vitest setup (jest-dom matchers, cleanup, canvas stub)
  test/fakeCanvas.ts    # fake 2D context, observers and animation frame for canvas component tests
  assets/fonts/         # self-hosted WOFF2 fonts (Host Grotesk, SIL OFL)
  lib/                  # pure logic, no React/Supabase imports
    fireflies/          # landing-page fields: seeded random and noise, firefly swarm, hero meadow, Kuramoto sync, pod, scroll story
  data/                 # typed Supabase data-access functions (invites.ts is a stub for now)
  components/           # shared UI components (FireflyMark)
  features/<feature>/   # feature-scoped components, hooks, tests (landing/ exists)
  lib/platform/         # the ONLY place that touches device features: external links, returning to the app (camera, push, storage come later)
  types/database.ts     # GENERATED by `npm run db:types`; never edit by hand
e2e/                    # Playwright specs (*.spec.ts)
ios/ android/           # native projects generated by Capacitor (edit native settings in Xcode / Android Studio; never edit copied web assets)
capacitor.config.ts     # app ID, app name, webDir
supabase/
  config.toml
  migrations/           # timestamped SQL migrations, the only way the schema changes
  seed.sql              # deterministic, fake seed data
  tests/database/       # pgTAP tests (*.test.sql)
.github/                # CI workflow, Dependabot config, PR template
engineering/            # engineering docs
research/ workflow/ brand/   # product research, spec and brand (prose docs)
pitch/project/          # pitch deck source (claude.ai Slides artifact; see pitch/README.md)
```

"Planned" folders don't exist yet. Create them following this layout instead of inventing a new one.

---

## 5. Git and PR workflow

- **Never commit or push directly to `main`.** `main` is protected: changes land through a pull request with all CI checks green (`lint`, `typecheck`, `unit`, `db`, `e2e`), squash-merged.
- Branch names: `feat/<short-name>`, `fix/<short-name>`, `chore/…`, `docs/…`, `test/…`, `ci/…`.
- **Conventional Commits:** `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `ci:`, `refactor:`. Imperative mood, lower case, no trailing period. Explain the _why_ in the body when it isn't obvious.
- Keep PRs small and focused on one thing. Fill in [.github/pull_request_template.md](.github/pull_request_template.md).
- Address CodeRabbit comments or reply with why you're not changing it.
- Only commit, push or open PRs when the user asks you to.
- Never use `--no-verify` to skip the pre-commit hook. Fix the problem instead.
- Never commit `.env`, `.env.local` or any real key. Only `.env.example` (empty values) is committed.

---

## 6. Testing rules

Every change that adds or changes behaviour ships with tests **in the same PR**. Write the test first when practical.

**Unit coverage of `src/` is 100%, and stays there.** `vitest.config.ts` enforces 100% statements, branches, functions and lines, and the `unit` CI job (`npm run test:coverage`) fails below it. Every new file, branch and function you add needs a unit or component test that runs it. Only test files, `src/test/**`, generated `src/types/**` and `src/main.tsx` (covered by E2E) are excluded. See [engineering/quality-and-ci.md §3.8](engineering/quality-and-ci.md#38-coverage-100-and-how-to-keep-it).

- If code is hard to reach, restructure it so the impossible state can't exist, or test the browser-only path with a small fake. Don't widen the exclude list.
- `/* v8 ignore next -- @preserve */` is allowed only for code that provably can't run (e.g. a `noUncheckedIndexedAccess` fallback on an index that's always in range), with the reason in a comment on the line above. Never use it to skip code that's merely awkward to test.

| Layer       | Tool                          | Put it in                                               | Use it for                                                                                                                                                                                 |
| ----------- | ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit        | Vitest                        | Next to the code: `foo.ts` → `foo.test.ts`              | Pure logic in `src/lib`: matching, pod formation, scheduling, date/time and timezone handling, validation, formatting                                                                      |
| Component   | Vitest + RTL                  | Next to the component: `Foo.tsx` → `Foo.test.tsx`       | Rendering and interaction                                                                                                                                                                  |
| Integration | Vitest against local Supabase | `src/data/*.test.ts` (planned, separate Vitest project) | Data-access functions, real queries, real RLS                                                                                                                                              |
| Database    | pgTAP                         | `supabase/tests/database/NN_name.test.sql`              | RLS policies, functions, triggers, constraints                                                                                                                                             |
| E2E         | Playwright                    | `e2e/*.spec.ts`                                         | Critical user flows only, at phone viewport first, plus an axe check on each key page. Native-only behaviour (push, camera, deep links) is checked on the iOS Simulator / Android Emulator |

Conventions:

- Import test APIs explicitly: `import { describe, expect, it } from 'vitest'` (no globals).
- In component tests, query like a user: `getByRole`, `getByLabelText`, `getByText`. Use `data-testid` only as a last resort. Use `@testing-library/user-event` for interactions, not `fireEvent`.
- Test behaviour, not implementation details. Don't snapshot whole components.
- **Don't mock Supabase internals.** For component tests, mock at the module boundary (your own `src/data` functions). Anything about queries or permissions is tested against the real local database.
- Times and dates: use fake timers or inject "now". Never depend on the real clock or the machine's timezone. Every event and city carries its own IANA timezone (Vancouver, the first city, is `America/Vancouver`); never assume one. Test anything scheduled across DST changes and in at least two timezones, including one in the southern hemisphere.
- Tests must be deterministic: no real network, no random data without a fixed seed, no ordering dependence between tests.
- **Canvas and animation:** jsdom has no canvas, so `src/test/setup.ts` makes `getContext` return `null` and canvas components must render safely without one. Keep the maths in `src/lib` (seeded, unit-tested); component tests that need drawing use the shared fake in `src/test/fakeCanvas.ts`. In E2E, prove the canvas actually painted and add a `test.use({ reducedMotion: 'reduce' })` case for anything that animates.
- Never weaken, skip (`.skip`, `.only`), or delete a failing test to make CI pass. Fix the code, or explain why the test is wrong and ask.
- Don't lower the 100% coverage thresholds in `vitest.config.ts` or add exclusions to get past them.

---

## 7. Supabase rules

The database's Row Level Security is Firefly's real security boundary: the app (web, iOS or Android) talks to Postgres directly with the publishable key, so **any row an RLS policy allows can be read by anyone with the app**.

- **Schema changes only through migrations:** `npx supabase migration new <descriptive_name>`, then edit the generated file. Never change the schema in the dashboard.
- **Every table in `public` has RLS enabled** in the same migration that creates it. `supabase/tests/database/00_rls_enabled.test.sql` fails CI otherwise.
- **Every policy gets pgTAP tests** for both allowed and denied cases, acting as different roles: anonymous, the owner, another user, a pod-mate, a non-pod-mate, a host, a blocked user.
- Default to deny. Write narrow policies (`using (auth.uid() = user_id)`), never `using (true)` on user data.
- Prefer exposing restricted views or `security invoker` functions over widening table policies. Avoid `security definer` functions. If one is unavoidable, set `search_path = ''`, keep it minimal, and comment why.
- After changing the schema, run `npm run db:types` and commit `src/types/database.ts`. CI fails if it's stale.
- `supabase/seed.sql` contains only fake, deterministic data. Never real people or real personal data.
- **Keys:**
  - Client code (web and native, which share the same bundle) may only use `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
  - The **secret / service-role key bypasses RLS**. It must never appear in `src/`, in any `VITE_` variable, in the repo, or in logs. It's only for Edge Functions and CI secrets.
  - Anything prefixed `VITE_` is public: it ships in the JavaScript bundle, including inside the downloadable iOS and Android apps, where anyone can extract it.
- Never run tests, seeds, resets or migrations against the production project.

---

## 8. Privacy and safety: non-negotiable engineering rules

Firefly tells strangers "this person is here and open to meeting people". Built carelessly, it becomes a tool for finding people who are alone at a known place. These rules come from [research/safety-privacy.md](research/safety-privacy.md), [workflow/v3-user-flow.md](workflow/v3-user-flow.md) and [workflow/v4-user-flow.md](workflow/v4-user-flow.md). Rules about pods, rooms, picks, check-in and hosts apply from the moment those features are built. If a task seems to conflict with one, **stop and ask**. Don't work around it.

1. **No location data, ever.** Don't use the Geolocation API, collect coordinates, show maps or distances, or track background location. People find each other through a fixed meeting point and time. Presence means "checked in at this event", nothing more.
2. **Three separate visibility scopes**, each enforced in RLS, not just in the UI:
   - **Pod:** consenting assigned pod members see minimal pod profiles before the event.
   - **Room:** opens only after check-in and closes at event end + 1 hour.
   - **Post-event picker:** only eligible pod/met cards, for up to 72 hours, with no live-presence status.
     Nobody can browse citywide who's "open to meet".
3. **Minimal cards for strangers:** first name, photo, 2–3 interests, a prompt. **No last name, socials, workplace or school** before a mutual match.
4. **Picks are private and mutual.** Never reveal a non-mutual pick, directly or indirectly (no "someone picked you", no "X viewed your profile"). 1:1 chat unlocks only on a mutual pick. Each person separately chooses whether to share their own socials. Store picks encrypted; delete non-mutual picks per the retention rules.
5. **Block is permanent, reciprocal and immediate:** hide both people's cards and messages from each other, exclude them from shared pods, and carry the block forward to future events. One-tap block, report and leave must be reachable from every card.
6. **Small counts identify people.** Show attendee counts only above a threshold (e.g. "5+ going"). No public named guest lists.
7. **Photos:** strip EXIF/GPS metadata server-side, store in private buckets, serve only via short-lived signed URLs.
8. **Check-in:** short-lived rotating QR or host confirmation, bound to the event and account, rate-limited. Don't store raw check-in tokens after use.
9. **Data minimisation and expiry:** collect only what a feature needs, ask for consent at the moment it matters (pod reveal, room visibility, sharing socials), and build expiry into the data model (e.g. `expires_at` columns plus scheduled cleanup) rather than leaving it for later.
10. **Hosts see aggregates only.** A role-limited moderation view may identify a _reported_ account. Hosts never see picks, private choices, or reporter identity without consent.
11. **18+ only, good intent only.** A respect pledge is part of onboarding: people are here to meet others with a shared purpose, with no selling, no spam and no unwanted advances. Report categories include unwanted advances and selling or spam.
12. **No dark patterns:** no guilt streaks, no "someone liked you" upsells, no manipulative notifications.
13. **Never log personal data** (names, phone numbers, photos, picks, reports, check-ins, interests, the going list) to the console, analytics or error tracking.
14. **The going list is sensitive:** which events a person confirmed says where they will be and when. It is owner-only in RLS, never shown to anyone else until group features ask for consent, and expires after the event.
15. **No personal data to AI providers.** Event search and extraction run as batch jobs per category and area, never with a user's interests, name or going list. Sending any user data to an AI API needs explicit sign-off (section 12).

---

## 9. Code conventions

### TypeScript

- `strict` and `noUncheckedIndexedAccess` are on. Handle `undefined` from index access explicitly.
- No `any`, no `as` casts to silence errors, no non-null assertions (`!`), no `@ts-ignore`. If you truly need `@ts-expect-error`, add a comment explaining why.
- Validate untrusted input (forms, URL params, Edge Function payloads, environment variables) at the boundary, with a schema, and derive the TypeScript type from it.
- Use Supabase's generated types (`src/types/database.ts`) for all database rows. Don't hand-write row types.
- Import with explicit file extensions where the config requires them (`import App from './App.tsx'` in `main.tsx`; `./vite.config.ts` in Node-side configs).

### React

- Function components and hooks only. Follow the rules of hooks (ESLint enforces it).
- Keep business logic out of components: put it in `src/lib` (pure, unit-tested) or `src/data` (database access).
- One component per file, named in PascalCase; hooks are `useSomething.ts`.

### Linting and formatting

- Lint must pass with **zero warnings**. Don't add `eslint-disable` comments unless unavoidable. If you do, disable one rule on one line and give the reason: `// eslint-disable-next-line rule-name -- reason`.
- Prettier style: no semicolons, single quotes, trailing commas, 100-character lines. Don't hand-format; run `npm run format`.
- Prose docs in `research/`, `workflow/`, `brand/`, `engineering/` and `README.md` are excluded from Prettier on purpose. Don't reformat them.
- `pitch/` (the pitch deck source) is also excluded from Prettier: each slide file must stay one bare `<section>`.

### Mobile-first and cross-platform

The same code runs in a mobile browser, the iOS app (WKWebView) and the Android app (Android WebView).

- **Design at phone width first** (360 px, the narrowest common width), then check up to about 440 px (large iPhones), then scale up. Touch targets are at least 44×44 pt. No hover-only interactions.
- **Respect safe areas** (notch, home indicator). `src/index.css` defines `--safe-top`, `--safe-right`, `--safe-bottom` and `--safe-left` (with `viewport-fit=cover` in `index.html`); use those variables for anything fixed to a screen edge, like headers, tab bars and bottom sheets.
- **Use `dvh`, not `vh`,** for full-height layouts, so they fit when mobile browser toolbars show and hide.
- Every E2E spec runs at iPhone 17 (402 px) and Pixel 10 (360 px) widths. Add a horizontal-scroll check for new pages, and spot-check UI changes on a real device (`npm run dev:host`).
- **Device features go through `src/lib/platform/` only:** camera, push notifications, secure storage, share sheet, haptics, opening external links or the in-app browser. Feature code imports from there and never calls `navigator.*`, `window.open`, or Capacitor plugins directly. Each wrapper has a web and a native implementation; links to outside pages use `src/components/ExternalLink.tsx`.
- **No browser-only assumptions:** no `window.open` popups, no web push as a substitute for native push, no cookie-based auth, no `alert`/`confirm`/`prompt` dialogs.
- **Auth must survive the native apps:** prefer phone OTP (the spec's verification method). Any magic-link or OAuth flow must return via a deep link. Store the Supabase session through a pluggable storage adapter so it can move to secure native storage.
- **Assume a flaky network.** Phones lose signal at events: show loading and offline states, and make check-in and picks safe to retry (idempotent).
- **App store requirements are product requirements:** in-app account deletion (that deletes the Supabase rows and photos too), report and block on all user content, accurate privacy labels / Google Play data safety answers for anything collected, 18+ rating, and Sign in with Apple if any other social sign-in is added. Google Play additionally requires a web link for account deletion requests.

### Accessibility

- Use semantic HTML first (`button`, `a`, `label`, headings in order). Every image has `alt` (empty for decorative).
- Every interactive element is keyboard reachable with a visible focus state.
- New key pages get an axe check in their E2E spec. jsx-a11y lint errors are blocking.

### Visual design

Use the brand palette from [brand/README.md](brand/README.md): Glow `#D9F84A` as the one light, on a **soft black `#050505`** interface ground with warm neutrals (ink `#F2F2EE`, muted `#9A9A92`). **Dusk `#C3A0FF`** (violet) is a quiet second accent for state and "coming next"; the landing page's firefly cloud uses Glow, Dusk and warm white together (decided 2026-11-25). **No blue in the interface** (decided 2026-11-25): Night `#0E1424` and Wing `#313C62` stay inside the logo files only.

- **Glow is for one highlight per screen**, and must never carry text or essential indicators on a white or light background (contrast is too low).
- No gradients, glows or drop shadows on the mark.
- Support light and dark mode; dark mode uses the black ground. **Exception:** the public landing page is always dark, because the dark is its concept (decided 2026-11-25). App screens follow the system setting.
- **Typeface:** Host Grotesk, self-hosted from `src/assets/fonts/` (`@font-face` in `src/index.css`). Never load fonts from a CDN such as Google Fonts: that sends every visitor's IP address to a third party.
- **Motion:** every animation honours `prefers-reduced-motion` with a still alternative that still tells the story. Animate only what carries meaning, and pause canvas loops when they're off-screen or the tab is hidden.
- Read [DESIGN.md](DESIGN.md) for tokens and components, and run `/impeccable` for design work. Never invent proof (users, partners, counts, testimonials); label example content as made up.

---

## 10. Product language

Copy in the UI, notifications, code comments and docs should use Firefly's vocabulary:

| Use                                                                  | Avoid                         |
| -------------------------------------------------------------------- | ----------------------------- |
| pod, pod-mate                                                        | match, date                   |
| keep meeting, pick                                                   | swipe, like, crush            |
| new in town, meet people at events you already go to                 | lonely, loneliness, desperate |
| your people, a shared purpose (friends, collaborators, a co-founder) | "friends only", platonic      |
| check in                                                             | track, locate                 |
| host, partner host, pod host                                         | admin (in user-facing copy)   |

Roles: **attendee** and **Firefly team** at launch; **partner host** and **pod host** (volunteer) are long-term. Event types: at launch every event is found by the pipeline, an **Around the city** event; **partner event** and **starter event** come with hosts. Use these names in code (types, enums, table names) so the code matches the spec.

---

## 11. Docs and research conventions

- When changing `research/` or `workflow/` docs: cite sources inline, use absolute dates (e.g. "reviewed 2026-11-15"), label proposals as proposals, and don't strengthen a claim beyond what its source says. See [research/documentation-audit.md](research/documentation-audit.md).
- If you change behaviour that the spec describes, update [workflow/v4-user-flow.md](workflow/v4-user-flow.md) (or v3 for group and host features) in the same PR, or note the divergence in the PR description.
- If you change something the pitch deck states (positioning, launch scope, what's built, metrics, research), update the affected slides in [pitch/](pitch/README.md) in the same PR, or note in the PR description that the deck is now out of date. Never put invented numbers in it.
- If you change tooling, CI or the test setup, update [engineering/quality-and-ci.md](engineering/quality-and-ci.md) and this file. **Keep `CLAUDE.md` and `AGENTS.md` identical.**

---

## 12. When to stop and ask

Ask the user before you:

- Add a new production dependency, framework or third-party service (especially anything that receives user data: analytics, error tracking, maps, AI APIs).
- Change a privacy or safety behaviour from section 8, or widen who can see any data.
- Change CI workflows, branch protection, Dependabot config or coverage thresholds in a way that relaxes them.
- Upgrade a pinned version from section 2.
- Run anything against the remote Supabase project (`supabase link`, `db push`, remote queries).
- Delete or rewrite existing migrations. Migrations that have been merged are immutable; add a new migration instead.
- Add Capacitor, a native plugin, or native permissions (camera, notifications, contacts, location: location is never allowed, see section 8), or change the app ID / bundle ID.
- Add anything that changes what the app stores disclose (new data collected, new third-party SDK, tracking).
- Launch in a new country. Privacy law (e.g. PIPEDA in Canada, GDPR in the EU and UK, US state laws), data residency, age rules and app store disclosures differ by country and need review first.
