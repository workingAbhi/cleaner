/**
 * Uploads Provided_RO_Pics as kind=sample.
 * User Home does not show these rows.
 *
 * SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node supabase/seed-provided-pics.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PICS = path.join(ROOT, 'Provided_RO_Pics');
const BUCKET = 'inspection-images';

const OUTLETS = {
  'BHAGAT BROTHERS': 'RO8001',
  'CHANDRA HIGHWAY': 'RO8002',
  'SARTHI FUEL STATION': 'RO8003',
  'SRI RADHA FUEL': 'RO8004',
  'VISHNU PETROLEUM': 'RO8005',
};

const FACILITIES = {
  ladies: 'ladies',
  gens: 'gents',
  gents: 'gents',
  urinal: 'urinal',
  pq: 'pq',
  'pq toilet': 'pq',
  bathroom: 'bathroom',
};

const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
};

const facilityFromFolder = (name) =>
  FACILITIES[name.trim().toLowerCase()] ?? null;

const listImages = (dir) =>
  fs.readdirSync(dir).filter((name) => /\.(jpe?g|png|webp)$/i.test(name));

const uploadFile = async (storagePath, filePath) => {
  const body = fs.readFileSync(filePath);
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${BUCKET}/${storagePath}`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true',
      },
      body,
    },
  );

  if (!response.ok) {
    throw new Error(`${storagePath}: ${await response.text()}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`;
};

const upsertRow = async (row) => {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/inspection_images?on_conflict=id`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(row),
    },
  );

  if (!response.ok) {
    throw new Error(`${row.id}: ${await response.text()}`);
  }
};

let uploaded = 0;
let skipped = 0;

for (const [outletName, roId] of Object.entries(OUTLETS)) {
  const outletDir = path.join(PICS, outletName);

  if (!fs.existsSync(outletDir)) {
    console.warn(`Missing folder: ${outletName}`);
    continue;
  }

  for (const folder of fs.readdirSync(outletDir)) {
    const facilityDir = path.join(outletDir, folder);
    if (!fs.statSync(facilityDir).isDirectory()) {
      continue;
    }

    const facility = facilityFromFolder(folder);
    if (!facility) {
      console.warn(`Unknown facility folder: ${outletName}/${folder}`);
      skipped += 1;
      continue;
    }

    for (const fileName of listImages(facilityDir)) {
      const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, '_');
      const storagePath = `sample/${roId}/${facility}/${safeName}`;
      const id = `sample-${roId}-${facility}-${safeName}`;
      const filePath = path.join(facilityDir, fileName);
      const now = new Date().toISOString();
      const link = await uploadFile(storagePath, filePath);

      await upsertRow({
        id,
        ro_id: roId,
        inspection_item: facility,
        facility,
        kind: 'sample',
        link,
        image_uri: link,
        storage_path: storagePath,
        created_at: now,
        updated_at: now,
        editing_history: [
          {
            action: 'CREATED',
            timestamp: now,
            newLink: link,
            userName: 'provided-ro-pics',
          },
        ],
      });

      uploaded += 1;
      console.log(id);
    }
  }
}

console.log(`Done. uploaded=${uploaded} skipped_folders=${skipped}`);
