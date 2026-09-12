import {
  corsHeaders,
  env,
  getSetting,
  json,
  normalizePhone,
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
    const otp = String(body.otp ?? '').trim();

    const master = await getSetting(
      cfg.supabaseUrl,
      cfg.serviceKey,
      'master_owner_phone',
    );
    const destination = normalizePhone(master ?? '');

    if (destination.length < 10 || otp.length < 4) {
      return json({ ok: false, error: 'otp required.' }, 400);
    }

    const ok = await verifyChallenge(
      cfg.supabaseUrl,
      cfg.serviceKey,
      'MASTER',
      destination,
      otp,
      cfg.pepper,
    );

    return json({ ok });
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error ? error.message : 'verify-master-otp failed',
      },
      500,
    );
  }
});
