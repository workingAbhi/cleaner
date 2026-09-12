import {
  corsHeaders,
  env,
  json,
  normalizePhone,
  validatePhoneNumber,
  verifyChallenge,
} from '../_shared/otp.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const cfg = env();
    if (!cfg.supabaseUrl || !cfg.serviceKey) {
      return json({ error: 'Missing Supabase secrets.' }, 500);
    }

    const body = await req.json();
    const destination = normalizePhone(String(body.destination ?? ''));
    const otp = String(body.otp ?? '').trim();

    const phoneValidation = validatePhoneNumber(destination);
    if (!phoneValidation.valid || otp.length < 4) {
      return json({ ok: false, error: phoneValidation.error ?? 'Valid destination and OTP required.' }, 400);
    }

    const ok = await verifyChallenge(
      cfg.supabaseUrl,
      cfg.serviceKey,
      'PHONE',
      destination,
      otp,
      cfg.pepper,
    );

    return json({ ok });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'verify-otp failed' },
      500,
    );
  }
});
