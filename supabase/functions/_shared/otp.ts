// Shared OTP helpers for Cleaner Edge Functions
export * from '../../../src/core/constants/authValidation.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

export function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function normalizePhone(phone: string): string {
  return String(phone || '').replace(/\D/g, '');
}

export async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function randomOtp(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return String(n).padStart(6, '0');
}

export function env() {
  return {
    supabaseUrl: Deno.env.get('SUPABASE_URL') ?? '',
    serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    pepper: Deno.env.get('OTP_PEPPER') ?? 'cleaner-dev-pepper',
    twilioSid: Deno.env.get('TWILIO_ACCOUNT_SID') ?? '',
    twilioToken: Deno.env.get('TWILIO_AUTH_TOKEN') ?? '',
    twilioFrom: Deno.env.get('TWILIO_FROM_NUMBER') ?? '',
    devMode: (Deno.env.get('OTP_DEV_MODE') ?? '').toLowerCase() === 'true',
  };
}

export function serviceHeaders(serviceKey: string) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

export async function sendSms(
  toDigits: string,
  body: string,
  cfg: ReturnType<typeof env>,
): Promise<{ sent: boolean; devOtp?: string }> {
  if (cfg.twilioSid && cfg.twilioToken && cfg.twilioFrom) {
    const to = toDigits.startsWith('+') ? toDigits : `+91${toDigits}`;
    const auth = btoa(`${cfg.twilioSid}:${cfg.twilioToken}`);
    const params = new URLSearchParams({
      To: to,
      From: cfg.twilioFrom,
      Body: body,
    });
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${cfg.twilioSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      },
    );
    if (!response.ok) {
      throw new Error(`Twilio SMS failed: ${await response.text()}`);
    }
    return { sent: true };
  }

  if (cfg.devMode) {
    console.log(`[OTP_DEV_MODE] SMS to ${toDigits}: ${body}`);
    return { sent: false, devOtp: body.match(/\b(\d{6})\b/)?.[1] };
  }

  throw new Error(
    'SMS not configured. Set Twilio secrets or OTP_DEV_MODE=true for local testing.',
  );
}

export async function getSetting(
  supabaseUrl: string,
  serviceKey: string,
  key: string,
): Promise<string | null> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/app_settings?key=eq.${encodeURIComponent(key)}&select=value`,
    { headers: serviceHeaders(serviceKey) },
  );
  if (!response.ok) {
    throw new Error(await response.text());
  }
  const rows = await response.json();
  return rows[0]?.value ?? null;
}

export async function createChallenge(
  supabaseUrl: string,
  serviceKey: string,
  type: 'PHONE' | 'MASTER',
  destination: string,
  otp: string,
  pepper: string,
) {
  const otp_hash = await sha256Hex(`${pepper}:${type}:${destination}:${otp}`);
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const response = await fetch(`${supabaseUrl}/rest/v1/otp_challenges`, {
    method: 'POST',
    headers: serviceHeaders(serviceKey),
    body: JSON.stringify({
      type,
      destination,
      otp_hash,
      expires_at,
    }),
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return (await response.json())[0];
}

export async function verifyChallenge(
  supabaseUrl: string,
  serviceKey: string,
  type: 'PHONE' | 'MASTER',
  destination: string,
  otp: string,
  pepper: string,
): Promise<boolean> {
  const list = await fetch(
    `${supabaseUrl}/rest/v1/otp_challenges?type=eq.${type}&destination=eq.${encodeURIComponent(destination)}&verified_at=is.null&order=created_at.desc&limit=1`,
    { headers: serviceHeaders(serviceKey) },
  );
  if (!list.ok) {
    throw new Error(await list.text());
  }
  const rows = await list.json();
  const row = rows[0];
  if (!row) {
    return false;
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return false;
  }
  if (row.attempts >= 5) {
    return false;
  }

  const otp_hash = await sha256Hex(`${pepper}:${type}:${destination}:${otp}`);
  const ok = otp_hash === row.otp_hash;

  await fetch(
    `${supabaseUrl}/rest/v1/otp_challenges?id=eq.${row.id}`,
    {
      method: 'PATCH',
      headers: serviceHeaders(serviceKey),
      body: JSON.stringify(
        ok
          ? { verified_at: new Date().toISOString(), attempts: row.attempts + 1 }
          : { attempts: row.attempts + 1 },
      ),
    },
  );

  return ok;
}

export async function requireRecentVerified(
  supabaseUrl: string,
  serviceKey: string,
  type: 'PHONE' | 'MASTER',
  destination: string,
): Promise<boolean> {
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const response = await fetch(
    `${supabaseUrl}/rest/v1/otp_challenges?type=eq.${type}&destination=eq.${encodeURIComponent(destination)}&verified_at=gte.${since}&order=verified_at.desc&limit=1`,
    { headers: serviceHeaders(serviceKey) },
  );
  if (!response.ok) {
    throw new Error(await response.text());
  }
  const rows = await response.json();
  return Boolean(rows[0]);
}

export function phoneToAuthEmail(phone: string): string {
  return `${normalizePhone(phone)}@phone.cleaner.app`;
}

export function maskPhone(phone: string): string {
  const d = normalizePhone(phone);
  if (d.length < 4) {
    return '****';
  }
  return `${'*'.repeat(Math.max(0, d.length - 4))}${d.slice(-4)}`;
}
