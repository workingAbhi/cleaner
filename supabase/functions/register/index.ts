import {
  corsHeaders,
  env,
  json,
  normalizePhone,
  phoneToAuthEmail,
  requireRecentVerified,
  serviceHeaders,
  validatePassword,
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
    const role = String(body.role ?? 'USER').toUpperCase();
    const phoneNumber = normalizePhone(String(body.phoneNumber ?? ''));
    const password = String(body.password ?? '');
    const name = String(body.name ?? '').trim();
    const roNumber = body.roNumber ? String(body.roNumber).trim() : null;

    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.valid) {
      return json({ error: phoneValidation.error }, 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return json({ error: passwordValidation.error }, 400);
    }

    if (role !== 'USER' && role !== 'ADMIN') {
      return json({ error: 'role must be USER or ADMIN.' }, 400);
    }

    if (role === 'USER' && !roNumber) {
      return json({ error: 'roNumber required for USER.' }, 400);
    }

    const phoneOk = await requireRecentVerified(
      cfg.supabaseUrl,
      cfg.serviceKey,
      'PHONE',
      phoneNumber,
    );
    if (!phoneOk) {
      return json({ error: 'Phone OTP not verified.' }, 403);
    }

    if (role === 'ADMIN') {
      const master = await fetch(
        `${cfg.supabaseUrl}/rest/v1/app_settings?key=eq.master_owner_phone&select=value`,
        { headers: serviceHeaders(cfg.serviceKey) },
      ).then((r) => r.json());
      const masterPhone = normalizePhone(master[0]?.value ?? '');
      const masterOk = await requireRecentVerified(
        cfg.supabaseUrl,
        cfg.serviceKey,
        'MASTER',
        masterPhone,
      );
      if (!masterOk) {
        return json({ error: 'Master OTP not verified.' }, 403);
      }
    }

    const email = phoneToAuthEmail(phoneNumber);
    const createResponse = await fetch(
      `${cfg.supabaseUrl}/auth/v1/admin/users`,
      {
        method: 'POST',
        headers: {
          ...serviceHeaders(cfg.serviceKey),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            phone: phoneNumber,
            phone_number: phoneNumber,
            name: name || (role === 'ADMIN' ? 'Admin' : 'User'),
            role,
            ro_number: roNumber,
          },
        }),
      },
    );

    if (!createResponse.ok) {
      const detail = await createResponse.text();
      return json({ error: 'Unable to create user.', detail }, 400);
    }

    const user = await createResponse.json();
    return json({
      ok: true,
      userId: user.id,
      phoneNumber,
      role,
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'register failed' },
      500,
    );
  }
});
