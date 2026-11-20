# Firefly: agent guide

This file tells AI coding agents (and humans) how to work in this repository. Read it fully before making changes. `AGENTS.md` is a copy of this file for agents that read that name instead; keep the two identical.

---

## 1. What Firefly is

Firefly helps people in Vancouver make **platonic** friends by meeting the same small group ("pod") repeatedly at recurring real-world events they'd go to anyway: run clubs, board-game cafés, language exchanges. It is aimed at newcomers and people who want more friends, and is positioned as "get more out of the events you already go to", never as an app for lonely people.

**Platforms: iOS and Android apps (App Store and Google Play) plus a web version, all from this one React codebase.** The native apps wrap the Vite web build with Capacitor (planned, not added yet). Treat the phone as the primary device for every attendee-facing feature. See section 9 ("Mobile-first and cross-platform") and [engineering/quality-and-ci.md §0](engineering/quality-and-ci.md#0-platforms-ios-android-and-web).

Key documents (read the relevant ones before building a feature):

| Document                                                       | Read it when                                                                                                                                               |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [workflow/v3-user-flow.md](workflow/v3-user-flow.md)           | Building any user-facing feature. This is the **current product spec**: roles, event types, host flow, attendee flow (steps 0–7), trust & safety, metrics. |
| [workflow/open-gaps.md](workflow/open-gaps.md)                 | A flow step references a gap number like **[#11]**.                                                                                                        |
| [research/safety-privacy.md](research/safety-privacy.md)       | Touching profiles, visibility, check-in, picks, chat, photos, reports, blocking, or data retention.                                                        |
| [engineering/quality-and-ci.md](engineering/quality-and-ci.md) | Changing tooling, tests, CI, or the Supabase workflow.                                                                                                     |
| [brand/README.md](brand/README.md)                             | Doing any visual or UI work.                                                                                                                               |

`workflow/v1-user-flow.md` is the older v2 draft (the filename was kept). Use v3.

### Current status

- The app is **scaffolded only**: tooling, tests and CI work, but no product features exist yet.
- **Capacitor and the `ios/` / `android/` projects don't exist yet.** They're added right before auth or QR check-in is built. Until then, write code so it will work inside the native apps unchanged (section 9).
- Supabase is initialised locally (`supabase/`) with no migrations. The cloud project exists, and its URL and publishable key go in `.env.local` (git-ignored).
- The flow documents describe **proposed** behaviour, not implemented behaviour. Don't describe a design as shipped.

---

## 2. Stack

| Area                   | Choice                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------- |
| UI                     | React 19, TypeScript, Vite 8                                                        |
| Native apps            | Capacitor wrapping the web build for iOS and Android (**planned**)                  |
| Backend                | Supabase (Postgres, Auth, Storage, Edge Functions)                                  |
| Unit / component tests | Vitest 5 + React Testing Library + jest-dom (jsdom)                                 |
| E2E tests              | Playwright (Chromium) + `@axe-core/playwright`                                      |
| DB tests               | pgTAP via `supabase test db`                                                        |
| Lint / format          | ESLint 10 (typescript-eslint strict type-checked, react-hooks, jsx-a11y) + Prettier |
| Git hooks              | Husky + lint-staged (lint + format staged files on commit)                          |
| CI                     | GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml))               |
| Review                 | CodeRabbit on every PR                                                              |
| Package manager        | **npm** (not pnpm or yarn)                                                          |
| Node                   | **24** (pinned in `.nvmrc`; run `nvm use` first)                                    |

### Version pins: do not change without a reason

- **TypeScript stays on `~6.0`.** typescript-eslint doesn't support TypeScript 7 yet ([typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)). Upgrading breaks `npm ci` and every CI job. Migrate only once typescript-eslint ships TS 7 support.
- **`@types/node` stays on 24**, matching the Node major in `.nvmrc`.
- **The `overrides` entry for `eslint-plugin-jsx-a11y`** in `package.json` lets it install alongside ESLint 10, which its peer range doesn't list yet. Its rules have been verified to run. Remove it when the plugin officially supports ESLint 10.
- Don't add or swap frameworks or major libraries (state management, router, UI kit, ORM, cross-platform framework) without asking. Capacitor is the chosen native wrapper; don't introduce React Native, Expo, Ionic UI components or a PWA-only approach. Routing and data fetching are still open decisions (likely React Router + TanStack Query).

---

## 3. Commands

Run `nvm use` once per shell first.

| Command                                   | Does                                                     |
| ----------------------------------------- | -------------------------------------------------------- |
| `npm run dev`                             | Vite dev server                                          |
| `npm run build`                           | Typecheck + production build                             |
| `npm run preview`                         | Serve the production build                               |
| `npm run typecheck`                       | `tsc -b`                                                 |
| `npm run lint` / `npm run lint:fix`       | ESLint, **zero warnings allowed**                        |
| `npm run format` / `npm run format:check` | Prettier                                                 |
| `npm test`                                | Vitest in watch mode                                     |
| `npm run test:run`                        | Vitest once                                              |
| `npm run test:coverage`                   | Vitest with coverage thresholds (what CI runs)           |
| `npx vitest run src/path/file.test.ts`    | Run one test file                                        |
| `npm run test:e2e`                        | Playwright (builds and previews the app automatically)   |
| `npm run test:e2e:ui`                     | Playwright interactive UI                                |
| `npm run db:start` / `db:stop`            | Start / stop local Supabase (**requires Docker**)        |
| `npm run db:reset`                        | Recreate local DB from migrations + seed                 |
| `npm run test:db`                         | pgTAP tests (local Supabase must be running)             |
| `npm run db:types`                        | Regenerate `src/types/database.ts` from the local schema |

**Before saying a change is done**, run: `npm run lint && npm run typecheck && npm run test:run`, plus `npm run test:e2e` if UI or routing changed and `npm run test:db` if the schema changed (or say clearly that you couldn't run it, e.g. Docker isn't available).

---

## 4. Repository layout

```
src/
  main.tsx              # entry point
  App.tsx               # root component
  test/setup.ts         # Vitest setup (jest-dom matchers, cleanup)
  lib/                  # pure logic, no React/Supabase imports (80% coverage threshold)
  data/                 # typed Supabase data-access functions (planned)
  components/           # shared UI components (planned)
  features/<feature>/   # feature-scoped components, hooks, tests (planned)
  lib/platform/         # the ONLY place that touches device features: camera, push, storage, share, links (planned)
  types/database.ts     # GENERATED by `npm run db:types`; never edit by hand
e2e/                    # Playwright specs (*.spec.ts)
ios/ android/           # native projects generated by Capacitor (planned; don't hand-edit generated files)
supabase/
  config.toml
  migrations/           # timestamped SQL migrations, the only way the schema changes
  seed.sql              # deterministic, fake seed data
  tests/database/       # pgTAP tests (*.test.sql)
.github/                # CI workflow, Dependabot config, PR template
engineering/            # engineering docs
research/ workflow/ brand/   # product research, spec and brand (prose docs)
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
- Times and dates: use fake timers or inject "now". Never depend on the real clock or the machine's timezone. Firefly's timezone is `America/Vancouver`; test across DST changes for anything scheduled.
- Tests must be deterministic: no real network, no random data without a fixed seed, no ordering dependence between tests.
- Never weaken, skip (`.skip`, `.only`), or delete a failing test to make CI pass. Fix the code, or explain why the test is wrong and ask.
- Don't lower coverage thresholds in `vitest.config.ts`.

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

Firefly tells strangers "this person is here and open to meeting people". Built carelessly, it becomes a tool for finding people who are alone at a known place. These rules come from [research/safety-privacy.md](research/safety-privacy.md) and [workflow/v3-user-flow.md](workflow/v3-user-flow.md). If a task seems to conflict with one, **stop and ask**. Don't work around it.

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
11. **18+ only, platonic only.** The platonic pledge is part of onboarding. Report categories include unwanted romantic advances and selling.
12. **No dark patterns:** no guilt streaks, no "someone liked you" upsells, no manipulative notifications.
13. **Never log personal data** (names, phone numbers, photos, picks, reports, check-ins) to the console, analytics or error tracking.

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

### Mobile-first and cross-platform

The same code runs in a mobile browser, the iOS app (WKWebView) and the Android app (Android WebView).

- **Design at phone width first** (around 375 px), then scale up. Touch targets are at least 44×44 pt. No hover-only interactions.
- **Respect safe areas** (notch, home indicator) with `env(safe-area-inset-*)`.
- **Device features go through `src/lib/platform/` only:** camera, push notifications, secure storage, share sheet, haptics, opening external links or the in-app browser. Feature code imports from there and never calls `navigator.*`, `window.open`, or Capacitor plugins directly. Each wrapper has a web implementation now and gets a native one when Capacitor is added.
- **No browser-only assumptions:** no `window.open` popups, no web push as a substitute for native push, no cookie-based auth, no `alert`/`confirm`/`prompt` dialogs.
- **Auth must survive the native apps:** prefer phone OTP (the spec's verification method). Any magic-link or OAuth flow must return via a deep link. Store the Supabase session through a pluggable storage adapter so it can move to secure native storage.
- **Assume a flaky network.** Phones lose signal at events: show loading and offline states, and make check-in and picks safe to retry (idempotent).
- **App store requirements are product requirements:** in-app account deletion (that deletes the Supabase rows and photos too), report and block on all user content, accurate privacy labels / Google Play data safety answers for anything collected, 18+ rating, and Sign in with Apple if any other social sign-in is added. Google Play additionally requires a web link for account deletion requests.

### Accessibility

- Use semantic HTML first (`button`, `a`, `label`, headings in order). Every image has `alt` (empty for decorative).
- Every interactive element is keyboard reachable with a visible focus state.
- New key pages get an axe check in their E2E spec. jsx-a11y lint errors are blocking.

### Visual design

Use the brand palette from [brand/README.md](brand/README.md): Night `#0E1424`, Glow `#D9F84A`, Wing `#313C62`.

- **Glow is for one highlight per screen**, and must never carry text or essential indicators on a white or light background (contrast is too low).
- No gradients, glows or drop shadows on the mark.
- Support light and dark mode.

---

## 10. Product language

Copy in the UI, notifications, code comments and docs should use Firefly's vocabulary:

| Use                                                  | Avoid                         |
| ---------------------------------------------------- | ----------------------------- |
| pod, pod-mate                                        | match, date                   |
| keep meeting, pick                                   | swipe, like, crush            |
| new in town, meet people at events you already go to | lonely, loneliness, desperate |
| check in                                             | track, locate                 |
| host, partner host, pod host                         | admin (in user-facing copy)   |

Roles in the spec: **attendee**, **partner host**, **pod host** (volunteer), **Firefly team**. Event types: **partner event**, **Around the city**, **starter event**. Use these names in code (types, enums, table names) so the code matches the spec.

---

## 11. Docs and research conventions

- When changing `research/` or `workflow/` docs: cite sources inline, use absolute dates (e.g. "reviewed 2026-11-15"), label proposals as proposals, and don't strengthen a claim beyond what its source says. See [research/documentation-audit.md](research/documentation-audit.md).
- If you change behaviour that the spec describes, update [workflow/v3-user-flow.md](workflow/v3-user-flow.md) in the same PR, or note the divergence in the PR description.
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
