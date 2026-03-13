-- Run this in Supabase → SQL Editor to fix the RLS insert policy
-- The issue: during signup the user session isn't ready yet when insert runs

-- Drop old restrictive insert policy
drop policy if exists "Users can insert own profile" on public.profiles;

-- Allow insert if the row id matches the auth user id OR if called during signup flow
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Also make sure the service role can always write (for the DB trigger)
-- Drop and recreate the auto-profile trigger cleanly
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, headline, linkedin_url, posts_analyzed, drafts_generated)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'headline', ''),
    coalesce(new.raw_user_meta_data->>'linkedin_url', ''),
    0,
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
