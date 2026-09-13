# Supabase setup (Cleaner)

Auth uses **Supabase Auth** + `profiles`. Images + AI stay on Storage / tables / Edge Functions.
Mock auth/OTP remain when `SUPABASE_URL` / `SUPABASE_ANON_KEY` are empty.

## 1. Create the project

1. Open https://supabase.com/dashboard
2. New project
3. Region closest to you
4. Save the database password

## 2. Run SQL

1. SQL Editor → New query → paste [`schema.sql`](schema.sql) → Run  
2. New query → paste [`schema_auth.sql`](schema_auth.sql) → Run  

You should see:

- `inspection_images`, `ai_analyses`, bucket `inspection-images`
- `profiles`, `app_settings`, `otp_challenges`
- Role-aware RLS (authenticated user/admin)

## 3. App `.env` (react-native-config)

Copy [`.env.example`](../.env.example) → `.env` and fill:

```bash
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
IMAGE_EDIT_WINDOW_HOURS=2
MASTER_OWNER_PHONE=9999999999
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # scripts only — never ship in the app
```

Dashboard → Project Settings → API for URL / anon / service_role.

**Rebuild** the Android app after changing `.env`:

```bash
npx react-native run-android
```

## 4. Push master / top phone to Supabase

```bash
# from repo root (reads .env)
node supabase/push-config.mjs
```

This upserts `app_settings.master_owner_phone`. Admin registration SMS goes to that number.

Manual alternative:

```sql
insert into public.app_settings (key, value)
values ('master_owner_phone', '9999999999')
on conflict (key) do update
set value = excluded.value, updated_at = now();
```

## 5. Edge Functions

Deploy (CLI or Dashboard paste) these functions from `supabase/functions/`:

| Function | Purpose |
|----------|---------|
| `send-otp` | User phone OTP |
| `verify-otp` | Verify user phone OTP |
| `send-master-otp` | Admin top-phone OTP |
| `verify-master-otp` | Verify master OTP |
| `register` | Create Auth user after OTPs verified |
| `analyze-image` | Image analysis pipeline |

### Secrets (Dashboard → Edge Functions → Secrets)

| Secret | Required |
|--------|----------|
| `OTP_PEPPER` | Yes (random string) |
| `TWILIO_ACCOUNT_SID` | Yes for real SMS |
| `TWILIO_AUTH_TOKEN` | Yes for real SMS |
| `TWILIO_FROM_NUMBER` | Yes for real SMS |
| `OTP_DEV_MODE` | `true` to skip Twilio and return `devOtp` in API responses (emulator) |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically for Edge Functions.

CLI example:

```bash
supabase functions deploy send-otp
supabase functions deploy verify-otp
supabase functions deploy send-master-otp
supabase functions deploy verify-master-otp
supabase functions deploy register
supabase functions deploy analyze-image
supabase secrets set OTP_PEPPER="your-random-string" OTP_DEV_MODE=true
```

## 6. Auth model

- Login UI: phone + password
- Auth email identity: `{digits}@phone.cleaner.app`
- Profile row: phone, name, role (`USER`|`ADMIN`), `ro_number`
- User register: phone OTP → `register` function
- Admin register: phone OTP + master OTP → `register` function

## 7. End-to-end smoke test (emulator)

1. Run schema + `schema_auth.sql`, push master phone, deploy functions, set secrets (`OTP_DEV_MODE=true` until Twilio is ready).
2. Rebuild app with `.env` filled.
3. **User:** Register (note Dev OTP alert) → Login → Start Inspection → capture → confirm.
4. Supabase: row in `inspection_images`, file in Storage, `ai_analyses` PROCESSING → COMPLETED.
5. User Home shows photo + **Under analysis** then score/results.
6. **Admin:** Register with master OTP → Login → Dashboard shows same evidence (Under analysis → results). Polls every 4s while processing.
7. Profile → Sign out to switch roles.

## 8. Optional: Provided_RO_Pics

```bash
export SUPABASE_URL="https://xxxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
node supabase/seed-provided-pics.mjs
```

Sample pics use `kind=sample` and do **not** show on User Home.

## 9. Security notes

- Never put **service_role** or **GEMINI_API_KEY** in the mobile app.
- Turn off `OTP_DEV_MODE` and configure Twilio before any real deployment.
- Current storage select remains public for image URLs; tighten later if needed.
