# Engineering quality, testing & CI plan

Status: **Phases 1, 2 and 4 are implemented** (scaffold, local quality tooling, CI, E2E). Supabase is initialised locally with a pgTAP guardrail test, but no remote project, keys or migrations exist yet (Phase 3). Branch rules and repo security settings are applied in the GitHub UI (see §6).

**Platforms:** **iOS and Android apps** (App Store and Google Play) plus a **web** version, all built from one React codebase. The native apps wrap the web build with [Capacitor](https://capacitorjs.com/) (added 2026-11-27, see §0).

**Stack:** React + TypeScript (Vite), Capacitor 8, Supabase (Postgres, Auth, Storage), Vitest, Playwright, GitHub Actions, CodeRabbit. **Package manager:** npm. **Node:** 24 LTS (pinned in `.nvmrc`; run `nvm use`).

### Version pins to revisit
| Pin | Why | Revisit when |
|---|---|---|
| TypeScript `~6.0` (not 7) | `typescript-eslint` supports TS `<6.1` only | typescript-eslint adds TS 7 support |
| `overrides` for `eslint-plugin-jsx-a11y` → ESLint 10 | Plugin's peer range stops at ESLint 9; verified its rules still run on ESLint 10 | jsx-a11y publishes ESLint 10 support, then delete the override |

---

## 0. Platforms: iOS, Android and web

Firefly is a phone-first product: QR check-in at the event, push notifications for pod reveal and "who would you like to keep meeting?", and the phone goes away after check-in. The attendee experience is built for **iOS and Android first**; the web version uses the same code.

| Platform | Ships as | Role |
|---|---|---|
| **iOS** | App Store app (Capacitor shell around the web build) | Primary attendee app |
| **Android** | Google Play app (Capacitor shell around the web build) | Primary attendee app |
| **Web** | The Vite build, hosted | Day-to-day development and testing; early pilots before store release; possibly host tools on desktop (open decision) |

### Why Capacitor (and not React Native)
- One codebase and one UI for all three platforms; everything already set up (Vite, Vitest, Playwright, CI) keeps working.
- Firefly's screens (event lists, pod cards, check-in, picks, chat) are standard app UI and don't need React Native's native rendering.
- Native features come through Capacitor plugins: **push notifications** (APNs / FCM), **camera** (QR check-in, profile photos), **secure storage** (auth session), **deep links** (auth redirects, event links), in-app browser (register-and-return flow).
- Escape hatch: if Firefly outgrows Capacitor, `src/lib` (logic) and `src/data` (Supabase access) carry over to React Native unchanged; only the UI is rewritten.

### Capacitor setup (added 2026-11-27)
The original plan was to add it right before auth or QR check-in. It was added earlier, with the launch flow, so the apps are deployable from the start (decided 2026-11-27).

- **Config:** `capacitor.config.ts`: app ID `com.fireflysocial.app` (permanent once in the stores), app name Firefly, `webDir: 'dist'`, black background so there's no white flash, iOS `contentInset: 'never'` because safe areas are handled in CSS.
- **Projects:** `ios/` (Swift Package Manager, no CocoaPods) and `android/` are committed. Their copied web assets and generated config files are git-ignored by Capacitor's own `.gitignore` files. Prettier and ESLint skip both folders.
- **Plugins:** `@capacitor/browser` (the in-app browser for "Register ↗") and `@capacitor/app` (knowing when the person comes back). Neither asks for a native permission.
- **Workflow:** `npm run cap:sync` after any web change you want in the apps; `npm run cap:ios` / `npm run cap:android` sync and open Xcode / Android Studio. Building needs Xcode and Android Studio locally.
- **Tests:** plugin modules are mocked at the import boundary in unit tests (`src/test/capacitorMocks.ts`; Capacitor's plugin proxies can't be spied on). Native-only behaviour is checked by hand on the iOS Simulator and Android Emulator until native CI exists.
- **Not done yet:** Firefly app icons and splash screens (still Capacitor's defaults), deep links, push, secure storage.

### Build rules that apply now (so the apps drop in cleanly)
- **Design mobile-first:** phone width first, 44×44 pt minimum touch targets, safe-area insets (`viewport-fit=cover` + `env(safe-area-inset-*)`).
- **One wrapper for device features:** camera, push, storage, share, haptics, opening external links all go through `src/lib/platform/`. Feature code never calls browser-only or plugin APIs directly, so switching from web implementations to Capacitor plugins only touches that folder.
- **No browser-only assumptions:** no `window.open` popups, no web push in place of native push, no reliance on cookies for auth (use Supabase's token session with a pluggable storage adapter), no hover-only interactions.
- **Auth must work with deep links.** Prefer phone OTP (already the spec's verification method), which doesn't need redirects. Any magic-link or OAuth flow must return to the app via a deep link.

### App store requirements to design for
These are review requirements, not optional polish. Check the current store policies when building each one; they change.

| Requirement | Apple App Store | Google Play |
|---|---|---|
| Report, block and moderation for user content | Required (guideline 1.2) | Required (user-generated content policy) |
| Account deletion | In-app deletion required | In-app **and** a web link for deletion requests |
| Data disclosure | Privacy "nutrition" labels | Data safety form |
| Social sign-in | Sign in with Apple required if other third-party social logins are offered | n/a |
| Age rating | 18+ (with the age-assurance pre-pilot gate) | Mature / 18+ content rating |
| Developer account | Apple Developer Program, $99 USD/year; enrolling as an organisation needs a D-U-N-S number | One-time $25 USD; new **personal** accounts must run a closed test with a minimum number of testers before production, so an **organisation** account is recommended |

### Native CI (later)
macOS runners use about 10× the GitHub Actions minutes on private repos, so iOS builds don't run on every PR. Plan: web CI stays the required gate; native builds run locally at first, then via Xcode Cloud / Fastlane (or a hosted service) for TestFlight and Play internal testing before release.

---

## 1. Principles

1. **The database is the security boundary.** A Supabase client talks to Postgres almost directly, so Row Level Security (RLS) policies protect user data, not the frontend. Firefly makes safety and privacy commitments (see [safety-privacy.md](../research/safety-privacy.md)), so every RLS policy gets an automated test.
2. **Test at the right layer.** Use unit tests for logic, integration tests against a real local Supabase, and a small number of E2E tests for key user flows. Don't mock Supabase to test anything you could test against the real thing.
3. **Fail early and locally.** Catch problems in the editor or pre-commit hook first, then CI. Production should never be the first place a problem shows up.
4. **`main` is always deployable.** Nothing merges without green required checks.
5. **100% unit coverage of `src/`** (decided 2026-11-25; this replaces the earlier "no 100% goal" principle). Every statement, branch, function and line is covered by unit or component tests, and CI fails below 100%. New code ships with the tests that keep it there. See §3.8.

---

## 2. Tooling

| Concern | Tool | Notes |
|---|---|---|
| Language | TypeScript, `strict: true` | Also enable `noUncheckedIndexedAccess`. Run `tsc --noEmit` in CI. |
| Lint | ESLint (flat config) + `typescript-eslint` (type-checked rules), `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` | ESLint handles correctness only, not formatting. |
| Format | Prettier | Use `eslint-config-prettier` to avoid rule conflicts. |
| Pre-commit | Husky + lint-staged | Lint and format staged files only, to keep it fast. |
| Commits | Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`) | commitlint is optional. |
| Unit / component tests | Vitest + React Testing Library + `@testing-library/user-event` + jsdom | Coverage via `@vitest/coverage-v8`. |
| Network mocking | MSW (Mock Service Worker) | Only for component tests that need canned API responses. |
| Validation | Zod | Shared schemas for forms and API boundaries. These are easy to unit test. |
| DB tests | pgTAP via `supabase test db` | RLS, functions, triggers, constraints. |
| Local backend | Supabase CLI (`supabase start`) | Same stack locally and in CI. |
| E2E | Playwright | Plus `@axe-core/playwright` for accessibility checks. |
| AI review | CodeRabbit | Already set up. Repo settings live in `.coderabbit.yaml` (e.g. how to review the pitch sources in `pitch/`). |
| AI design review | [Impeccable](https://impeccable.style) skill for Claude Code (`.claude/skills/impeccable`) | Installed 2026-11-24 with `npx impeccable install --providers=claude --scope=project`; refresh with `npx impeccable update`. Gives agents `/impeccable` commands (`critique`, `audit`, `polish`, …). The automatic design hook lives in each developer's git-ignored `.claude/settings.local.json`, so rerun the installer to get it. `npx impeccable detect src/` runs the detector with no agent. Not in CI yet. |
| Fonts | Self-hosted WOFF2 in `src/assets/fonts/`, declared in `src/index.css` | Host Grotesk (SIL OFL), a variable font: one file per subset covers every weight, about 32 KB in total. Fetched with `.claude/skills/impeccable/scripts/impeccable font-fetch "<Family>" --out src/assets/fonts`. Never load fonts from a CDN at runtime: it leaks visitors' IP addresses to a third party and fails offline. |
| Security | GitHub secret scanning + push protection, Dependabot | CodeQL needs the paid GitHub Code Security add-on on private repos, so it's deferred. |
| Error monitoring | Sentry | Add before launch. |

---

## 3. Testing strategy

```
            ▲  E2E (Playwright)         few, slow, key user flows only
           ▲▲▲ Integration / DB (pgTAP, data layer vs local Supabase)
        ▲▲▲▲▲▲▲ Unit + component (Vitest)   many, fast, run on every save
```

### 3.1 Unit tests (Vitest)
Test pure logic, with no network and no Supabase:
- Matching and recommendation logic
- Date, time, and timezone handling (event times, "starting soon", and similar)
- Zod schemas and form validation
- Formatting and helper functions
- Custom hooks that wrap pure logic
- Animation and simulation maths, kept out of components. Example: the landing page's firefly field (`src/lib/fireflies/`) has a seeded random generator, seeded Perlin noise (`noise.ts`), the colour cloud with curl-noise drift, pointer stir and tap answers (`cloud.ts`), the Kuramoto synchrony model, the pod and the scroll-to-story mapping, all tested without a canvas (for instance, "a coupled pod reaches order parameter > 0.95 within 6 simulated seconds").

**Location:** colocated next to the code, e.g. `src/lib/matching.ts` → `src/lib/matching.test.ts`.

### 3.2 Component tests (Vitest + React Testing Library)
- Query elements the way a user finds them (`getByRole`, `getByLabelText`), not by test IDs where possible.
- Test behaviour (what renders and what happens on click), not implementation details.
- Mock the data layer at the module boundary or with MSW. Don't mock the Supabase client's internals. Example: `LandingPage` takes an optional `onRequestInvite`, so tests pass their own function instead of mocking `src/data/invites.ts`.
- **No canvas in jsdom.** `src/test/setup.ts` makes `HTMLCanvasElement.prototype.getContext` return `null` before every test (jsdom would otherwise log "Not implemented"), so canvas components must handle a missing context. A test that needs to check drawing calls `withCanvas()` from `src/test/fakeCanvas.ts`, which mocks `getContext` with a small fake that records calls and stubs `ResizeObserver`, `IntersectionObserver` and `requestAnimationFrame` with `vi.stubGlobal` (the setup file restores them after each test); a test drives the animation by running `frame(ms)`.
- Hooks that read `matchMedia` (such as `usePrefersReducedMotion`) are tested by stubbing `window.matchMedia`; they must also work when it doesn't exist.

### 3.3 Database tests (pgTAP)
Every table with RLS gets tests that act as different users (anonymous, user A, user B, organizer, attendee, non-attendee) and assert allowed **and** denied access. Example cases:
- A user can read and update their own profile but not another user's private fields.
- A non-attendee cannot see an event's exact location if it's restricted to attendees.
- A user cannot RSVP on someone else's behalf.
- A blocked user cannot see the blocker's activity.

Also test: Postgres functions, triggers, constraints, and that every table in `public` has RLS enabled. That last one is a single catch-all test that stops a new table from shipping unprotected.

**Location:** `supabase/tests/*.test.sql`

### 3.4 Integration tests (Vitest against local Supabase)
The typed data-access layer (`src/data/*`) runs against the real local Supabase with seed data. These tests catch query, type, and policy mismatches that mocks would hide. Run them as a separate Vitest project (`vitest --project integration`) so plain unit tests stay fast.

### 3.5 E2E tests (Playwright)
Cover the critical paths from the [v4 user flow](../workflow/v4-user-flow.md) (launch) and, later, the [v3 user flow](../workflow/v3-user-flow.md) (group features), and nothing more:
1. The public landing page (`e2e/home.spec.ts`, done): headline and invite action visible, axe, no horizontal scroll, the firefly canvas actually paints, scrolling the story reveals the week counter, the header link reaches the invite form, form validation and the honest "not open yet" state, and a reduced-motion still frame.
2. Onboarding: sign up / sign in, interests, first personal feed (launch)
3. Personal feed: feedback, save, and the register-and-return confirmation (launch)
4. Core safety actions: report a listing now; report / block people once group features exist
5. Group features (next phase): join a group, the Firefly corner, picks

Rules:
- Run against the production build (`vite build` + `vite preview`), which Playwright's `webServer` starts automatically.
- Once flows touch data: run against local Supabase with deterministic seed data (`supabase/seed.sql`).
- Run an axe accessibility check on each key page.
- Record traces and screenshots on failure, and upload them as CI artifacts.
- Phone viewports are primary. Every spec runs on three Playwright projects:
  - **`mobile-safari`**: iPhone 17, 402 px, WebKit. Closest to the iOS WKWebView Capacitor uses.
  - **`mobile-chrome`**: Pixel 10, 360 px, Chromium. Closest to the Android WebView. 360 px is the common width for mainstream Android phones and the narrowest width tested, so layout bugs show up here first.
  - Update these to the newest models Playwright ships when it adds them (`devices` in `@playwright/test`).
  - **`desktop-chrome`**: secondary check for the web version.
- Every page gets a "does not scroll horizontally" check, since that's the most common phone-layout bug.
- Anything that animates gets a `test.describe` block with `test.use({ reducedMotion: 'reduce' })` that checks the still alternative. Canvas content is invisible to locators, so check it by reading pixels in `page.evaluate()` (see `paintedPixels` in `e2e/home.spec.ts`).
- `e2e/` has its own `tsconfig.e2e.json` with DOM types, for code passed to `page.evaluate()`.
- Playwright tests the web layer only. Native-only behaviour (push, camera, deep links, store builds) is tested on iOS Simulator / Android Emulator; add Maestro flows for these once the native apps exist.

### 3.6 Testing on real devices
Simulated viewports don't catch everything (real touch, safe areas, performance, keyboard behaviour). Spot-check UI changes on real hardware:

1. `npm run dev:host`, then open the printed **Network** URL on the device (same Wi-Fi as the Mac).
2. **Android phone:** turn on Developer options → USB debugging, plug into the Mac, open `chrome://inspect` in desktop Chrome for full DevTools.
3. **iPad / iPhone:** turn on Settings → Apps → Safari → Advanced → Web Inspector, then Safari on the Mac → Develop → *device* for full DevTools. On iPad, Split View or Slide Over narrows Safari to roughly phone width.
4. **iPhone sizes and safe areas:** the iOS Simulator in Xcode (free, every model).

Real iPhone hardware is not available on the team yet; before the pilot, cover it with TestFlight testers, a borrowed device, or a cloud device service.

### 3.7 Definition of done for a PR
- [ ] New or changed logic has unit tests
- [ ] Schema change → migration file + regenerated types + pgTAP tests for any new or changed RLS
- [ ] UI change → component test; new key flow → E2E test
- [ ] `npm run test:coverage` still reports 100% on every metric
- [ ] All CI checks green; CodeRabbit comments addressed or dismissed with a reason

### 3.8 Coverage: 100%, and how to keep it

`vitest.config.ts` enforces a global 100% threshold on statements, branches, functions and lines across `src/**`. The `unit` CI job runs `npm run test:coverage`, fails below it, writes a coverage table to the job summary and uploads the HTML report as the `coverage` artifact.

- **Excluded:** test files, `src/test/**`, generated `src/types/**`, and `src/main.tsx` (it only mounts `<App />`; E2E covers it). Don't add to this list to get past the threshold.
- **Hard-to-reach code:** restructure first, so impossible states don't exist (for example, create an object up front instead of keeping it nullable, or pair values instead of indexing a parallel array). Test browser-only paths with small fakes (see the `FireflyField` and `FeedDemo` tests).
- **Ignore hints are a last resort**, only for code that provably can't run, such as a fallback that `noUncheckedIndexedAccess` forces on an index that's always in range. Put the reason on the line above and use `/* v8 ignore next -- @preserve */` (`@preserve` stops the build from stripping the comment). Never ignore code just because it's awkward to test.
- **Node 24 is required.** On older Node, jsdom's dependencies crash at load time, so `vitest.config.ts` stops with a clear message telling you to run `nvm use`.

---

## 4. Supabase workflow

- **All schema changes go through migrations** (`supabase migration new <name>`). No editing schema in the dashboard.
- **Seed data** in `supabase/seed.sql`, shared by local dev, CI, and E2E.
- **Generated types:** `npm run db:types`. CI regenerates them and fails if the diff isn't empty, which means the types are stale. This check switches on automatically once `src/types/database.ts` is first committed.
- **Docker is required** to run Supabase locally (`npm run db:start`, `npm run test:db`). CI runners already have it.
- **Environments:** local → staging (separate Supabase project, or Supabase branching) → production. **Tests never run against production.**
- **Keys:** the anon key can be used in the client. The **service-role key never goes into frontend code or the repo.** It lives only in GitHub Environment secrets and server-side functions.

---

## 5. CI pipeline (GitHub Actions)

One workflow, `.github/workflows/ci.yml`, triggered on `pull_request` and `push` to `main`.

```
 ┌──────────────┐
 │ lint+format  │──┐
 ├──────────────┤  │
 │ typecheck    │──┤
 ├──────────────┤  ├──► e2e (Playwright + local Supabase)
 │ unit (vitest)│──┤
 ├──────────────┤  │
 │ db (pgTAP +  │──┘
 │ migrations + │
 │ types check) │
 └──────────────┘
```

| Job | Runs |
|---|---|
| `lint` | `eslint .` and `prettier --check .` |
| `typecheck` | `tsc --noEmit` |
| `unit` | `vitest run --coverage` with a 100% threshold on every metric → coverage table in the job summary → upload `coverage/` |
| `db` | `supabase db start` (Postgres only; migrations applied from scratch) → `supabase test db` → type-drift check |
| `e2e` | install Chromium → `playwright test` (builds + previews the app) → upload report on failure |

Workflow conventions:
- `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }` so new pushes cancel stale runs.
- Cache the npm store via `actions/setup-node`.
- Set top-level `permissions: contents: read`, and grant more per job only where needed.
- Pin third-party Actions to a commit SHA, not a tag.
- Use the Node version from `.nvmrc`, shared with local dev.

Separate config:
- CodeQL: **deferred.** The repo is private, and CodeQL there requires GitHub Code Security (paid). Add `codeql.yml` if the repo goes public or the add-on is purchased.
- Dependabot config (`.github/dependabot.yml`): weekly npm + GitHub Actions updates, grouped minor and patch updates.

---

## 6. Branch protection (GitHub rulesets on `main`)

- Require a pull request before merging (no direct pushes)
- Require status checks to pass: `lint`, `typecheck`, `unit`, `db`, `e2e`
- Require branches to be up to date before merging
- Require conversation resolution (CodeRabbit threads included)
- Linear history; **squash merge only**; auto-delete head branches
- Block force pushes and deletions
- Required approvals: **0 while solo** (required checks + CodeRabbit act as the gate). Raise to 1 and add `CODEOWNERS` when a second contributor joins.

Repo settings:
- Secret scanning + **push protection** on
- Dependabot alerts + security updates on
- Private vulnerability reporting on

---

## 7. Repo files to add

```
.github/
  workflows/ci.yml
  dependabot.yml
  pull_request_template.md
.husky/pre-commit            # runs lint-staged
.lintstagedrc.json
.nvmrc                       # 24
.env.example                 # documented, no real values
.prettierrc.json / .prettierignore   # docs folders and pitch/ are excluded from Prettier
eslint.config.js
vitest.config.ts             # jsdom, setup file, coverage thresholds
playwright.config.ts
src/test/setup.ts            # jest-dom matchers + cleanup
src/test/fakeCanvas.ts       # shared fake canvas context, observers and animation frame
supabase/
  config.toml
  migrations/
  seed.sql
  tests/database/            # pgTAP
e2e/                         # Playwright specs
```

### npm scripts
| Script | Does |
|---|---|
| `dev` / `build` / `preview` | Vite dev server / production build / serve the build |
| `dev:host` | Dev server reachable from phones and tablets on the same Wi-Fi |
| `typecheck` | `tsc -b` |
| `lint` / `lint:fix` | ESLint, zero warnings allowed |
| `format` / `format:check` | Prettier |
| `test` / `test:run` / `test:coverage` | Vitest watch / single run / with coverage thresholds |
| `test:e2e` / `test:e2e:ui` | Playwright headless / interactive UI |
| `test:db` | pgTAP tests against local Supabase (needs Docker + `db:start`) |
| `db:start` / `db:stop` / `db:reset` / `db:types` | Local Supabase lifecycle and type generation |

---

## 8. Rollout order

**Phase 1: Scaffold & local quality**
- [x] Vite + React + TS scaffold, `strict` mode
- [x] ESLint, Prettier, Husky + lint-staged
- [x] Vitest + RTL with one example test
- [x] `.nvmrc`, `.env.example`, PR template

**Phase 2: CI & branch rules**
- [x] `ci.yml` with `lint`, `typecheck`, `unit`, `db`, `e2e`
- [x] Ruleset on `main` with these as required checks
- [ ] Secret scanning + push protection, Dependabot alerts (GitHub UI)
- [x] Dependabot version-update config

**Phase 3: Supabase**
- [x] `supabase init`, empty seed file
- [x] pgTAP: "RLS enabled on all tables" guardrail
- [x] `db` job in CI
- [ ] Remote project(s), keys in GitHub Environments, `@supabase/supabase-js` client
- [ ] First migration + `npm run db:types` committed (switches on the type-drift check)
- [ ] First per-policy RLS tests

**Phase 4: E2E**
- [x] Playwright + axe; smoke spec for the home page
- [x] Landing page spec (2026-11-25): story scroll, invite form, canvas paint check, reduced motion
- [x] `e2e` job in CI
- [ ] Sign-in and core-flow specs as features land

**Phase 5: Environments**
- [ ] Staging Supabase project (or branching)
- [ ] Preview deploys per PR; optionally run Playwright against the preview URL
- [ ] Sentry (with the Capacitor SDK once native apps exist)

**Phase 6: iOS and Android apps**
- [x] Mobile-first groundwork: `viewport-fit=cover` + safe-area CSS, mobile Playwright projects, horizontal-scroll check, `dev:host`
- [x] `src/lib/platform/` wrapper (2026-11-27): external links in the in-app browser, returning to the app
- [x] Add Capacitor 8, `ios/` and `android/` projects (2026-11-27)
- [ ] Firefly app icons and splash screens
- [ ] Push notifications (APNs + FCM), camera QR scanning, deep links, secure session storage
- [ ] Apple Developer and Google Play organisation accounts
- [ ] Store requirements: account deletion, privacy labels / data safety, content rating, Sign in with Apple if needed
- [ ] TestFlight + Play internal testing builds; native CI (Xcode Cloud / Fastlane)

---

## 9. Open decisions

- **Data fetching:** e.g. TanStack Query, once a real backend exists (routing decided 2026-11-27: React Router 8)
- **Hosting for previews:** Vercel / Netlify / Cloudflare Pages
- **Long-term role of the web version:** attendee web app, host tools only, or development/pilot only
- **Push provider:** Capacitor push plugin (APNs/FCM) sending from Supabase Edge Functions, vs a hosted service
- **Native build pipeline:** Xcode Cloud / Fastlane / a hosted service
- **Staging strategy:** separate Supabase project vs Supabase branching
