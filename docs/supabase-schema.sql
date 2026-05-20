create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  total_xp integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.habits (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text,
  scheduled_time text,
  xp_reward integer default 10,
  from_program_id uuid null,
  created_at timestamp with time zone default now()
);

create table if not exists public.habit_completions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  completed_date date not null,
  completed_at timestamp with time zone default now(),
  unique (user_id, habit_id, completed_date)
);

create table if not exists public.missions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text,
  priority text check (priority in ('HIGH', 'MEDIUM', 'LOW')),
  stage text check (stage in ('BACKLOG', 'THIS_WEEK', 'TODAY', 'IN_PROGRESS', 'DONE')),
  quadrant text check (quadrant in ('q1', 'q2', 'q3', 'q4')),
  estimate integer,
  target_date date,
  created_at timestamp with time zone default now()
);

create table if not exists public.programs (
  id uuid primary key,
  name text not null,
  description text,
  total_days integer,
  type text check (type in ('challenge', 'routine', 'skill'))
);

create table if not exists public.enrollments (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  start_date date,
  current_day integer default 1,
  streak integer default 0,
  is_active boolean default true
);

alter table public.users enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.missions enable row level security;
alter table public.programs enable row level security;
alter table public.enrollments enable row level security;

drop policy if exists "Users can manage own profile" on public.users;
create policy "Users can manage own profile"
on public.users
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can manage own habits" on public.habits;
create policy "Users can manage own habits"
on public.habits
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own habit completions" on public.habit_completions;
create policy "Users can manage own habit completions"
on public.habit_completions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own missions" on public.missions;
create policy "Users can manage own missions"
on public.missions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can read programs" on public.programs;
create policy "Authenticated users can read programs"
on public.programs
for select
using (auth.uid() is not null);

drop policy if exists "Users can manage own enrollments" on public.enrollments;
create policy "Users can manage own enrollments"
on public.enrollments
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
