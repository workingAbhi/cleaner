-- Cleaner auth + settings + tighter RLS
-- Run AFTER schema.sql in Supabase → SQL Editor

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone_number text not null unique,
  name text not null default '',
  role text not null check (role in ('USER', 'ADMIN')),
  ro_number text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_ro_number_idx
  on public.profiles (ro_number);

create index if not exists profiles_role_idx
  on public.profiles (role);

-- ---------------------------------------------------------------------------
-- App settings (master / top phone, etc.)
-- ---------------------------------------------------------------------------

create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('master_owner_phone', '9999999999')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- OTP challenges (service role / Edge Functions only)
-- ---------------------------------------------------------------------------

create table if not exists public.otp_challenges (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('PHONE', 'MASTER')),
  destination text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists otp_challenges_dest_idx
  on public.otp_challenges (type, destination, created_at desc);

-- ---------------------------------------------------------------------------
-- Helpers for RLS
-- ---------------------------------------------------------------------------

create or replace function public.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'ADMIN'
      and active = true
  );
$$;

create or replace function public.current_ro_number()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select ro_number
  from public.profiles
  where id = auth.uid();
$$;

-- Create profile from auth metadata on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  phone text := coalesce(meta->>'phone', meta->>'phone_number', '');
  uname text := coalesce(meta->>'name', '');
  urole text := coalesce(meta->>'role', 'USER');
  ro text := nullif(meta->>'ro_number', '');
begin
  if phone = '' then
    phone := split_part(coalesce(new.email, ''), '@', 1);
  end if;

  if urole not in ('USER', 'ADMIN') then
    urole := 'USER';
  end if;

  insert into public.profiles (
    id,
    phone_number,
    name,
    role,
    ro_number,
    active
  )
  values (
    new.id,
    phone,
    uname,
    urole,
    ro,
    true
  )
  on conflict (id) do update
    set
      phone_number = excluded.phone_number,
      name = excluded.name,
      role = excluded.role,
      ro_number = excluded.ro_number,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS: profiles
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS: app_settings (anon/authenticated can read master phone only)
-- ---------------------------------------------------------------------------

alter table public.app_settings enable row level security;

drop policy if exists app_settings_read_master on public.app_settings;
create policy app_settings_read_master
  on public.app_settings
  for select
  to anon, authenticated
  using (key = 'master_owner_phone');

-- ---------------------------------------------------------------------------
-- RLS: otp_challenges — no client access
-- ---------------------------------------------------------------------------

alter table public.otp_challenges enable row level security;

-- ---------------------------------------------------------------------------
-- RLS: inspection_images (replace open anon policies)
-- ---------------------------------------------------------------------------

drop policy if exists inspection_images_anon_all on public.inspection_images;

drop policy if exists inspection_images_select on public.inspection_images;
create policy inspection_images_select
  on public.inspection_images
  for select
  to authenticated
  using (
    public.is_admin()
    or ro_id = public.current_ro_number()
  );

drop policy if exists inspection_images_insert on public.inspection_images;
create policy inspection_images_insert
  on public.inspection_images
  for insert
  to authenticated
  with check (
    public.is_admin()
    or ro_id = public.current_ro_number()
  );

drop policy if exists inspection_images_update on public.inspection_images;
create policy inspection_images_update
  on public.inspection_images
  for update
  to authenticated
  using (
    public.is_admin()
    or ro_id = public.current_ro_number()
  )
  with check (
    public.is_admin()
    or ro_id = public.current_ro_number()
  );

-- ---------------------------------------------------------------------------
-- RLS: ai_analyses
-- ---------------------------------------------------------------------------

drop policy if exists ai_analyses_anon_all on public.ai_analyses;

drop policy if exists ai_analyses_select on public.ai_analyses;
create policy ai_analyses_select
  on public.ai_analyses
  for select
  to authenticated
  using (
    public.is_admin()
    or ro_id = public.current_ro_number()
  );

-- Clients may insert a PROCESSING row; Edge Function (service role) completes it.
drop policy if exists ai_analyses_insert on public.ai_analyses;
create policy ai_analyses_insert
  on public.ai_analyses
  for insert
  to authenticated
  with check (
    public.is_admin()
    or ro_id = public.current_ro_number()
  );

drop policy if exists ai_analyses_update on public.ai_analyses;
create policy ai_analyses_update
  on public.ai_analyses
  for update
  to authenticated
  using (
    public.is_admin()
    or ro_id = public.current_ro_number()
  )
  with check (
    public.is_admin()
    or ro_id = public.current_ro_number()
  );

-- ---------------------------------------------------------------------------
-- Storage policies (authenticated)
-- ---------------------------------------------------------------------------

drop policy if exists inspection_images_storage_select on storage.objects;
create policy inspection_images_storage_select
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'inspection-images');

drop policy if exists inspection_images_storage_insert on storage.objects;
create policy inspection_images_storage_insert
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'inspection-images');

drop policy if exists inspection_images_storage_update on storage.objects;
create policy inspection_images_storage_update
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'inspection-images')
  with check (bucket_id = 'inspection-images');
