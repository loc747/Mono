-- Mono backend schema. Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Passwords are handled by Supabase Auth (bcrypt-hashed, never stored in these tables).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null check (char_length(display_name) between 1 and 60),
  bio text check (bio is null or char_length(bio) <= 300),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https://'),
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Only an admin (or the SQL editor / service role) may change a role.
create or replace function public.guard_role_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'role can only be changed by an admin';
  end if;
  return new;
end $$;
drop trigger if exists guard_role_change on public.profiles;
create trigger guard_role_change before update on public.profiles
  for each row execute function public.guard_role_change();

create table if not exists public.studies (
  id uuid primary key default gen_random_uuid(),
  label text not null default '' check (char_length(label) <= 40),
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '' check (char_length(description) <= 400),
  bg text not null default '#0a0a0a' check (bg ~ '^#[0-9a-fA-F]{6}$'),
  fg text not null default '#ffffff' check (fg ~ '^#[0-9a-fA-F]{6}$'),
  sort int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.archive_items (
  id uuid primary key default gen_random_uuid(),
  label text not null default '' check (char_length(label) <= 40),
  title text not null check (char_length(title) between 1 and 80),
  category text not null default 'minimal' check (category in ('workwear','minimal','street','brand')),
  bg text not null default '#0a0a0a' check (bg ~ '^#[0-9a-fA-F]{6}$'),
  fg text not null default '#ffffff' check (fg ~ '^#[0-9a-fA-F]{6}$'),
  sort int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 60),
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '' check (char_length(description) <= 400),
  image_url text check (image_url is null or image_url ~ '^https://'),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200),
  topic text not null default 'other' check (topic in ('collab','press','submission','other')),
  message text not null check (char_length(message) between 1 and 4000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.studies enable row level security;
alter table public.archive_items enable row level security;
alter table public.submissions enable row level security;
alter table public.inquiries enable row level security;

-- profiles: private to owner + admins; users can create/edit only their own, always as 'member'.
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_insert on public.profiles for insert to authenticated
  with check (id = auth.uid() and role = 'member');
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- studies / archive: public can read published rows; only admins write.
create policy studies_read on public.studies for select to anon, authenticated
  using (published or public.is_admin());
create policy studies_admin on public.studies for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy archive_read on public.archive_items for select to anon, authenticated
  using (published or public.is_admin());
create policy archive_admin on public.archive_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- submissions: signed-in users create pending ones; approved are public; admins moderate.
create policy submissions_read on public.submissions for select to anon, authenticated
  using (status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy submissions_insert on public.submissions for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');
create policy submissions_admin_update on public.submissions for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy submissions_admin_delete on public.submissions for delete to authenticated
  using (public.is_admin());

-- inquiries: anyone can send; only admins read/manage.
create policy inquiries_insert on public.inquiries for insert to anon, authenticated
  with check (is_read = false);
create policy inquiries_admin on public.inquiries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Table privileges. Newer Supabase projects do not auto-grant these; RLS above still decides row access.
grant usage on schema public to anon, authenticated;
grant select on public.studies, public.archive_items, public.submissions to anon;
grant insert on public.inquiries to anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.studies, public.archive_items,
  public.submissions, public.inquiries to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- After you sign up and create your profile, make yourself the first admin:
--   update public.profiles set role = 'admin' where username = 'YOUR_USERNAME';
