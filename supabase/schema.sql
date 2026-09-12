-- Cleaner DB — paste into Supabase → SQL Editor → Run
-- Auth, users, territories stay in the app for now.
-- This backend only stores inspection evidence + AI results.

-- Provided_RO_Pics mapping (already in app mock outlets):
--   BHAGAT BROTHERS     → RO8001
--   CHANDRA HIGHWAY     → RO8002
--   SARTHI FUEL STATION → RO8003
--   SRI RADHA FUEL      → RO8004
--   VISHNU PETROLEUM    → RO8005
--
-- Field photos are grouped by facility, with many shots per visit:
--   ladies | gents | urinal | pq | bathroom
-- Do not treat those folders as the 16 app checklist items.
--
-- kind = 'inspection'  → photos the app captures (User Home)
-- kind = 'sample'      → Provided_RO_Pics (AI eval; hidden from User Home)

create table if not exists public.inspection_images (
  id text primary key,
  ro_id text not null,
  inspection_item text not null,
  facility text,
  kind text not null default 'inspection',
  link text not null,
  image_uri text,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  updated_by text,
  deleted_at timestamptz,
  editing_history jsonb not null default '[]'::jsonb,
  constraint inspection_images_kind_check
    check (kind in ('inspection', 'sample')),
  constraint inspection_images_facility_check
    check (
      facility is null
      or facility in ('ladies', 'gents', 'urinal', 'pq', 'bathroom')
    )
);

alter table public.inspection_images
  add column if not exists facility text;

alter table public.inspection_images
  add column if not exists kind text not null default 'inspection';

drop index if exists inspection_images_active_ro_item;

-- App still keeps one live photo per checklist item.
-- Sample photos from Provided_RO_Pics are allowed many-per-facility.
create unique index if not exists inspection_images_active_ro_item
  on public.inspection_images (ro_id, inspection_item)
  where deleted_at is null and kind = 'inspection';

create index if not exists inspection_images_ro_id_idx
  on public.inspection_images (ro_id);

create index if not exists inspection_images_kind_idx
  on public.inspection_images (ro_id, kind);

create table if not exists public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  inspection_image_id text not null references public.inspection_images (id),
  ro_id text not null,
  inspection_item text not null,
  model_name text,
  score integer,
  confidence numeric,
  status text not null default 'COMPLETED',
  analysis_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_analyses_image_idx
  on public.ai_analyses (inspection_image_id);

create index if not exists ai_analyses_ro_idx
  on public.ai_analyses (ro_id);

alter table public.inspection_images enable row level security;
alter table public.ai_analyses enable row level security;

-- Prototype policies. Anyone with the anon key can read/write.
-- Fine for a college/demo project. Not for real customer data.

drop policy if exists inspection_images_anon_all on public.inspection_images;
create policy inspection_images_anon_all
  on public.inspection_images
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists ai_analyses_anon_all on public.ai_analyses;
create policy ai_analyses_anon_all
  on public.ai_analyses
  for all
  to anon, authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('inspection-images', 'inspection-images', true)
on conflict (id) do nothing;

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
  to anon, authenticated
  with check (bucket_id = 'inspection-images');

drop policy if exists inspection_images_storage_update on storage.objects;
create policy inspection_images_storage_update
  on storage.objects
  for update
  to anon, authenticated
  using (bucket_id = 'inspection-images')
  with check (bucket_id = 'inspection-images');
