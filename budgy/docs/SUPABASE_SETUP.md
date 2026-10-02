# Budgy Supabase setup

Budgy uses Supabase Auth, Postgres, Row Level Security and Realtime. The browser uses only the project URL and public anon key. Never expose a service-role key in this repository, frontend environment, deployment settings available to the browser, logs, or invite links.

## 1. Create the project

Create a Supabase project and record its Project URL and public anon key from **Project Settings → API**. Keep the service-role key server-side and out of Budgy.

## 2. Configure the frontend

Copy `.env.example` to `.env.local`:

```text
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

Restart the CRA development server after changing environment variables.

## 3. Apply the database migration

Install and authenticate the Supabase CLI, link the project, then apply every SQL file in `budgy/supabase/migrations` in filename order. If Phase 3 is already installed, apply `202609280002_household_members.sql`; it adds editable member profiles, household-management RPCs and tighter membership permissions.

Phase 3.5 additionally requires `202609280003_money_accounts.sql`. It adds household financial accounts, stable budget-item allocations, transfer/card-payment movement types, authenticated actor enforcement, account RLS and Realtime publication. It preserves existing transactions and backfills an allowance only when an unambiguous same-month category/owner match exists.

If local Phase 2 data was imported before member-name cleanup was added, apply `202609280004_legacy_member_labels.sql`. It replaces legacy relationship words in allowance/income names with the display name of the already-mapped owner. It does not infer identities or change ownership.

Phase 3.6 requires `202609280005_refunds.sql`. It adds refunds as a first-class transaction movement and permits an explicitly allocated refund to reduce the matching monthly allowance actual. Monthly reports are derived in the application from the existing household rows, so they do not require a separate reports table or migration.

First-time onboarding requires `202609300001_user_onboarding.sql`. It stores completion, completion time and walkthrough version on each user's own profile. The authenticated-user-only RPC marks onboarding complete; skipping is deliberately session-only and does not change the database.

Typed income and expense classification requires `202609300002_transaction_categories.sql`. It marks all existing categories as expense categories, seeds household income categories, links planned income sources to an income type and preferred account, and lets actual income reference its planned source. Existing income transactions are deliberately left as uncategorised rather than being guessed from their descriptions.

Monthly money purposes require `202610010001_money_purposes.sql`. It safely defaults existing budget items to spending, adds explicit debt-payment plans linked to credit-card accounts, lets confirmed card payments fulfil those plans without becoming spending, and adds the atomic household reallocation RPC. Apply it before deploying the matching frontend.

The migration creates profiles, households, memberships, budget months, income, categories, budget items, transactions, savings goals, scenarios and changes, structured activity events, secure invitation records, and idempotent import markers.

## 4. Authentication and redirect URLs

In **Authentication → URL Configuration** set the Site URL to the deployed portfolio origin. Add redirects for:

- `http://localhost:3000/budgy`
- `http://localhost:3000/budgy/reset-password`
- `https://YOUR_DOMAIN/budgy`
- `https://YOUR_DOMAIN/budgy/reset-password`

Enable Email/Password authentication. Decide whether email confirmation is required. For production, configure a custom SMTP provider so signup, confirmation and password-reset email delivery is reliable.

Each partner signs up separately. One creates the household; its owner generates a random, seven-day invite link for the partner. Only a SHA-256 hash is stored. The raw token stays in the URL fragment, which is not sent in HTTP requests, and acceptance additionally requires the authenticated email to match the invited email.

## 5. Realtime

The migration adds only Budgy’s collaborative tables to `supabase_realtime`. Verify them under **Database → Publications → supabase_realtime**. The frontend opens one channel filtered to the active `household_id` and removes it on unmount. RLS still applies to Realtime records.

## 6. RLS model

Every household-owned table has RLS enabled. `is_household_member(uuid)` and `is_household_owner(uuid)` are `security definer` helpers with fixed search paths. Policies use membership from `auth.uid()`, never a household ID trusted from UI state.

- Household members can read/write their household’s financial rows.
- Cross-household UUID manipulation fails policy checks.
- Only owners can rename households, create/cancel invitations, or remove members through guarded RPCs.
- Members can update only their own profile; there is no policy for editing another member's identity.
- Onboarding state is per profile. Users can read only profiles in their households, can update only their own profile, and the completion RPC always targets `auth.uid()` rather than a client-supplied user ID.
- Direct membership deletion is disabled. The removal RPC preserves the former member's display label on financial history and prevents removal of the last owner.
- Invitation acceptance checks hash, expiry, unused status and the authenticated email.
- Activity rows are readable by members but created by database triggers, not arbitrary client text.
- Owner user IDs on financial rows are rejected unless that user belongs to the same household.
- Payment accounts, destination accounts and allocated budgets are validated against the transaction household. Transaction `created_by` is overwritten with `auth.uid()` on insert.

## Accounting rules

- `expense` transactions consume a monthly allowance; allocated `refund` transactions reduce that allowance's actual spending.
- A credit-card purchase is one expense: it increases card debt and consumes its explicitly allocated budget once.
- A refund returns money to its selected account and reduces card debt when the selected account is a credit card.
- `credit_card_payment` reduces the source bank balance and card debt without creating monthly spending.
- `transfer` moves money between accounts and is neither income nor spending.
- Monthly reports are deterministic views over stored plans, transactions and accounts. Card payments and transfers are excluded from income and spending, while transfers into savings accounts contribute to actual savings.
- Remaining allowance and available credit are always calculated, never stored.
- Pacing is deterministic: over 100% is **Over budget**; spending more than 15 percentage points ahead of elapsed month is **Watch spending**; otherwise it is **On track**. These are factual classifications, not financial advice.

For production assurance, test with three accounts: A and B in Household 1, C in Household 2. With each user JWT, attempt selects and inserts using the other household UUID. Both reads and writes must return no rows or an RLS error.

## 7. Local development

```bash
yarn install
yarn start
```

For a fully local Supabase stack, initialize/link the CLI so it uses the files under `budgy/supabase`, start Supabase, apply the migration, and point `.env.local` at the local API URL and anon key.

## 8. Development seed

The seed never runs automatically. Create a test account and household first, run `budgy/supabase/seed.sql`, then execute:

```sql
select public.seed_budgy_example('YOUR_TEST_HOUSEHOLD_UUID');
```

It requires two real household members and assigns the £4,900 and £2,600 incomes to their user IDs, along with the £2,500 savings target and Phase 2 example budget for September 2026. Do not run it against a real household. Drop the helper after use if desired.

## 9. LocalStorage migration

After authentication and household creation, Budgy hashes any Phase 2 local dataset and checks `household_imports`. Before import, every legacy personal label must be explicitly mapped to a real member; “Household” remains the shared ownership state. No partner identity is inferred. IDs are regenerated as UUIDs, the original JSON is backed up locally, server writes must finish, and only then is the old active key removed and the dataset hash recorded. The unique marker makes imports idempotent.

## 10. Database types

Typed DTOs live in `src/products/Budgy/infrastructure/supabase/database.types.ts`. After schema changes, regenerate authoritative types with the current Supabase CLI, then review repository mappers before replacing the checked-in definitions:

```bash
supabase gen types typescript --project-id YOUR_PROJECT_REF > src/products/Budgy/infrastructure/supabase/database.generated.ts
```

Keep database DTOs separate from the domain models used by pure financial calculations.

## 11. Production deployment

Add the two `REACT_APP_` public variables to the deployment environment, apply migrations before deploying the frontend, configure production Auth redirects and SMTP, and verify the SPA fallback still serves `/budgy/*`. No service-role key is required by or permitted in the client.

Before launch, manually test signup confirmation, sign-in/out, reset links, invite expiry/email mismatch, two-browser Realtime updates, failed-network retries, local import, and all cross-household RLS probes.
## Money-purpose definitions

Budgy keeps planning, spending, and account movement distinct:

- **Planned spending** is money assigned to ordinary expense/consumption items.
- **Actual spending** is qualifying expense transactions, net of refunds.
- **Planned debt payment** is money assigned to reducing an existing card balance.
- **Actual debt payment** is a qualifying card-payment transaction linked to that monthly purpose.
- **Left to spend** is planned spending minus actual spending. Debt payments never increase it.
- **Left to allocate** is planned household income minus spending purposes, debt-payment purposes, other allocation purposes, and the first-class savings target.
- **Available cash** comes from account ledgers. **Available credit** comes from a card limit minus debt. Neither is interchangeable with a budget amount.

The `202610010001_money_purposes.sql` migration adds the typed purpose and card relationship. Existing budget items migrate to `spending`; planned savings remains the existing `budget_months.savings_target_pence` source of truth.
