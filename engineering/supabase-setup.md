# Supabase setup: accounts and profiles

How to get the `profiles` table, its RLS policies and email sign-in links running, first on your machine and then on the hosted project, so every new account's onboarding answers are stored in the database.

Written 2026-11-28 with the first migration, `supabase/migrations/20261128160027_create_profiles.sql`.

## What the migration creates

| Object | What it does |
|--------|--------------|
| `public.profiles` | One row per account (`id` = `auth.users.id`, deleted with it). Holds the onboarding answers, each checked against the same option lists as `src/lib/profile.ts`. |
| 4 RLS policies | Owners can read, create, update and delete **their own** row. Nobody else can see any row. Anonymous visitors have no access at all. |
| `profiles_set_timestamps` trigger | Keeps `updated_at` current and `created_at` unchangeable. |
| `public.delete_my_account()` | In-app account deletion (App Store / Google Play requirement). Deletes the caller's auth user; the profile goes with it. The only `security definer` function, with the reason in the migration. |

Not stored, on purpose: last name, birthday or age, gender, sexuality, religion, ethnicity, workplace, school, socials, photos, location (CLAUDE.md §8).

## How saving works

1. The person enters their email and Supabase emails a sign-in link (`supabase.auth.signInWithOtp` with `emailRedirectTo` set to `/app/sign-in`). Opening the link signs them in: it comes back to `/app/sign-in` with the session in the URL, the client checks it with the server and clears it from the address bar (the implicit flow, so it works even if the email app opens the link in a different browser). Supabase creates the `auth.users` row on first sign-in. An expired or reused link comes back with `error_code=otp_expired`, and the page asks for the email again.
2. Onboarding answers stay on the device (`firefly.onboarding.v1`) while the person goes through the screens, so a reload doesn't lose them.
3. On the last screen the app **upserts** the `profiles` row (`src/data/account.ts`). Upsert means a retry after a dropped connection is always safe.
4. The app reads the row back on every launch, and keeps a copy on the device so it opens offline.

## 1. Local (your machine)

You need Docker Desktop (or OrbStack / Colima) running.

```sh
nvm use
npm install
npm run db:start        # starts local Supabase and applies every migration in supabase/migrations
npm run test:db         # pgTAP: RLS, constraints and delete_my_account (all must pass)
npm run db:types        # regenerates src/types/database.ts from the real schema
git diff src/types/database.ts   # commit any difference: CI fails if this file is stale
```

`npm run db:start` prints the local API URL and keys. To point the app at your local Supabase, put these in `.env.local` (git-ignored):

```sh
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<the "Publishable key" (or anon key) that db:start printed>
```

Then `npm run dev`, open http://localhost:5173/app, sign up, and open the sign-in link from the local mail catcher at http://127.0.0.1:54324 (Mailpit). Local Supabase only lets links lead back to the addresses in `[auth] additional_redirect_urls` in `supabase/config.toml` (the dev server on port 5173 and the preview on 4173); after changing that file, run `npm run db:stop && npm run db:start`. Local email sending is limited to 2 an hour (`[auth.rate_limit] email_sent` in `supabase/config.toml`); raise it locally if that gets in the way.

To check that a profile was saved: open Studio at http://127.0.0.1:54323, Table Editor, `profiles`.

After changing a migration you haven't merged yet: `npm run db:reset` rebuilds the local database from scratch.

## 2. Hosted project (once, by a project owner)

Do this only after the PR with the migration is reviewed and merged. Never run tests, seeds or resets against production (CLAUDE.md §7).

### 2a. Apply the migration

```sh
npx supabase login                         # opens the browser
npx supabase link --project-ref <project-ref>   # Dashboard > Project Settings > General
npx supabase db push --remote --dry-run    # shows which migrations would run: expect only create_profiles
npx supabase db push --remote              # applies it
```

`--remote` matters: while the local Supabase is running, the CLI targets the local database by default (check the `Target:` line). If it says IPv6 isn't supported on your network, re-run `supabase link` once the project is healthy, or pass the **Session pooler** connection string from the dashboard's **Connect** button with `--db-url`.

Then confirm in the dashboard: Table Editor shows `profiles` with the RLS badge on, and Authentication > Policies lists the four `profiles:` policies.

### 2b. Let sign-in links come back to the app

Firefly uses Supabase's default sign-in emails (decided 2026-11-28), so no template changes are needed; editing templates needs custom SMTP anyway (2c). What the hosted project does need is to allow the links to lead back to the app. In **Authentication > URL Configuration**:

- **Site URL:** the address the landing page is served from in production (for example `https://<your-domain>`). Until it's deployed, `http://localhost:5173` is fine.
- **Redirect URLs:** add every address the app runs on, each ending in `/**`:
  - `http://localhost:5173/**` (the dev server)
  - `https://<your-domain>/**` (production, once deployed)
  - any preview or staging address

If the address the app asks for isn't on the list, Supabase sends the person to the Site URL instead, and they land on the landing page signed out.

In **Authentication > Sign In / Providers > Email**: keep Email enabled. **Confirm email** can stay on: new accounts then get the "Confirm signup" email, whose link signs them in the same way.

Links open in a browser, so inside the iOS and Android apps sign-in needs deep links (`com.fireflysocial.app://…`, plus the Capacitor App plugin's URL-open handling) before it works there. Switching back to a 6-digit code typed into the app is the other way out, once custom SMTP makes templates editable.

### 2c. Email sending for real users

Supabase's built-in email service is only for trying things out: it sends a handful of emails an hour and only to your project team's addresses. Before anyone outside the team signs up, set up custom SMTP (**Authentication > Emails > SMTP Settings**). An email provider receives users' email addresses, so choosing one needs sign-off (CLAUDE.md §12) and a line in the app-store privacy answers.

### 2d. Point the app at it

In `.env.local`:

```sh
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<Project Settings > API Keys > Publishable key>
```

Only the publishable key ever goes in the app. The secret / service-role key never goes in `src/`, a `VITE_` variable or the repo.

## 3. Checking it works end to end

1. `npm run dev`, open http://localhost:5173, tap **Get started**.
2. Enter your email, then open the link in the email on the same computer.
3. Answer the onboarding screens and tap **Show my feed**.
4. In the dashboard, Table Editor > `profiles`: one row with your answers, `id` matching your user in Authentication > Users.
5. In the app, You > **Delete my account** > **Delete everything**: the user and the row are both gone.

## Later

- **Sign-in in the iOS and Android apps** needs deep links for the emailed link (see 2b), or a switch to a typed code.
- **Phone sign-in.** v4 specifies phone number + one-time code. It needs an SMS provider (Twilio, MessageBird or Vonage) configured in Authentication > Providers > Phone, which receives users' phone numbers, so it needs sign-off first. The app's account layer (`src/data/account.ts`) is the only place that would change.
- **Adding an onboarding option** means a new migration that drops and re-adds the matching check constraint, never an edit to a merged migration.
- **Integration tests** for `src/data/account.ts` against local Supabase (engineering/quality-and-ci.md §3.4). Today it's tested against a fake HTTP server in Vitest, and the database rules in pgTAP.
