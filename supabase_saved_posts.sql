-- ─────────────────────────────────────────────────────────────
-- Run this in Supabase → SQL Editor to add saved posts feature
-- ─────────────────────────────────────────────────────────────

create table if not exists public.saved_posts (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  topic       text not null,
  label       text,
  post        text not null,
  created_at  timestamptz default now()
);

-- Enable RLS
alter table public.saved_posts enable row level security;

-- Users can only see their own saved posts
create policy "Users can view own saved posts"
  on public.saved_posts for select
  using (auth.uid() = user_id);

-- Users can insert their own saved posts
create policy "Users can insert own saved posts"
  on public.saved_posts for insert
  with check (auth.uid() = user_id);

-- Users can delete their own saved posts
create policy "Users can delete own saved posts"
  on public.saved_posts for delete
  using (auth.uid() = user_id);
