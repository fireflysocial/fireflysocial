-- Profiles: each person's onboarding answers, one row per account.
--
-- Owner-only. Nobody else can read a profile: not other users, not anonymous visitors. Pod cards
-- (first name, 2-3 interests, a prompt) will be served later through a narrow view or function
-- that asks for consent, never by widening these policies (CLAUDE.md §7 and §8).
--
-- Every list of options here mirrors one in src/lib/profile.ts or src/lib/interests.ts. Adding an
-- option means a new migration that replaces the matching check constraint.
--
-- Deliberately not stored: last name, birthday or age, gender, sexuality, religion, ethnicity,
-- workplace, school, socials, photos and any location beyond the neighbourhoods picked from the
-- city's list (CLAUDE.md §8.1, §8.3, §8.9).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,

  -- About you
  first_name text not null
    constraint profiles_first_name_length
    check (first_name = btrim(first_name) and char_length(first_name) between 1 and 40),
  city_id text not null
    constraint profiles_city_id_format check (city_id ~ '^[a-z0-9-]{1,40}$'),

  -- What you're after
  intents text[] not null default '{}'
    constraint profiles_intents_allowed
    check (intents <@ array['friends', 'network', 'collaborators', 'cofounder', 'events']),
  work_area text
    constraint profiles_work_area_allowed
    check (work_area in (
      'studying', 'building', 'tech', 'design', 'business', 'health', 'education', 'arts',
      'trades', 'hospitality', 'public', 'between'
    )),
  project_roles text[] not null default '{}'
    constraint profiles_project_roles_allowed
    check (project_roles <@ array[
      'engineering', 'product-design', 'sales-growth', 'operations', 'domain', 'unsure'
    ]),
  project_stage text
    constraint profiles_project_stage_allowed
    check (project_stage in ('exploring', 'idea', 'building', 'launched')),

  -- What you're into
  interests text[] not null
    constraint profiles_interests_allowed
    check (
      cardinality(interests) >= 3
      and interests <@ array[
        'startup-meetups', 'hackathons', 'tech-talks',
        'networking-nights', 'career-talks',
        'gallery-openings', 'film-screenings', 'open-mics',
        'run-clubs', 'climbing', 'yoga',
        'board-games', 'trivia',
        'pottery', 'drawing', 'writing',
        'supper-clubs', 'coffee-meetups',
        'language-exchange', 'book-clubs', 'workshops',
        'hiking', 'walking-groups',
        'volunteering', 'newcomer-meetups'
      ]
    ),
  event_style text
    constraint profiles_event_style_allowed
    check (event_style in ('activity', 'talk', 'mingle', 'mix')),

  -- How you like to meet
  group_size text
    constraint profiles_group_size_allowed
    check (group_size in ('small', 'medium', 'large', 'any')),
  approach text
    constraint profiles_approach_allowed
    check (approach in ('easy', 'warm-up', 'daunting')),
  languages text[] not null default '{}'
    constraint profiles_languages_allowed
    check (languages <@ array[
      'english', 'french', 'spanish', 'mandarin', 'cantonese', 'punjabi', 'hindi', 'tagalog',
      'korean', 'japanese', 'vietnamese', 'farsi', 'arabic', 'portuguese', 'german', 'italian',
      'russian', 'ukrainian'
    ]),
  learning text[] not null default '{}'
    constraint profiles_learning_allowed
    check (learning <@ array[
      'english', 'french', 'spanish', 'mandarin', 'cantonese', 'punjabi', 'hindi', 'tagalog',
      'korean', 'japanese', 'vietnamese', 'farsi', 'arabic', 'portuguese', 'german', 'italian',
      'russian', 'ukrainian'
    ]),

  -- Fitting it in
  free_times text[] not null default '{}'
    constraint profiles_free_times_allowed
    check (free_times <@ array['weekday-evenings', 'weekend-days', 'weekend-evenings']),
  pace text
    constraint profiles_pace_allowed
    check (pace in ('monthly', 'fortnightly', 'weekly', 'often')),
  -- Names come from the city's list in the app; these limits only keep junk out.
  neighbourhoods text[] not null default '{}'
    constraint profiles_neighbourhoods_size
    check (
      cardinality(neighbourhoods) <= 50
      and char_length(array_to_string(neighbourhoods, '')) <= 50 * 60
      and array_position(neighbourhoods, '') is null
    ),
  budget text not null default 'low'
    constraint profiles_budget_allowed check (budget in ('free', 'low', 'any')),

  -- Last bits
  newcomer boolean,
  access_needs text[] not null default '{}'
    constraint profiles_access_needs_allowed
    check (access_needs <@ array['step-free', 'quieter', 'captions']),

  -- When the person confirmed they're 18+ and took the respect pledge (CLAUDE.md §8.11).
  pledged_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Onboarding answers. Owner-only (RLS). Never shown to anyone else without consent.';
comment on column public.profiles.access_needs is
  'Private. Used only to rank and filter events for this person (v3 #42).';
comment on column public.profiles.approach is
  'How walking into a room of strangers feels. Private; favours structured events and pods.';

-- RLS on in the same migration that creates the table (CLAUDE.md §7).
alter table public.profiles enable row level security;

-- Supabase grants every new public table to anon and authenticated by default. Take that back and
-- give signed-in people only what the policies below allow. Anonymous visitors get nothing.
revoke all on table public.profiles from anon, authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;

-- `(select auth.uid())` is evaluated once per statement instead of once per row.
create policy "profiles: owners read their own"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: owners create their own"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles: owners update their own"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "profiles: owners delete their own"
  on public.profiles for delete to authenticated
  using ((select auth.uid()) = id);

-- Keep updated_at honest, and created_at unchangeable, whatever the client sends.
create function public.profiles_set_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

revoke execute on function public.profiles_set_timestamps() from public, anon, authenticated;

create trigger profiles_set_timestamps
  before insert or update on public.profiles
  for each row execute function public.profiles_set_timestamps();

-- In-app account deletion (App Store and Google Play requirement, CLAUDE.md §9). Deletes the
-- caller's auth user; the profile goes with it through `on delete cascade`, and later tables that
-- reference auth.users must cascade too.
--
-- SECURITY DEFINER is unavoidable here: deleting from auth.users needs privileges the
-- `authenticated` role must never have. The alternative is an Edge Function holding the
-- service-role key, which is more moving parts for the same effect. Kept minimal: no arguments,
-- it can only ever delete the caller, and search_path is empty so every name is schema-qualified.
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  delete from auth.users where id = caller;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
