@AGENTS.md

# Private Dating Concierge — Client Portal

## Project Context
Multi-role concierge infrastructure portal for a private dating service. Replaces fragmented email/text operations with centralized workflows for onboarding, preferences, profile approvals, KPI tracking, and date opportunity management.

## Tech Stack (LOCKED)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict: true)
- **Styling**: Tailwind CSS v4 + shadcn/ui (dark theme)
- **Database**: Supabase (PostgreSQL + RLS + Storage + Realtime)
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Architecture

### Route Groups
- `(auth)/` — Login, signup, verify, reset-password
- `(client)/` — 5-tab client portal (overview, preferences, dashboard, profile, access)
- `(matchmaker)/` — Matchmaker portal (client list, detail, stats upload, opportunities)
- `admin/` — Admin dashboard (real route prefix, not grouped)

### Server vs Client Components
- Server Components (default): Fetch data via Supabase server client, pass as props
- Client Components ("use client"): Interactivity, forms, state, subscriptions
- Pattern: `page.tsx` (server) fetches → `*-client.tsx` (client) renders

### Supabase Clients
- `lib/supabase/client.ts` — Browser client (used in "use client" components)
- `lib/supabase/server.ts` — Server client (used in page.tsx, layout.tsx, API routes)
- `lib/supabase/middleware.ts` — Session refresh + role-based routing

### RLS Pattern
All tables have RLS enabled. 4 helper functions:
- `get_my_profile_id()` — Current user's profile UUID
- `get_my_role()` — Current user's role enum
- `is_assigned_matchmaker(client_id)` — Check matchmaker assignment
- `is_client_owner(client_id)` — Check client ownership

### Design System
- Always dark — no light mode
- Base: `#131313` (surface), `#E6C487` (gold primary)
- Typography: Noto Serif (headlines), Inter (body)
- No borders — use background shifts, gradients, negative space
- Gold gradient CTAs: `linear-gradient(135deg, #e6c487, #c9a96e)`
- Material Symbols Outlined for icons

## Key Rules
1. **Dates Approved = DERIVED.** Never manual. Always `COUNT(*) FROM date_opportunities WHERE client_decision = 'approved'`
2. **3 roles only.** client, matchmaker, admin. No VA role.
3. **Day undetermined mode.** `day_determined` boolean controls which fields show on date opportunities.
4. **Optional feedback only.** Post-date feedback is never mandatory.
5. **All routes force-dynamic.** Supabase requires runtime env vars.
6. **Matchmaker = full operator.** Full read/write access to assigned clients.

## File Structure
```
app/
  (auth)/login, signup, verify, reset-password, callback
  (client)/overview, preferences, dashboard, profile, access
  (matchmaker)/clients, clients/[id], clients/[id]/stats, clients/[id]/opportunities
  admin/, admin/clients, admin/matchmakers, admin/audit
components/
  client-nav.tsx, matchmaker-nav.tsx
  overview/, preferences/, dashboard/, profile/, access/, matchmaker/
lib/supabase/client.ts, server.ts, middleware.ts
supabase/migrations/001_initial_schema.sql
```

## Database
Full schema in `supabase/migrations/001_initial_schema.sql`:
- 10 enum types, 18 tables, 34+ indexes
- 4 helper functions, 44 RLS policies
- `client_kpi_summary` view for derived KPIs
- Seed data for 5 dating apps
