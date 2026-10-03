-- Vela account and user-owned fitness data. All timestamps are stored in UTC.
create table if not exists public.vela_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '', last_name text not null default '', avatar_url text,
  preferred_unit_system text not null default 'kg' check (preferred_unit_system in ('kg','lb')),
  timezone text not null default 'UTC', onboarding_completed boolean not null default false,
  current_streak integer not null default 0 check (current_streak >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.vela_fitness_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  primary_goal text not null, experience_level text not null, sex text not null,
  age integer not null check (age between 13 and 120), height_cm numeric(6,2) not null check (height_cm > 0),
  current_weight_kg numeric(7,2) not null check (current_weight_kg > 0), target_weight_kg numeric(7,2),
  activity_level text not null, training_days_per_week integer not null check (training_days_per_week between 1 and 7),
  preferred_workout_duration integer not null check (preferred_workout_duration between 10 and 180),
  training_location text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.vela_user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  unit_system text not null default 'kg', equipment jsonb not null default '[]', training_styles jsonb not null default '[]',
  disliked_exercises jsonb not null default '[]', movement_limitations jsonb not null default '[]',
  diet text not null default 'balanced', dietary_restrictions jsonb not null default '[]', disliked_foods jsonb not null default '[]',
  meals_per_day integer not null default 4 check (meals_per_day between 1 and 8), cooking_preference text not null default 'some',
  rest_timer_preferences jsonb not null default '{"autoStart":true}', theme text not null default 'system',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.vela_workout_programs (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null,
  name text not null, strategy text not null, configuration jsonb not null default '{}', active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(user_id,id)
);
create table if not exists public.vela_workout_sessions (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null,
  program_id text, title text not null, focus text not null default '', session_date date not null,
  estimated_minutes integer not null, status text not null check(status in ('planned','active','complete','skipped')),
  started_at timestamptz, completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key(user_id,id), foreign key(user_id,program_id) references public.vela_workout_programs(user_id,id)
);
create table if not exists public.vela_workout_exercises (
  user_id uuid not null, session_id text not null, id text not null, exercise_id text not null,
  position integer not null, rest_seconds integer not null, priority integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key(user_id,session_id,id), foreign key(user_id,session_id) references public.vela_workout_sessions(user_id,id) on delete cascade
);
create table if not exists public.vela_workout_sets (
  user_id uuid not null, session_id text not null, workout_exercise_id text not null, id text not null,
  position integer not null, target_reps_min integer not null, target_reps_max integer not null,
  target_weight_kg numeric(8,2) not null default 0, completed_reps integer, completed_weight_kg numeric(8,2), rir numeric(4,1),
  completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key(user_id,session_id,workout_exercise_id,id),
  foreign key(user_id,session_id,workout_exercise_id) references public.vela_workout_exercises(user_id,session_id,id) on delete cascade
);
create table if not exists public.vela_readiness_checks (
  user_id uuid not null references auth.users(id) on delete cascade, recorded_on date not null,
  energy smallint not null check(energy between 1 and 5), sleep smallint not null check(sleep between 1 and 5),
  soreness smallint not null check(soreness between 1 and 5), stress smallint not null check(stress between 1 and 5),
  motivation smallint not null check(motivation between 1 and 5), created_at timestamptz not null default now(),
  primary key(user_id,recorded_on)
);
create table if not exists public.vela_nutrition_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  calories integer not null check(calories >= 1000), protein_g integer not null check(protein_g >= 0), carbs_g integer not null check(carbs_g >= 0), fat_g integer not null check(fat_g >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.vela_meal_plans (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, starts_on date not null, ends_on date not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(user_id,id)
);
create table if not exists public.vela_meals (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, meal_plan_id text,
  meal_date date not null, recipe_id text not null, servings numeric(5,2) not null check(servings > 0), eaten boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(user_id,id),
  foreign key(user_id,meal_plan_id) references public.vela_meal_plans(user_id,id) on delete cascade
);
create table if not exists public.vela_food_logs (
  user_id uuid not null references auth.users(id) on delete cascade, logged_on date not null,
  calories integer not null default 0, protein_g numeric(8,2) not null default 0, carbs_g numeric(8,2) not null default 0,
  fat_g numeric(8,2) not null default 0, water_ml integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(user_id,logged_on)
);
create table if not exists public.vela_measurements (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, recorded_at timestamptz not null,
  weight_kg numeric(7,2) not null check(weight_kg > 0), waist_cm numeric(7,2), chest_cm numeric(7,2), arms_cm numeric(7,2),
  hips_cm numeric(7,2), thighs_cm numeric(7,2), body_fat_percent numeric(5,2), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key(user_id,id)
);
create table if not exists public.vela_personal_records (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, exercise_id text not null,
  kind text not null, value numeric(10,2) not null, achieved_on date not null, created_at timestamptz not null default now(), primary key(user_id,id)
);
create table if not exists public.vela_grocery_checks (
  user_id uuid not null references auth.users(id) on delete cascade, item_key text not null, checked boolean not null default false,
  updated_at timestamptz not null default now(), primary key(user_id,item_key)
);
create table if not exists public.vela_coach_messages (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, role text not null check(role in ('user','coach')),
  content text not null, context jsonb not null default '{}', created_at timestamptz not null default now(), primary key(user_id,id)
);
create table if not exists public.vela_custom_exercises (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, definition jsonb not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(user_id,id)
);
create table if not exists public.vela_custom_recipes (
  user_id uuid not null references auth.users(id) on delete cascade, id text not null, definition jsonb not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(user_id,id)
);

create or replace function public.set_vela_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare table_name text; begin
  foreach table_name in array array['vela_profiles','vela_fitness_profiles','vela_user_preferences','vela_workout_programs','vela_workout_sessions','vela_workout_exercises','vela_workout_sets','vela_nutrition_profiles','vela_meal_plans','vela_meals','vela_food_logs','vela_measurements','vela_grocery_checks','vela_custom_exercises','vela_custom_recipes'] loop
    execute format('drop trigger if exists set_updated_at on public.%I',table_name);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_vela_updated_at()',table_name);
  end loop;
end $$;

create or replace function public.handle_new_vela_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.vela_profiles(user_id,first_name,last_name) values(new.id,coalesce(new.raw_user_meta_data->>'first_name',''),coalesce(new.raw_user_meta_data->>'last_name','')) on conflict(user_id) do nothing; return new; end $$;
drop trigger if exists on_auth_user_created_vela on auth.users;
create trigger on_auth_user_created_vela after insert on auth.users for each row execute function public.handle_new_vela_user();

do $$ declare table_name text; begin
  foreach table_name in array array['vela_profiles','vela_fitness_profiles','vela_user_preferences','vela_workout_programs','vela_workout_sessions','vela_workout_exercises','vela_workout_sets','vela_readiness_checks','vela_nutrition_profiles','vela_meal_plans','vela_meals','vela_food_logs','vela_measurements','vela_personal_records','vela_grocery_checks','vela_coach_messages','vela_custom_exercises','vela_custom_recipes'] loop
    execute format('alter table public.%I enable row level security',table_name);
    execute format('drop policy if exists "select own rows" on public.%I',table_name);
    execute format('drop policy if exists "insert own rows" on public.%I',table_name);
    execute format('drop policy if exists "update own rows" on public.%I',table_name);
    execute format('drop policy if exists "delete own rows" on public.%I',table_name);
    execute format('create policy "select own rows" on public.%I for select to authenticated using ((select auth.uid())=user_id)',table_name);
    execute format('create policy "insert own rows" on public.%I for insert to authenticated with check ((select auth.uid())=user_id)',table_name);
    execute format('create policy "update own rows" on public.%I for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',table_name);
    execute format('create policy "delete own rows" on public.%I for delete to authenticated using ((select auth.uid())=user_id)',table_name);
  end loop;
end $$;

create index if not exists vela_workout_sessions_user_started_idx on public.vela_workout_sessions(user_id,started_at desc);
create index if not exists vela_measurements_user_recorded_idx on public.vela_measurements(user_id,recorded_at desc);
create index if not exists vela_food_logs_user_logged_idx on public.vela_food_logs(user_id,logged_on desc);
create index if not exists vela_readiness_user_recorded_idx on public.vela_readiness_checks(user_id,recorded_on desc);
create index if not exists vela_meals_user_date_idx on public.vela_meals(user_id,meal_date);
