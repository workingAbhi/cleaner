import {
  corsHeaders,
  createChallenge,
  env,
  getSetting,
  json,
  maskPhone,
  normalizePhone,
  randomOtp,
  sendSms,
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

    const master = await getSetting(
      cfg.supabaseUrl,
      cfg.serviceKey,
      'master_owner_phone',
    );
    const destination = normalizePhone(master ?? '');
    if (destination.length < 10) {
      return json(
        { error: 'master_owner_phone is not configured in app_settings.' },
        500,
      );
    }

    const otp = randomOtp();
    await createChallenge(
      cfg.supabaseUrl,
      cfg.serviceKey,
      'MASTER',
      destination,
      otp,
      cfg.pepper,
    );

    const sms = await sendSms(
      destination,
      `Cleaner admin approval code: ${otp}`,
      cfg,
    );

    return json({
      ok: true,
      maskedPhone: maskPhone(destination),
      ...(sms.devOtp ? { devOtp: sms.devOtp } : {}),
    });
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error ? error.message : 'send-master-otp failed',
      },
      500,
    );
  }
});
