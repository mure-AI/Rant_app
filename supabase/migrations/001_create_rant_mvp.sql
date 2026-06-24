create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  input_type text not null check (input_type in ('text', 'voice')),
  original_text text,
  transcript text,
  audio_url text,
  emotion text,
  problem_type text,
  summary text,
  likely_problem text,
  why_it_might_be_happening text,
  reflective_question text,
  ai_response jsonb,
  created_at timestamptz default now()
);

create table if not exists public.action_steps (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  step_text text not null,
  is_completed boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  helpfulness_rating text,
  is_summary_accurate boolean,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.action_steps enable row level security;
alter table public.feedback enable row level security;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can read own entries" on public.entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own entries" on public.entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own entries" on public.entries
  for update using (auth.uid() = user_id);

create policy "Users can read own action steps" on public.action_steps
  for select using (
    exists (
      select 1 from public.entries
      where entries.id = action_steps.entry_id
      and entries.user_id = auth.uid()
    )
  );

create policy "Users can insert own action steps" on public.action_steps
  for insert with check (
    exists (
      select 1 from public.entries
      where entries.id = action_steps.entry_id
      and entries.user_id = auth.uid()
    )
  );

create policy "Users can update own action steps" on public.action_steps
  for update using (
    exists (
      select 1 from public.entries
      where entries.id = action_steps.entry_id
      and entries.user_id = auth.uid()
    )
  );

create policy "Users can read own feedback" on public.feedback
  for select using (auth.uid() = user_id);

create policy "Users can insert own feedback" on public.feedback
  for insert with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('rant-audio', 'rant-audio', false)
on conflict (id) do nothing;

create policy "Users can upload own rant audio" on storage.objects
  for insert with check (
    bucket_id = 'rant-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own rant audio" on storage.objects
  for select using (
    bucket_id = 'rant-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own rant audio" on storage.objects
  for update using (
    bucket_id = 'rant-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
