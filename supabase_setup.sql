-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- This creates the profiles table that stores extended user info beyond what Supabase Auth provides

-- 1. Create profiles table
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

-- 2. Enable Row Level Security (users can only read/write their own row)
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 3. Auto-update updated_at on every update
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
