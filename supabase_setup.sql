-- ─────────────────────────────────────────────────────────────
-- Run this ENTIRE file in Supabase → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────

-- 1. Create the profiles table
create table if not exists public.profiles (
  id                uuid references auth.users(id) on delete cascade primary key,
  name              text,
  email             text,
  headline          text default '',
  linkedin_url      text default '',
  posts_analyzed    int  default 0,
  drafts_generated  int  default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.profiles enable row level security;

-- 3. RLS policies — users can only access their own row
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 4. Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- 5. Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
