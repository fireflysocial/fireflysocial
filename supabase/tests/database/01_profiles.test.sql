-- Profiles: owner-only access, the checks on every answer, and in-app account deletion.
-- Acts as anonymous, the owner and another signed-in user (CLAUDE.md §7).
begin;

create extension if not exists pgtap with schema extensions;

select plan(31);

-- Two fake accounts. Fixed ids so the test is deterministic.
insert into auth.users (id, aud, role, email)
values
  ('11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'owner@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'other@example.test');

-- Acting as someone: the role PostgREST would switch to, plus the JWT claims auth.uid() reads.
create function pg_temp.act_as(who uuid)
returns void
language sql
as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', who, 'role', 'authenticated')::text, true);
$$;

create function pg_temp.act_anon()
returns void
language sql
as $$
  select set_config('role', 'anon', true),
         set_config('request.jwt.claims', '{"role":"anon"}', true);
$$;

-- ---------- Shape ----------

select has_table('public', 'profiles', 'profiles exists');
select col_is_pk('public', 'profiles', 'id', 'one profile per account');
select fk_ok('public', 'profiles', 'id', 'auth', 'users', 'id', 'profiles belong to auth users');

-- ---------- Anonymous visitors get nothing ----------

select pg_temp.act_anon();

select throws_ok(
  $$ select * from public.profiles $$,
  '42501', null,
  'anonymous visitors cannot read profiles'
);

select throws_ok(
  $$ insert into public.profiles (id, first_name, city_id, interests, pledged_at)
     values ('11111111-1111-4111-8111-111111111111', 'Sam', 'vancouver',
             array['board-games', 'pottery', 'trivia'], now()) $$,
  '42501', null,
  'anonymous visitors cannot create profiles'
);

select throws_ok(
  $$ select public.delete_my_account() $$,
  '42501', null,
  'anonymous visitors cannot call delete_my_account'
);

reset role;

-- ---------- The owner ----------

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');

select lives_ok(
  $$ insert into public.profiles (id, first_name, city_id, intents, interests, pledged_at)
     values ('11111111-1111-4111-8111-111111111111', 'Sam', 'vancouver', array['friends'],
             array['board-games', 'pottery', 'trivia'], '2026-11-28T10:00:00Z') $$,
  'the owner can create their own profile'
);

select results_eq(
  $$ select first_name, budget from public.profiles $$,
  $$ values ('Sam'::text, 'low'::text) $$,
  'the owner reads their own profile, with free-or-low-cost as the default budget'
);

select lives_ok(
  $$ update public.profiles set first_name = 'Samira', newcomer = true
     where id = '11111111-1111-4111-8111-111111111111' $$,
  'the owner can update their own profile'
);

select is(
  (select first_name from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'Samira',
  'the update was saved'
);

select throws_ok(
  $$ insert into public.profiles (id, first_name, city_id, interests, pledged_at)
     values ('22222222-2222-4222-8222-222222222222', 'Mallory', 'vancouver',
             array['board-games', 'pottery', 'trivia'], now()) $$,
  '42501', null,
  'nobody can create a profile for another account'
);

select throws_ok(
  $$ update public.profiles set id = '22222222-2222-4222-8222-222222222222'
     where id = '11111111-1111-4111-8111-111111111111' $$,
  '42501', null,
  'the owner cannot hand their profile to another account'
);

-- An upsert is how the app saves: insert, or update on conflict. It must work for the owner.
select lives_ok(
  $$ insert into public.profiles (id, first_name, city_id, interests, pledged_at)
     values ('11111111-1111-4111-8111-111111111111', 'Sam', 'vancouver',
             array['board-games', 'pottery', 'trivia'], '2026-11-28T10:00:00Z')
     on conflict (id) do update set first_name = excluded.first_name $$,
  'the owner can upsert their own profile'
);

-- ---------- Another signed-in user ----------

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

select is_empty(
  $$ select * from public.profiles $$,
  'another user cannot see the owner''s profile'
);

update public.profiles set first_name = 'Mallory'
where id = '11111111-1111-4111-8111-111111111111';

delete from public.profiles where id = '11111111-1111-4111-8111-111111111111';

reset role;

select is(
  (select first_name from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'Sam',
  'another user can neither change nor delete the owner''s profile'
);

-- ---------- Checks on every answer ----------

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

create function pg_temp.insert_other(extra_columns text, extra_values text)
returns void
language plpgsql
as $$
begin
  execute format(
    'insert into public.profiles (id, first_name, city_id, interests, pledged_at %s)
     values (%L, %L, %L, %L::text[], now() %s)',
    extra_columns, '22222222-2222-4222-8222-222222222222', 'Robin', 'vancouver',
    '{board-games,pottery,trivia}', extra_values
  );
end;
$$;

select throws_ok(
  $$ insert into public.profiles (id, first_name, city_id, interests, pledged_at)
     values ('22222222-2222-4222-8222-222222222222', 'Robin', 'vancouver',
             array['board-games', 'pottery'], now()) $$,
  '23514', null,
  'at least three interests are required'
);

select throws_ok(
  $$ insert into public.profiles (id, first_name, city_id, interests, pledged_at)
     values ('22222222-2222-4222-8222-222222222222', 'Robin', 'vancouver',
             array['board-games', 'pottery', 'skydiving'], now()) $$,
  '23514', null,
  'interests must come from the list'
);

select throws_ok(
  $$ select pg_temp.insert_other(', intents', ', ''{romance}''::text[]') $$,
  '23514', null,
  'intents must come from the list'
);

select throws_ok(
  $$ insert into public.profiles (id, first_name, city_id, interests, pledged_at)
     values ('22222222-2222-4222-8222-222222222222', '', 'vancouver',
             array['board-games', 'pottery', 'trivia'], now()) $$,
  '23514', null,
  'a first name is required'
);

select throws_ok(
  $$ insert into public.profiles (id, first_name, city_id, interests, pledged_at)
     values ('22222222-2222-4222-8222-222222222222', repeat('x', 41), 'vancouver',
             array['board-games', 'pottery', 'trivia'], now()) $$,
  '23514', null,
  'first names are at most 40 characters'
);

select throws_ok(
  $$ select pg_temp.insert_other(', work_area', ', ''astronaut''') $$,
  '23514', null,
  'work_area must come from the list'
);

select throws_ok(
  $$ select pg_temp.insert_other(', approach', ', ''fearless''') $$,
  '23514', null,
  'approach must come from the list'
);

select throws_ok(
  $$ select pg_temp.insert_other(', languages', ', ''{klingon}''::text[]') $$,
  '23514', null,
  'languages must come from the list'
);

select throws_ok(
  $$ select pg_temp.insert_other(', budget', ', ''lavish''') $$,
  '23514', null,
  'budget must come from the list'
);

select throws_ok(
  $$ select pg_temp.insert_other(', neighbourhoods', ', ''{""}''::text[]') $$,
  '23514', null,
  'neighbourhoods cannot be empty strings'
);

select throws_ok(
  $$ select pg_temp.insert_other(', access_needs', ', ''{jetpack}''::text[]') $$,
  '23514', null,
  'access needs must come from the list'
);

select throws_ok(
  $$ insert into public.profiles (id, first_name, city_id, interests)
     values ('22222222-2222-4222-8222-222222222222', 'Robin', 'vancouver',
             array['board-games', 'pottery', 'trivia']) $$,
  '23502', null,
  'the pledge time is required'
);

select lives_ok(
  $$ insert into public.profiles (
       id, first_name, city_id, intents, work_area, project_roles, project_stage, interests,
       event_style, group_size, approach, languages, learning, free_times, pace, neighbourhoods,
       budget, newcomer, access_needs, pledged_at
     ) values (
       '22222222-2222-4222-8222-222222222222', 'Robin', 'vancouver',
       array['friends', 'network', 'collaborators', 'cofounder', 'events'],
       'building',
       array['engineering', 'product-design', 'sales-growth', 'operations', 'domain', 'unsure'],
       'launched',
       array['startup-meetups', 'hackathons', 'tech-talks', 'networking-nights', 'career-talks',
             'gallery-openings', 'film-screenings', 'open-mics', 'run-clubs', 'climbing', 'yoga',
             'board-games', 'trivia', 'pottery', 'drawing', 'writing', 'supper-clubs',
             'coffee-meetups', 'language-exchange', 'book-clubs', 'workshops', 'hiking',
             'walking-groups', 'volunteering', 'newcomer-meetups'],
       'mix', 'any', 'daunting',
       array['english', 'french', 'spanish', 'mandarin', 'cantonese', 'punjabi', 'hindi',
             'tagalog', 'korean', 'japanese', 'vietnamese', 'farsi', 'arabic', 'portuguese',
             'german', 'italian', 'russian', 'ukrainian'],
       array['japanese'],
       array['weekday-evenings', 'weekend-days', 'weekend-evenings'],
       'often', array['Gastown', 'Mount Pleasant'], 'any', false,
       array['step-free', 'quieter', 'captions'], now()
     ) $$,
  'every option the app offers is accepted'
);

-- ---------- Deleting an account ----------

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');

select lives_ok(
  $$ select public.delete_my_account() $$,
  'the owner can delete their account'
);

reset role;

select is_empty(
  $$ select 1 from auth.users where id = '11111111-1111-4111-8111-111111111111'
     union all
     select 1 from public.profiles where id = '11111111-1111-4111-8111-111111111111' $$,
  'deleting the account removes the auth user and the profile with it'
);

select isnt_empty(
  $$ select 1 from auth.users where id = '22222222-2222-4222-8222-222222222222' $$,
  'deleting an account leaves everyone else alone'
);

select * from finish();

rollback;
