/**
 * Push MASTER_OWNER_PHONE (and related settings) from .env → Supabase app_settings.
 *
 * Usage:
 *   export SUPABASE_URL=...
 *   export SUPABASE_SERVICE_ROLE_KEY=...
 *   export MASTER_OWNER_PHONE=9999999999
 *   node supabase/push-config.mjs
 *
 * Or put those keys in project .env and run from repo root.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const loadDotEnv = () => {
  const path = resolve(process.cwd(), '.env');
  if (!existsSync(path)) {
    return;
  }

  const text = readFileSync(path, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

loadDotEnv();

const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const masterPhone = (process.env.MASTER_OWNER_PHONE || '')
  .replace(/\D/g, '');

if (!supabaseUrl || !serviceKey) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (script only — never put service_role in the app).',
  );
  process.exit(1);
}

if (!masterPhone) {
  console.error('Missing MASTER_OWNER_PHONE in .env');
  process.exit(1);
}

const upsert = async (key, value) => {
  const response = await fetch(`${supabaseUrl}/rest/v1/app_settings`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({
      key,
      value,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to upsert ${key}: ${text}`);
  }

  return response.json();
};

const rows = await upsert('master_owner_phone', masterPhone);
console.log('Pushed app_settings.master_owner_phone =', masterPhone);
console.log(rows);
