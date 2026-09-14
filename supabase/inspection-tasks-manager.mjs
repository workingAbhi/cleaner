#!/usr/bin/env node
/**
 * manage-tasks.mjs — Manage inspection_tasks in Supabase
 * -------------------------------------------------------
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (in .env or environment).
 * The service_role key is server-only — never put it in the mobile app.
 *
 * Commands
 * ────────
 *   node supabase/manage-tasks.mjs seed
 *       Upload all 16 reference images from supabase/reference-images/
 *       then upsert all 16 task rows. Safe to re-run.
 *
 *   node supabase/manage-tasks.mjs list
 *       Print all tasks currently in the DB (including soft-deleted).
 *
 *   node supabase/manage-tasks.mjs add \
 *       --id=hand-dryer \
 *       --title="Hand Dryer" \
 *       --image=supabase/reference-images/hand-dryer.jpg \
 *       --instructions="Check dryer is functional","Ensure it is clean" \
 *       --order=17
 *
 *   node supabase/manage-tasks.mjs update --id=soap \
 *       --title="Soap & Sanitiser" \
 *       [--image=path/to/new.jpg] \
 *       [--instructions="New instruction 1","New instruction 2"] \
 *       [--order=12]
 *
 *   node supabase/manage-tasks.mjs delete  --id=janitor
 *       Soft-delete: sets active=false (hidden from app, data preserved).
 *
 *   node supabase/manage-tasks.mjs restore --id=janitor
 *       Un-delete: sets active=true.
 *
 *   node supabase/manage-tasks.mjs reorder --id=basin --order=1
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ─── Load .env ───────────────────────────────────────────────────────────────

const loadDotEnv = () => {
  const p = resolve(process.cwd(), '.env');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      val = val.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = val;
  }
};
loadDotEnv();

const BASE_URL   = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET      = 'reference-images';
const ROOT        = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES_DIR  = path.join(ROOT, 'supabase', 'reference-images');

if (!BASE_URL || !SERVICE_KEY) {
  console.error('❌  Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

const authHeaders = (extra = {}) => ({
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  ...extra,
});

const restUrl = (table, qs = '') =>
  `${BASE_URL}/rest/v1/${table}${qs ? '?' + qs : ''}`;

const storageUploadUrl = (storagePath) =>
  `${BASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`;

const storagePublicUrl = (storagePath) =>
  `${BASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;

/** Detect MIME type from file extension. WebP files renamed to .jpg are still
 *  served fine by browsers; storage just needs a consistent type. */
const mimeFor = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png')  return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg'; // .jpg / .jpeg / anything else
};

// ─── Storage ─────────────────────────────────────────────────────────────────

/** Upload a local image file → Supabase Storage. Returns its public URL. */
const uploadImage = async (localPath, storagePath) => {
  if (!existsSync(localPath)) {
    throw new Error(`Image not found: ${localPath}`);
  }
  const body = fs.readFileSync(localPath);
  const res = await fetch(storageUploadUrl(storagePath), {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': mimeFor(localPath),
      'x-upsert': 'true',
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`Storage upload failed [${res.status}]: ${await res.text()}`);
  }
  return storagePublicUrl(storagePath);
};

// ─── DB helpers ───────────────────────────────────────────────────────────────

const upsertTask = async (row) => {
  const res = await fetch(restUrl('inspection_tasks', 'on_conflict=id'), {
    method: 'POST',
    headers: authHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`Upsert failed [${res.status}]: ${await res.text()}`);
};

const patchTask = async (id, fields) => {
  const res = await fetch(
    restUrl('inspection_tasks', `id=eq.${encodeURIComponent(id)}`),
    {
      method: 'PATCH',
      headers: authHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ ...fields, updated_at: new Date().toISOString() }),
    },
  );
  if (!res.ok) throw new Error(`Patch failed [${res.status}]: ${await res.text()}`);
};

const fetchAll = async () => {
  const res = await fetch(
    restUrl('inspection_tasks', 'order=sort_order.asc,id.asc'),
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error(`Fetch failed [${res.status}]: ${await res.text()}`);
  return res.json();
};

// ─── Task definitions ─────────────────────────────────────────────────────────
// reference_image_key === the file stem in supabase/reference-images/
// (all files are now .jpg after canonical rename)

const TASKS = [
  {
    id: 'washroom',
    title: 'Washroom',
    reference_image_key: 'washroom',
    sort_order: 1,
    instructions: [
      'Capture the complete washroom.',
      'Ensure good lighting.',
      'Floor must be visible.',
      'Toilet seat should be visible.',
    ],
  },
  {
    id: 'basin',
    title: 'Wash Basin',
    reference_image_key: 'basin',
    sort_order: 2,
    instructions: [
      'Capture entire basin.',
      'Mirror should be visible.',
      'Tap should be visible.',
    ],
  },
  {
    id: 'mirror',
    title: 'Mirror',
    reference_image_key: 'mirror',
    sort_order: 3,
    instructions: [
      'Capture entire mirror.',
      'No reflections blocking view.',
    ],
  },
  {
    id: 'dustbin',
    title: 'Dustbin',
    reference_image_key: 'dustbin',
    sort_order: 4,
    instructions: [
      'Dustbin should be visible.',
      'Surrounding area should be visible.',
    ],
  },
  {
    id: 'running-water',
    title: 'Running Water',
    reference_image_key: 'running-water',
    sort_order: 5,
    instructions: [
      'Ensure running water is available.',
      'Water should be available 24x7.',
      'Check that the water flow is adequate.',
    ],
  },
  {
    id: 'flush',
    title: 'Flush Working',
    reference_image_key: 'flush',
    sort_order: 6,
    instructions: [
      'Check that the flush is working properly.',
      'Flush should operate without issues.',
      'Check only where a flush is provided.',
    ],
  },
  {
    id: 'illumination',
    title: 'Adequate Illumination',
    reference_image_key: 'illumination',
    sort_order: 7,
    instructions: [
      'Ensure adequate lighting inside the washroom.',
      'All required areas should be properly illuminated.',
      'Lighting should be functional.',
    ],
  },
  {
    id: 'door-latch',
    title: 'Functional Door Latch',
    reference_image_key: 'door-latch',
    sort_order: 8,
    instructions: [
      'Check that the door latch is functional.',
      'Door should close and latch properly.',
      'Ensure the latch is not damaged.',
    ],
  },
  {
    id: 'leak-free-taps',
    title: 'Functional & Leak-Free Taps',
    reference_image_key: 'leak-free-taps',
    sort_order: 9,
    instructions: [
      'Check that all taps are functional.',
      'Ensure there are no visible leaks.',
      'Check that water flow is adequate.',
    ],
  },
  {
    id: 'exhaust-fans',
    title: 'Exhaust Fans',
    reference_image_key: 'exhaust-fans',
    sort_order: 10,
    instructions: [
      'Check that exhaust fans are available where provided.',
      'Ensure exhaust fans are functional.',
      'Check that there are no visible issues.',
    ],
  },
  {
    id: 'standardised-signage',
    title: 'Standardised Signage',
    reference_image_key: 'standardised-signage',
    sort_order: 11,
    instructions: [
      'Check that standardised signage is in place.',
      'Signage should be clearly visible.',
      'Signage should be properly positioned.',
    ],
  },
  {
    id: 'soap',
    title: 'Soap Available',
    reference_image_key: 'soap',
    sort_order: 12,
    instructions: [
      'Ensure soap is available.',
      'Soap dispenser should be functional where provided.',
      'Ensure adequate soap is available for users.',
    ],
  },
  {
    id: 'janitor',
    title: 'Janitor on Site',
    reference_image_key: 'janitor',
    sort_order: 13,
    instructions: [
      'Ensure the designated janitor is available on site.',
      'Janitor should be available for cleaning activities.',
    ],
  },
  {
    id: 'cleaning-in-progress-board',
    title: '"Cleaning in Progress" Board',
    reference_image_key: 'cleaning-in-progress-board',
    sort_order: 14,
    instructions: [
      'Ensure the "Cleaning in Progress" board is available.',
      'Board should be used during cleaning activities.',
      'Board should be clearly visible to users.',
    ],
  },
  {
    id: 'staff-safety-equipment',
    title: 'Cleaning Staff Safety Equipment',
    reference_image_key: 'staff-safety-equipment',
    sort_order: 15,
    instructions: [
      'Check that cleaning staff use gloves and masks.',
      'Ensure clean and appropriate cleaning tools are being used.',
      'Check that forecourt or cleaning staff follow required cleaning practices.',
    ],
  },
  {
    id: 'hygienic-condition',
    title: 'Washroom Hygienic Condition',
    reference_image_key: 'hygienic-condition',
    sort_order: 16,
    instructions: [
      'Ensure the washroom is maintained in a hygienic condition.',
      'Check that the washroom is clean and presentable.',
      'Washroom should be maintained in hygienic condition at all times.',
    ],
  },
];

// ─── Commands ─────────────────────────────────────────────────────────────────

const parseArgs = () => {
  const args = process.argv.slice(2);
  const command = args[0];
  const flags = {};
  for (const arg of args.slice(1)) {
    const m = arg.match(/^--([^=]+)=?(.*)$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2] || true;
    flags[key] = flags[key] !== undefined ? [].concat(flags[key], val) : val;
  }
  return { command, flags };
};

// ── seed ──────────────────────────────────────────────────────────────────────

const cmdSeed = async () => {
  console.log('📦  Seeding inspection_tasks…\n');

  // 1. Upload all reference images
  console.log('── Uploading reference images ──────────────────────────────');
  for (const task of TASKS) {
    const key      = task.reference_image_key;
    const filePath = path.join(IMAGES_DIR, `${key}.jpg`);
    const storage  = `${key}.jpg`;
    try {
      await uploadImage(filePath, storage);
      console.log(`  ✓  ${storage}`);
    } catch (err) {
      console.warn(`  ⚠  ${storage}: ${err.message}`);
    }
  }

  // 2. Upsert all task rows
  console.log('\n── Upserting task rows ─────────────────────────────────────');
  for (const task of TASKS) {
    await upsertTask({ ...task, active: true, updated_at: new Date().toISOString() });
    console.log(`  ✓  ${task.id.padEnd(32)} sort=${task.sort_order}`);
  }

  console.log('\n✅  Done. Run "list" to verify.\n');
};

// ── list ──────────────────────────────────────────────────────────────────────

const cmdList = async () => {
  const rows = await fetchAll();
  if (!rows.length) { console.log('No tasks found.'); return; }

  console.log(`\n${'#'.padEnd(4)}${'ID'.padEnd(34)}${'TITLE'.padEnd(40)}${'IMG KEY'.padEnd(32)}ACTIVE`);
  console.log('─'.repeat(115));
  for (const r of rows) {
    const active = r.active ? '✓' : '✗  (deleted)';
    console.log(
      `${String(r.sort_order).padEnd(4)}${r.id.padEnd(34)}${r.title.padEnd(40)}${r.reference_image_key.padEnd(32)}${active}`,
    );
  }
  console.log();
};

// ── add ───────────────────────────────────────────────────────────────────────

const cmdAdd = async (flags) => {
  const { id, title, image, order } = flags;
  if (!id || !title) {
    console.error('❌  --id and --title are required.'); process.exit(1);
  }
  const imageKey   = flags['image-key'] || id;
  const instructions = [].concat(flags.instructions || []);

  if (image) {
    const storage = `${imageKey}${path.extname(image) || '.jpg'}`;
    console.log(`Uploading ${image} → ${storage} …`);
    await uploadImage(image, storage);
    console.log('  ✓ image uploaded');
  }

  await upsertTask({
    id,
    title,
    reference_image_key: imageKey,
    instructions,
    sort_order: Number(order ?? 99),
    active: true,
    updated_at: new Date().toISOString(),
  });
  console.log(`✅  Task "${id}" added.`);
};

// ── update ────────────────────────────────────────────────────────────────────

const cmdUpdate = async (flags) => {
  const { id, image } = flags;
  if (!id) { console.error('❌  --id required.'); process.exit(1); }

  const patch = {};
  if (flags.title)        patch.title        = flags.title;
  if (flags.instructions) patch.instructions = [].concat(flags.instructions);
  if (flags['image-key']) patch.reference_image_key = flags['image-key'];
  if (flags.order)        patch.sort_order   = Number(flags.order);

  if (image) {
    const key     = flags['image-key'] || id;
    const storage = `${key}${path.extname(image) || '.jpg'}`;
    console.log(`Uploading ${image} → ${storage} …`);
    await uploadImage(image, storage);
    patch.reference_image_key = key;
    console.log('  ✓ image uploaded');
  }

  if (!Object.keys(patch).length) {
    console.error('❌  Nothing to update. Pass --title, --instructions, --image, --image-key, or --order.');
    process.exit(1);
  }

  await patchTask(id, patch);
  console.log(`✅  Task "${id}" updated.`);
};

// ── delete ────────────────────────────────────────────────────────────────────

const cmdDelete = async ({ id }) => {
  if (!id) { console.error('❌  --id required.'); process.exit(1); }
  await patchTask(id, { active: false });
  console.log(`✅  Task "${id}" soft-deleted (active=false). Use "restore" to undo.`);
};

// ── restore ───────────────────────────────────────────────────────────────────

const cmdRestore = async ({ id }) => {
  if (!id) { console.error('❌  --id required.'); process.exit(1); }
  await patchTask(id, { active: true });
  console.log(`✅  Task "${id}" restored (active=true).`);
};

// ── reorder ───────────────────────────────────────────────────────────────────

const cmdReorder = async ({ id, order }) => {
  if (!id || order === undefined) {
    console.error('❌  --id and --order required.'); process.exit(1);
  }
  await patchTask(id, { sort_order: Number(order) });
  console.log(`✅  Task "${id}" sort_order → ${order}.`);
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const { command, flags } = parseArgs();

switch (command) {
  case 'seed':    await cmdSeed();           break;
  case 'list':    await cmdList();           break;
  case 'add':     await cmdAdd(flags);       break;
  case 'update':  await cmdUpdate(flags);    break;
  case 'delete':  await cmdDelete(flags);    break;
  case 'restore': await cmdRestore(flags);   break;
  case 'reorder': await cmdReorder(flags);   break;
  default:
    console.log(`
Usage: node supabase/manage-tasks.mjs <command> [options]

Commands:
  seed                               Upload images + upsert all 16 default rows
  list                               Print all tasks in the DB
  add    --id=<id>                   Add a new task
         --title=<title>
         [--image=<path>]            Local image to upload
         [--image-key=<key>]         reference_image_key (defaults to id)
         [--instructions=<text>]     Repeatable: one string per flag
         [--order=<n>]               sort_order (default 99)
  update --id=<id>                   Update an existing task
         [--title=<title>]
         [--image=<path>]
         [--image-key=<key>]
         [--instructions=<text>]
         [--order=<n>]
  delete  --id=<id>                  Soft-delete (active=false)
  restore --id=<id>                  Un-delete   (active=true)
  reorder --id=<id> --order=<n>      Change display position
`);
}
