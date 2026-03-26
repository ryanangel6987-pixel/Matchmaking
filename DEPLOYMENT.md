# Deployment Runbook

## Required Environment Variables

| Variable | Description | Where to set |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Vercel env vars |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Vercel env vars |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Vercel env vars |
| `CREDENTIAL_ENCRYPTION_KEY` | AES encryption key for credential vault | Vercel env vars |

> Never commit secrets to the repository. All secrets must be set in the Vercel dashboard or via `vercel env`.

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note the project URL and anon key from **Settings > API**.

### 2. Run Migrations (in order)

Execute each migration file against your Supabase database via the SQL Editor or CLI:

```bash
supabase db push
```

Or manually run each file in order:

1. `supabase/migrations/001_initial_schema.sql` — Core tables, enums, RLS policies, helper functions, seed data
2. `supabase/migrations/002_add_whatsapp_number.sql` — WhatsApp number field
3. `supabase/migrations/003_credential_ban_tracking.sql` — Credential ban tracking columns
4. `supabase/migrations/004_matchmaker_availability_and_sessions.sql` — Matchmaker availability and sessions
5. `supabase/migrations/005_add_drinking_and_date_type.sql` — Drinking and date type preferences
6. `supabase/migrations/006_client_availability_and_search_areas.sql` — Client availability and search areas
7. `supabase/migrations/007_kids_education_notes.sql` — Kids, education, notes fields
8. `supabase/migrations/008_specific_available_dates.sql` — Specific available dates
9. `supabase/migrations/009_candidate_details.sql` — Candidate detail fields
10. `supabase/migrations/010_candidate_photos_array.sql` — Candidate photos array
11. `supabase/migrations/011_reservation_and_texting.sql` — Reservation and texting fields

### 3. Storage Buckets

Create the following storage buckets in **Supabase Dashboard > Storage**:

| Bucket | Description | Public |
|--------|-------------|--------|
| `photos` | Client profile photos (uploaded, reviewed, approved) | No |
| `avatars` | User avatar images | Yes |
| `preference_assets` | Ex/ideal/aspirational reference images | No |

For each private bucket, add RLS policies so only the owning client and their assigned matchmaker can access files.

### 4. Auth Configuration

1. Enable **Email** auth provider in **Authentication > Providers**.
2. Configure redirect URLs to include your Vercel deployment domain.
3. Optionally configure custom SMTP for transactional emails.

## Vercel Deployment

### 1. Connect Repository

1. Import the repository in the [Vercel dashboard](https://vercel.com/new).
2. Framework preset: **Next.js** (auto-detected).
3. Root directory: `dae-portal/` (if the project is nested in a monorepo).

### 2. Set Environment Variables

Add all variables from the table above in **Settings > Environment Variables**. Set them for Production, Preview, and Development as needed.

### 3. Deploy

```bash
# Via CLI
vercel --prod

# Or push to main branch for automatic deployment
git push origin main
```

### 4. Verify

- Visit the deployment URL and confirm the login page loads.
- Test auth flow (signup, login, password reset).
- Confirm realtime subscriptions are working (check browser console for WebSocket connection).

## Rollback Procedure

### Application Rollback

1. Go to **Vercel Dashboard > Deployments**.
2. Find the last known-good deployment.
3. Click the three-dot menu and select **Promote to Production**.

Via CLI:

```bash
# List recent deployments
vercel ls

# Promote a specific deployment
vercel promote <deployment-url>
```

### Database Rollback

Supabase does not have built-in migration rollback. For critical issues:

1. Restore from a Supabase **point-in-time recovery** backup (Pro plan required).
2. Or manually write and execute a reverse migration SQL script.

> Always test migrations on a staging Supabase project before running on production.

## Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] Migrations have been run successfully
- [ ] Storage buckets exist with correct policies
- [ ] Auth redirect URLs include the production domain
- [ ] Realtime is enabled on required tables (`date_opportunities`, `alerts`, `photos`)
- [ ] CREDENTIAL_ENCRYPTION_KEY is a strong, unique key (not the dev fallback)
