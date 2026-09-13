# CLEANER — Retail Outlet Inspection & Compliance Platform

Cleaner is an enterprise **Inspection & Compliance Mobile Platform** built with React Native (CLI) and TypeScript, backed by Supabase for authentication, storage, and database persistence.

---

## 📱 Features

- **Role-Based Access**:
  - **Retail Outlet (RO) User**: Live camera-based inspection checklist, photo uploads, partial inspection persistence, and image review.
  - **Admin**: Territory and outlet hierarchy drill-down, compliance monitoring, and review of all RO inspection evidence.
- **Strict RO Ownership Boundary**: Inspection images and records belong to the Retail Outlet (`roId` / `roNumber`), persisting seamlessly across users of the same RO.
- **Live Device Camera Capture**: Inspections enforce live capture via `react-native-image-picker` with no gallery bypass.
- **Centralized Auth & Validation Rules**: Single source of truth for phone and password rules across both frontend screens/hooks and Supabase Edge Functions (`src/core/constants/authValidation.ts`).
- **Immediate Persistence**: Every confirmed photo is immediately uploaded and saved to Supabase Storage and PostgreSQL (`inspection_images`).

---

## 🏗️ Architecture

```
Mobile App (React Native CLI + TypeScript)
│
├── Screens & Components (UI Layer)
├── Custom Hooks (useInspectionFlow, useUserRegister, useAdminRegister)
├── API Service Layer (AuthApi, InspectionUploadApi, MasterApi, OtpApi)
└── Config & Constants (AppConfig, AuthValidationRules)
      │
      ▼
Supabase Backend
├── Supabase Auth (GoTrue phone identity: {digits}@phone.cleaner.app)
├── PostgreSQL (profiles, inspection_images, ai_analyses, app_settings, otp_challenges)
├── Supabase Storage (inspection-images bucket)
└── Edge Functions (send-otp, verify-otp, send-master-otp, verify-master-otp, register, analyze-image)
```

---

## 🚀 Getting Started

### Prerequisites

- macOS with **Xcode** (iOS) and **Android Studio** (Android SDK & NDK)
- Node.js >= 18
- JDK 17
- Supabase CLI (`brew install supabase/tap/supabase`)

---

### 1. Environment Setup

Copy `.env.example` to `.env` in the repository root:

```bash
cp .env.example .env
```

Configure your `.env`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi... (your public anon key)
IMAGE_EDIT_WINDOW_HOURS=2
MASTER_OWNER_PHONE=9999999999
SUPABASE_SERVICE_ROLE_KEY=eyJ... (for push-config script only)
```

---

### 2. Supabase Setup

1. In Supabase Dashboard $\rightarrow$ **SQL Editor**:
   - Run `supabase/schema.sql` (creates `inspection_images`, `ai_analyses`, and storage bucket policies).
   - Run `supabase/schema_auth.sql` (creates `profiles`, `app_settings`, `otp_challenges`, triggers, and RLS).
2. Set Supabase Edge Function Secrets:
   ```bash
   supabase secrets set OTP_PEPPER="your-random-secret" OTP_DEV_MODE=true
   ```
   *(Set `OTP_DEV_MODE=true` for emulator testing; configure Twilio credentials for real SMS).*
3. Deploy Edge Functions:
   ```bash
   supabase functions deploy send-otp --no-verify-jwt
   supabase functions deploy verify-otp --no-verify-jwt
   supabase functions deploy send-master-otp --no-verify-jwt
   supabase functions deploy verify-master-otp --no-verify-jwt
   supabase functions deploy register --no-verify-jwt
   supabase functions deploy analyze-image
   ```

---

### 3. Running the App

#### Android

```bash
# Clean cache & build
cd android && ./gradlew clean && cd ..
npx react-native start --reset-cache
```

In a second terminal:
```bash
npx react-native run-android
```

#### iOS

```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## 🔒 Security & Validation Rules

- **Phone Number**: Exactly 10 digits (`AuthValidationRules.MIN_PHONE_DIGITS = 10`, `AuthValidationRules.MAX_PHONE_DIGITS = 10`).
- **Password**: 6 to 8 characters (`AuthValidationRules.MIN_PASSWORD_LENGTH = 6`, `AuthValidationRules.MAX_PASSWORD_LENGTH = 8`).
- **Single Source of Truth**: Rules are imported from [`src/core/constants/authValidation.ts`](src/core/constants/authValidation.ts) across the app and backend functions.
- **Service Role Protection**: The `service_role` key is strictly kept on the server/CLI and never shipped in the mobile client.
