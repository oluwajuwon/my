# Vela authentication and data setup

Vela uses its own Supabase project configuration, Supabase Auth, Postgres Row Level Security, and an Edge Function for account deletion. Demo mode is explicit and never writes to Supabase.

## 1. Configure or link Supabase

Create a Supabase project, or use the project already linked for Vela. Its Supabase workspace lives under `vela/`, so run CLI commands there:

```bash
supabase login
cd vela
supabase link --project-ref YOUR_PROJECT_REF
```

Vela tables are prefixed `vela_` so the products can safely share one project.

## 2. Browser environment variables

Copy `.env.example` to `.env.local` and provide only the public project values:

```dotenv
REACT_APP_SUPABASE_URL_VELA=https://YOUR_PROJECT_REF.supabase.co
REACT_APP_SUPABASE_ANON_KEY_VELA=YOUR_PUBLIC_ANON_KEY
```

Never add a service-role key or database password to a React environment variable. CRA embeds all `REACT_APP_*` values in the browser bundle.

## 3. Apply the database migration

```bash
supabase db push
```

The migration `202610030001_vela_accounts.sql` creates profiles, fitness preferences, granular workout history, nutrition, measurements, records and coach-history tables. Every personal table has RLS policies for authenticated users where `auth.uid() = user_id`, plus cascading deletion from `auth.users`.

## 4. Configure authentication URLs

In Supabase Dashboard → Authentication → URL Configuration:

- Set **Site URL** to the production origin, e.g. `https://example.com`.
- Add `http://localhost:3000/vela` to Redirect URLs.
- Add `http://localhost:3000/vela/reset-password` to Redirect URLs.
- Add the matching production `/vela` and `/vela/reset-password` URLs.

Keep email confirmation enabled for production. Update the Supabase email templates/SMTP sender before launch.

## 5. Deploy secure account deletion

The browser never receives admin credentials. Deploy the authenticated Edge Function:

```bash
supabase functions deploy delete-vela-account
```

Supabase automatically provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` inside the function environment. The function validates the caller's bearer token before invoking admin deletion. Do not copy its service-role secret into `.env` or Netlify browser variables.

## 6. Run locally

```bash
yarn start
```

Open `http://localhost:3000/vela`. Without public Supabase variables, Vela shows a clear setup screen and an explicit portfolio demo-mode option.

## 7. Verification checklist

1. Create an account and confirm the verification email.
2. Sign in and confirm routing goes to onboarding.
3. Refresh halfway through onboarding; the device-local draft should restore.
4. Complete onboarding and confirm routing goes to Today.
5. Log workout sets, refresh during the session, and confirm restoration.
6. Complete a workout, replace a meal, log food/water and add a measurement.
7. Sign out and create/sign in as User B. Confirm none of User A's data appears.
8. Return to User A and confirm their data remains.
9. Use Forgot password and verify the `/vela/reset-password` destination.
10. Review Supabase table rows and RLS using two non-admin test accounts.
11. Test account deletion in a disposable account and verify related rows cascade.

Automated tests cover routing decisions, user-scoped local caches, active-workout restoration and migration policy structure. A live two-account RLS test still requires the configured Supabase project because CI does not have production credentials.
