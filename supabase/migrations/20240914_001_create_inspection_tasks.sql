-- =============================================================================
-- Migration : 20240914_001_create_inspection_tasks
-- Date       : 2024-09-14
-- Author     : cleaner-app
-- Purpose    : Create the inspection_tasks table that drives the 16-item
--              washroom checklist shown to field users.
--              Each row defines one checklist step: its id (slug), display
--              title, reference_image_key (maps to a file in the
--              reference-images Storage bucket), free-text instructions array,
--              display order, and soft-delete flag (active).
--
-- How to run : Paste into Supabase → SQL Editor → Run.
--              Safe to re-run: all statements use IF NOT EXISTS / ON CONFLICT.
--
-- Depends on : schema.sql (inspection_images, app_settings tables must exist).
--              Run schema.sql first if starting from scratch.
--
-- Storage    : Reference images are uploaded separately via
--              `node supabase/manage-tasks.mjs seed`
--              into the `reference-images` bucket (also created below).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------------------

create table if not exists public.inspection_tasks (
  id                  text        primary key,
  title               text        not null,
  reference_image_key text        not null default 'washroom',
  instructions        text[]      not null default '{}',
  sort_order          integer     not null default 0,
  active              boolean     not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table  public.inspection_tasks                    is 'Checklist steps shown during washroom inspection.';
comment on column public.inspection_tasks.id                 is 'Slug matching the inspection_item value used in inspection_images.';
comment on column public.inspection_tasks.reference_image_key is 'Filename stem (without extension) of the reference photo in the reference-images storage bucket. Also used as the key in the app ReferenceImageMap.';
comment on column public.inspection_tasks.instructions       is 'Ordered list of instructions shown to the field user.';
comment on column public.inspection_tasks.sort_order         is 'Display order in the inspection checklist.';
comment on column public.inspection_tasks.active             is 'false = soft-deleted; row is hidden from the app but preserved for audit.';

-- ---------------------------------------------------------------------------
-- 2. Row-Level Security
-- ---------------------------------------------------------------------------

alter table public.inspection_tasks enable row level security;

drop policy if exists inspection_tasks_read on public.inspection_tasks;
create policy inspection_tasks_read
  on public.inspection_tasks
  for select
  to anon, authenticated
  using (active = true);

-- ---------------------------------------------------------------------------
-- 3. Storage bucket for reference images
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('reference-images', 'reference-images', true)
on conflict (id) do nothing;

drop policy if exists reference_images_select on storage.objects;
create policy reference_images_select
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'reference-images');

drop policy if exists reference_images_insert on storage.objects;
create policy reference_images_insert
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'reference-images');

drop policy if exists reference_images_update on storage.objects;
create policy reference_images_update
  on storage.objects for update
  to anon, authenticated
  using  (bucket_id = 'reference-images')
  with check (bucket_id = 'reference-images');

drop policy if exists reference_images_delete on storage.objects;
create policy reference_images_delete
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'reference-images');

-- ---------------------------------------------------------------------------
-- 4. Seed — 16 default checklist items
--    Rows are upserted so this block is safe to re-run at any time.
--    Reference images are NOT stored here; they live in Supabase Storage
--    and are uploaded by manage-tasks.mjs.
-- ---------------------------------------------------------------------------

insert into public.inspection_tasks
  (id, title, reference_image_key, instructions, sort_order)
values
  ('washroom',                  'Washroom',                          'washroom',                  array['Capture the complete washroom.','Ensure good lighting.','Floor must be visible.','Toilet seat should be visible.'],                                                                              1),
  ('basin',                     'Wash Basin',                        'basin',                     array['Capture entire basin.','Mirror should be visible.','Tap should be visible.'],                                                                                                                   2),
  ('mirror',                    'Mirror',                            'mirror',                    array['Capture entire mirror.','No reflections blocking view.'],                                                                                                                                        3),
  ('dustbin',                   'Dustbin',                          'dustbin',                   array['Dustbin should be visible.','Surrounding area should be visible.'],                                                                                                                              4),
  ('running-water',             'Running Water',                     'running-water',             array['Ensure running water is available.','Water should be available 24x7.','Check that the water flow is adequate.'],                                                                                5),
  ('flush',                     'Flush Working',                     'flush',                     array['Check that the flush is working properly.','Flush should operate without issues.','Check only where a flush is provided.'],                                                                     6),
  ('illumination',              'Adequate Illumination',             'illumination',              array['Ensure adequate lighting inside the washroom.','All required areas should be properly illuminated.','Lighting should be functional.'],                                                           7),
  ('door-latch',                'Functional Door Latch',             'door-latch',                array['Check that the door latch is functional.','Door should close and latch properly.','Ensure the latch is not damaged.'],                                                                          8),
  ('leak-free-taps',            'Functional & Leak-Free Taps',       'leak-free-taps',            array['Check that all taps are functional.','Ensure there are no visible leaks.','Check that water flow is adequate.'],                                                                               9),
  ('exhaust-fans',              'Exhaust Fans',                      'exhaust-fans',              array['Check that exhaust fans are available where provided.','Ensure exhaust fans are functional.','Check that there are no visible issues.'],                                                        10),
  ('standardised-signage',      'Standardised Signage',              'standardised-signage',      array['Check that standardised signage is in place.','Signage should be clearly visible.','Signage should be properly positioned.'],                                                                  11),
  ('soap',                      'Soap Available',                    'soap',                      array['Ensure soap is available.','Soap dispenser should be functional where provided.','Ensure adequate soap is available for users.'],                                                               12),
  ('janitor',                   'Janitor on Site',                   'janitor',                   array['Ensure the designated janitor is available on site.','Janitor should be available for cleaning activities.'],                                                                                   13),
  ('cleaning-in-progress-board','"Cleaning in Progress" Board',      'cleaning-in-progress-board',array['Ensure the "Cleaning in Progress" board is available.','Board should be used during cleaning activities.','Board should be clearly visible to users.'],                                        14),
  ('staff-safety-equipment',    'Cleaning Staff Safety Equipment',   'staff-safety-equipment',    array['Check that cleaning staff use gloves and masks.','Ensure clean and appropriate cleaning tools are being used.','Check that forecourt or cleaning staff follow required cleaning practices.'],   15),
  ('hygienic-condition',        'Washroom Hygienic Condition',       'hygienic-condition',        array['Ensure the washroom is maintained in a hygienic condition.','Check that the washroom is clean and presentable.','Washroom should be maintained in hygienic condition at all times.'],          16)
on conflict (id) do update set
  title               = excluded.title,
  reference_image_key = excluded.reference_image_key,
  instructions        = excluded.instructions,
  sort_order          = excluded.sort_order,
  updated_at          = now();
