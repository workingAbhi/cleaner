import {
  corsHeaders,
  createChallenge,
  env,
  json,
  normalizePhone,
  randomOtp,
  sendSms,
  validatePhoneNumber,
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
    const phoneValidation = validatePhoneNumber(destination);
    if (!phoneValidation.valid) {
      return json(
        { error: phoneValidation.error },
        400,
      );
    }

    const otp = randomOtp();
    await createChallenge(
      cfg.supabaseUrl,
      cfg.serviceKey,
      'PHONE',
      destination,
      otp,
      cfg.pepper,
    );

    const sms = await sendSms(
      destination,
      `Cleaner verification code: ${otp}`,
      cfg,
    );

    return json({
      ok: true,
      destination,
      ...(sms.devOtp ? { devOtp: sms.devOtp } : {}),
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'send-otp failed' },
      500,
    );
  }
});
