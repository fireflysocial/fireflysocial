# Engineering quality, testing & CI plan

Status: **Phases 1, 2 and 4 are implemented** (scaffold, local quality tooling, CI, E2E). Supabase is initialised locally with a pgTAP guardrail test, but no remote project, keys or migrations exist yet (Phase 3). Branch rules and repo security settings are applied in the GitHub UI (see §6).

**Stack:** React + TypeScript (Vite), Supabase (Postgres, Auth, Storage), Vitest, Playwright, GitHub Actions, CodeRabbit. **Package manager:** npm. **Node:** 24 LTS (pinned in `.nvmrc`; run `nvm use`).

### Version pins to revisit
| Pin | Why | Revisit when |
|---|---|---|
| TypeScript `~6.0` (not 7) | `typescript-eslint` supports TS `<6.1` only | typescript-eslint adds TS 7 support |
| `overrides` for `eslint-plugin-jsx-a11y` → ESLint 10 | Plugin's peer range stops at ESLint 9; verified its rules still run on ESLint 10 | jsx-a11y publishes ESLint 10 support, then delete the override |

---

## 1. Principles

1. **The database is the security boundary.** A Supabase client talks to Postgres almost directly, so Row Level Security (RLS) policies protect user data, not the frontend. Firefly makes safety and privacy commitments (see [safety-privacy.md](../research/safety-privacy.md)), so every RLS policy gets an automated test.
2. **Test at the right layer.** Use unit tests for logic, integration tests against a real local Supabase, and a small number of E2E tests for key user flows. Don't mock Supabase to test anything you could test against the real thing.
3. **Fail early and locally.** Catch problems in the editor or pre-commit hook first, then CI. Production should never be the first place a problem shows up.
4. **`main` is always deployable.** Nothing merges without green required checks.
5. **No 100% coverage goal.** New logic ships with tests, and coverage thresholds act as a floor, not a target.

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
| AI review | CodeRabbit | Already set up. |
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

**Location:** colocated next to the code, e.g. `src/lib/matching.ts` → `src/lib/matching.test.ts`.

### 3.2 Component tests (Vitest + React Testing Library)
- Query elements the way a user finds them (`getByRole`, `getByLabelText`), not by test IDs where possible.
- Test behaviour (what renders and what happens on click), not implementation details.
- Mock the data layer at the module boundary or with MSW. Don't mock the Supabase client's internals.

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
Cover the critical paths from the [v3 user flow](../workflow/v3-user-flow.md), and nothing more:
1. Sign up / sign in
2. Browse and find an event
3. RSVP / join
4. Register-and-return flow for "Around the city" events
5. Core safety actions (report / block)

Rules:
- Run against the production build (`vite build` + `vite preview`), which Playwright's `webServer` starts automatically.
- Once flows touch data: run against local Supabase with deterministic seed data (`supabase/seed.sql`).
- Run an axe accessibility check on each key page.
- Record traces and screenshots on failure, and upload them as CI artifacts.
- Start with Chromium only. Add WebKit (Safari/iOS behaviour) and a mobile viewport once the flows stabilize.

### 3.6 Definition of done for a PR
- [ ] New or changed logic has unit tests
- [ ] Schema change → migration file + regenerated types + pgTAP tests for any new or changed RLS
- [ ] UI change → component test; new key flow → E2E test
- [ ] All CI checks green; CodeRabbit comments addressed or dismissed with a reason

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
| `unit` | `vitest run --coverage` with thresholds enforced |
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
.prettierrc.json / .prettierignore   # docs folders are excluded from Prettier
eslint.config.js
vitest.config.ts             # jsdom, setup file, coverage thresholds
playwright.config.ts
src/test/setup.ts            # jest-dom matchers + cleanup
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
- [ ] Ruleset on `main` with these as required checks (GitHub UI, after the first CI run so the check names exist)
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
- [x] `e2e` job in CI
- [ ] Sign-in and core-flow specs as features land

**Phase 5: Environments**
- [ ] Staging Supabase project (or branching)
- [ ] Preview deploys per PR; optionally run Playwright against the preview URL
- [ ] Sentry

---

## 9. Open decisions

- **Routing / data fetching:** e.g. React Router + TanStack Query
- **Hosting for previews:** Vercel / Netlify / Cloudflare Pages
- **Staging strategy:** separate Supabase project vs Supabase branching
- **Coverage threshold:** currently 80% on `src/lib/**`, no global threshold on UI. Revisit once there's real code.
