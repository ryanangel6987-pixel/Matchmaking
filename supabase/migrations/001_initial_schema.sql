-- ============================================================================
-- Dating App Elites — Complete Database Schema
-- Generated from PRD Appendix B
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('client', 'matchmaker', 'admin');
CREATE TYPE photo_status AS ENUM ('uploaded', 'pending_review', 'changes_requested', 'approved', 'live', 'archived');
CREATE TYPE candidate_status AS ENUM ('candidate', 'date_closed', 'pending_client_approval', 'approved', 'declined', 'archived');
CREATE TYPE opportunity_status AS ENUM ('lead', 'date_closed', 'pending_client_approval', 'approved', 'declined', 'archived');
CREATE TYPE client_decision_type AS ENUM ('pending', 'approved', 'declined');
CREATE TYPE account_health_status AS ENUM ('active', 'paused', 'shadowbanned', 'banned', 'needs_verification');
CREATE TYPE communication_channel AS ENUM ('slack', 'whatsapp', 'text', 'email');
CREATE TYPE preference_asset_type AS ENUM ('ex', 'ideal', 'aspirational');
CREATE TYPE onboarding_status AS ENUM ('not_started', 'in_progress', 'completed', 'approved');
CREATE TYPE alert_type AS ENUM (
  'photo_approval',
  'account_issue',
  'onboarding_incomplete',
  'date_opportunity',
  'action_assigned',
  'system_note',
  'credential_issue',
  'account_verification'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  setup_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_matchmaker_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  onboarding_status onboarding_status NOT NULL DEFAULT 'not_started',
  active_apps UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clients_profile_id ON clients(profile_id);
CREATE INDEX idx_clients_assigned_matchmaker_id ON clients(assigned_matchmaker_id);
CREATE INDEX idx_clients_onboarding_status ON clients(onboarding_status);

CREATE TABLE dating_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE onboarding_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,

  -- Section A: Client Context
  full_name TEXT,
  age INTEGER,
  city TEXT,
  neighborhood TEXT,
  profession TEXT,
  title TEXT,
  height_inches INTEGER,
  dating_apps_used TEXT[],
  dating_apps_open_to TEXT[],
  hobbies_and_interests TEXT[],
  surprising_fact TEXT,
  personality_summary TEXT,
  lifestyle_notes TEXT,

  -- Section B: What He Wants
  target_age_min INTEGER,
  target_age_max INTEGER,
  target_max_distance_miles INTEGER,
  target_physical_preferences JSONB DEFAULT '{}'::jsonb,
  target_education_preference TEXT,
  target_profession_preferences TEXT[],
  target_deal_breakers TEXT[],
  target_relationship_intent TEXT,
  target_date_frequency TEXT,

  -- Section C: Operational Notes
  days_available TEXT[],
  preferred_date_times TEXT[],
  blackout_dates DATE[],
  preferred_first_date_style TEXT,
  preferred_neighborhoods TEXT[],
  venues_to_use TEXT[],
  venues_to_avoid TEXT[],
  budget_comfort TEXT,
  preferred_communication_channel communication_channel,
  communication_channel_verified BOOLEAN DEFAULT FALSE,
  target_30_day_outcome TEXT,
  prior_matchmaker_experience TEXT,
  anything_else TEXT,

  -- Photo and AI Permissions
  ai_enhancement_consent BOOLEAN DEFAULT FALSE,
  photo_exclusions TEXT[],

  -- App History
  previous_apps TEXT[],
  previous_services TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_onboarding_data_client_id ON onboarding_data(client_id);

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  storage_url TEXT,
  status photo_status NOT NULL DEFAULT 'uploaded',
  feedback TEXT,
  version INTEGER DEFAULT 1,
  uploader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  live_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_photos_client_id ON photos(client_id);
CREATE INDEX idx_photos_status ON photos(status);

CREATE TABLE credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES dating_apps(id) ON DELETE CASCADE,
  encrypted_username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  encryption_key_version INTEGER NOT NULL DEFAULT 1,
  associated_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE,
  UNIQUE(client_id, app_id)
);

CREATE INDEX idx_credentials_client_id ON credentials(client_id);
CREATE INDEX idx_credentials_app_id ON credentials(app_id);

CREATE TABLE account_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES dating_apps(id) ON DELETE CASCADE,
  status account_health_status NOT NULL DEFAULT 'active',
  verification_notes TEXT,
  ban_notes TEXT,
  restricted_use_notes TEXT,
  platform_risk_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, app_id)
);

CREATE INDEX idx_account_health_client_id ON account_health(client_id);
CREATE INDEX idx_account_health_app_id ON account_health(app_id);
CREATE INDEX idx_account_health_status ON account_health(status);

-- ============================================================================
-- KPI TABLES
-- ============================================================================

CREATE TABLE daily_app_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES dating_apps(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  swipes INTEGER NOT NULL DEFAULT 0,
  new_matches INTEGER NOT NULL DEFAULT 0,
  conversations INTEGER NOT NULL DEFAULT 0,
  dates_closed INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  entered_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, app_id, stat_date)
);

CREATE INDEX idx_daily_app_stats_client_id ON daily_app_stats(client_id);
CREATE INDEX idx_daily_app_stats_app_id ON daily_app_stats(app_id);
CREATE INDEX idx_daily_app_stats_stat_date ON daily_app_stats(stat_date);
CREATE INDEX idx_daily_app_stats_client_app_date ON daily_app_stats(client_id, app_id, stat_date);

-- ============================================================================
-- PREFERENCES AND TARGETING TABLES
-- ============================================================================

CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  target_age_min INTEGER,
  target_age_max INTEGER,
  max_distance_miles INTEGER,
  physical_preferences JSONB DEFAULT '{}'::jsonb,
  education_preference TEXT,
  profession_preferences TEXT[],
  deal_breakers TEXT[],
  relationship_intent TEXT,
  date_frequency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_preferences_client_id ON preferences(client_id);

CREATE TABLE approved_type (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  target_archetype TEXT,
  what_to_prioritize TEXT,
  what_to_avoid TEXT,
  targeting_notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_approved_type_client_id ON approved_type(client_id);

CREATE TABLE preference_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  asset_type preference_asset_type NOT NULL,
  storage_path TEXT NOT NULL,
  storage_url TEXT,
  tags TEXT[],
  notes TEXT,
  classification TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_preference_assets_client_id ON preference_assets(client_id);
CREATE INDEX idx_preference_assets_asset_type ON preference_assets(asset_type);

CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT,
  age INTEGER,
  photo_url TEXT,
  source_app_id UUID REFERENCES dating_apps(id) ON DELETE SET NULL,
  archetype_descriptor TEXT,
  notes TEXT,
  status candidate_status NOT NULL DEFAULT 'candidate',
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  matchmaker_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_candidates_client_id ON candidates(client_id);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_source_app_id ON candidates(source_app_id);

-- ============================================================================
-- VENUE TABLE (must be before date_opportunities due to FK)
-- ============================================================================

CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  venue_name TEXT NOT NULL,
  neighborhood TEXT,
  vibe TEXT,
  date_type TEXT,
  first_date_suitable BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_avoided BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_venues_client_id ON venues(client_id);
CREATE INDEX idx_venues_is_active ON venues(is_active);

-- ============================================================================
-- DATE OPPORTUNITY TABLES
-- ============================================================================

CREATE TABLE date_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  app_id UUID REFERENCES dating_apps(id) ON DELETE SET NULL,
  candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
  candidate_name TEXT NOT NULL,
  candidate_age INTEGER,
  candidate_photo_url TEXT,
  memorable_detail TEXT,
  phone_number TEXT,
  proposed_day DATE,
  proposed_time TIME,
  day_determined BOOLEAN NOT NULL DEFAULT TRUE,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  prewritten_text TEXT,
  notes TEXT,
  status opportunity_status NOT NULL DEFAULT 'lead',
  client_decision client_decision_type NOT NULL DEFAULT 'pending',
  client_decision_at TIMESTAMP WITH TIME ZONE,
  decline_reason TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_date_opportunities_client_id ON date_opportunities(client_id);
CREATE INDEX idx_date_opportunities_app_id ON date_opportunities(app_id);
CREATE INDEX idx_date_opportunities_status ON date_opportunities(status);
CREATE INDEX idx_date_opportunities_client_decision ON date_opportunities(client_decision);
CREATE INDEX idx_date_opportunities_proposed_day ON date_opportunities(proposed_day);
CREATE INDEX idx_date_opportunities_created_at ON date_opportunities(created_at);

CREATE TABLE optional_date_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_opportunity_id UUID NOT NULL REFERENCES date_opportunities(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  notes TEXT,
  preference_update TEXT,
  venue_feedback TEXT,
  avoidance_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_optional_date_feedback_opportunity ON optional_date_feedback(date_opportunity_id);
CREATE INDEX idx_optional_date_feedback_client ON optional_date_feedback(client_id);

-- ============================================================================
-- ACTIONS AND ALERTS
-- ============================================================================

CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_actions_client_id ON actions(client_id);
CREATE INDEX idx_actions_status ON actions(status);

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  related_entity_id UUID,
  related_entity_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_alerts_client_id ON alerts(client_id);
CREATE INDEX idx_alerts_alert_type ON alerts(alert_type);
CREATE INDEX idx_alerts_read ON alerts(read);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- SUPPORT NOTES
-- ============================================================================

CREATE TABLE support_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_notes_client_id ON support_notes(client_id);
CREATE INDEX idx_support_notes_note_type ON support_notes(note_type);

-- ============================================================================
-- DATA INTEGRITY CONSTRAINTS
-- ============================================================================

ALTER TABLE date_opportunities
ADD CONSTRAINT date_opportunities_required_fields
CHECK (client_id IS NOT NULL AND candidate_name IS NOT NULL);

ALTER TABLE date_opportunities
ADD CONSTRAINT date_opportunities_approval_check
CHECK (
  (status = 'approved' AND client_decision = 'approved' AND client_decision_at IS NOT NULL)
  OR status != 'approved'
);

ALTER TABLE optional_date_feedback
ADD CONSTRAINT optional_feedback_no_orphans
CHECK (date_opportunity_id IS NOT NULL AND client_id IS NOT NULL);

ALTER TABLE daily_app_stats
ADD CONSTRAINT daily_stats_entered_by_required
CHECK (entered_by IS NOT NULL);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) ENABLE
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_app_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE preference_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE optional_date_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_my_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_assigned_matchmaker(p_client_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM clients
    WHERE id = p_client_id
    AND assigned_matchmaker_id = get_my_profile_id()
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_client_owner(p_client_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM clients
    WHERE id = p_client_id
    AND profile_id = get_my_profile_id()
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- profiles
CREATE POLICY "profiles_view_own" ON profiles FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "profiles_matchmaker_view_assigned" ON profiles FOR SELECT
  USING (
    id IN (
      SELECT c.profile_id FROM clients c
      WHERE c.assigned_matchmaker_id = get_my_profile_id()
    )
  );

CREATE POLICY "profiles_admin_view_all" ON profiles FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "profiles_insert_self" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "profiles_update_self" ON profiles FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- clients
CREATE POLICY "clients_view_own" ON clients FOR SELECT
  USING (profile_id = get_my_profile_id());

CREATE POLICY "clients_matchmaker_view_assigned" ON clients FOR SELECT
  USING (assigned_matchmaker_id = get_my_profile_id());

CREATE POLICY "clients_admin_all" ON clients FOR ALL
  USING (get_my_role() = 'admin');

-- dating_apps
CREATE POLICY "dating_apps_read_all" ON dating_apps FOR SELECT
  USING (TRUE);

CREATE POLICY "dating_apps_admin_manage" ON dating_apps FOR ALL
  USING (get_my_role() = 'admin');

-- onboarding_data
CREATE POLICY "onboarding_client_view_own" ON onboarding_data FOR SELECT
  USING (is_client_owner(client_id));

CREATE POLICY "onboarding_matchmaker_manage" ON onboarding_data FOR ALL
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "onboarding_admin_all" ON onboarding_data FOR ALL
  USING (get_my_role() = 'admin');

-- photos
CREATE POLICY "photos_client_view_own" ON photos FOR SELECT
  USING (is_client_owner(client_id));

CREATE POLICY "photos_client_insert" ON photos FOR INSERT
  WITH CHECK (is_client_owner(client_id));

CREATE POLICY "photos_matchmaker_manage" ON photos FOR ALL
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "photos_admin_all" ON photos FOR ALL
  USING (get_my_role() = 'admin');

-- credentials
CREATE POLICY "credentials_client_manage_own" ON credentials FOR ALL
  USING (is_client_owner(client_id));

CREATE POLICY "credentials_matchmaker_view" ON credentials FOR SELECT
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "credentials_admin_all" ON credentials FOR ALL
  USING (get_my_role() = 'admin');

-- account_health
CREATE POLICY "account_health_client_view" ON account_health FOR SELECT
  USING (is_client_owner(client_id));

CREATE POLICY "account_health_matchmaker_manage" ON account_health FOR ALL
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "account_health_admin_all" ON account_health FOR ALL
  USING (get_my_role() = 'admin');

-- daily_app_stats
CREATE POLICY "stats_client_view_own" ON daily_app_stats FOR SELECT
  USING (is_client_owner(client_id));

CREATE POLICY "stats_matchmaker_manage" ON daily_app_stats FOR ALL
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "stats_admin_all" ON daily_app_stats FOR ALL
  USING (get_my_role() = 'admin');

-- preferences
CREATE POLICY "preferences_client_view_own" ON preferences FOR SELECT
  USING (is_client_owner(client_id));

CREATE POLICY "preferences_matchmaker_manage" ON preferences FOR ALL
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "preferences_admin_all" ON preferences FOR ALL
  USING (get_my_role() = 'admin');

-- approved_type
CREATE POLICY "approved_type_client_view" ON approved_type FOR SELECT
  USING (is_client_owner(client_id));

CREATE POLICY "approved_type_matchmaker_manage" ON approved_type FOR ALL
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "approved_type_admin_all" ON approved_type FOR ALL
  USING (get_my_role() = 'admin');

-- preference_assets
CREATE POLICY "pref_assets_client_view" ON preference_assets FOR SELECT
  USING (is_client_owner(client_id));

CREATE POLICY "pref_assets_client_insert" ON preference_assets FOR INSERT
  WITH CHECK (is_client_owner(client_id));

CREATE POLICY "pref_assets_matchmaker_manage" ON preference_assets FOR ALL
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "pref_assets_admin_all" ON preference_assets FOR ALL
  USING (get_my_role() = 'admin');

-- candidates
CREATE POLICY "candidates_matchmaker_manage" ON candidates FOR ALL
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "candidates_client_view" ON candidates FOR SELECT
  USING (is_client_owner(client_id));

CREATE POLICY "candidates_admin_all" ON candidates FOR ALL
  USING (get_my_role() = 'admin');

-- date_opportunities
CREATE POLICY "opportunities_client_view_own" ON date_opportunities FOR SELECT
  USING (is_client_owner(client_id));

CREATE POLICY "opportunities_client_update_decision" ON date_opportunities FOR UPDATE
  USING (is_client_owner(client_id))
  WITH CHECK (is_client_owner(client_id));

CREATE POLICY "opportunities_matchmaker_manage" ON date_opportunities FOR ALL
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "opportunities_admin_all" ON date_opportunities FOR ALL
  USING (get_my_role() = 'admin');

-- optional_date_feedback
CREATE POLICY "feedback_client_manage_own" ON optional_date_feedback FOR ALL
  USING (is_client_owner(client_id));

CREATE POLICY "feedback_matchmaker_view" ON optional_date_feedback FOR SELECT
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "feedback_admin_all" ON optional_date_feedback FOR ALL
  USING (get_my_role() = 'admin');

-- venues
CREATE POLICY "venues_client_view_own" ON venues FOR SELECT
  USING (is_client_owner(client_id));

CREATE POLICY "venues_matchmaker_manage" ON venues FOR ALL
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "venues_admin_all" ON venues FOR ALL
  USING (get_my_role() = 'admin');

-- actions
CREATE POLICY "actions_client_view_own" ON actions FOR SELECT
  USING (is_client_owner(client_id));

CREATE POLICY "actions_matchmaker_manage" ON actions FOR ALL
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "actions_admin_all" ON actions FOR ALL
  USING (get_my_role() = 'admin');

-- alerts
CREATE POLICY "alerts_client_view_own" ON alerts FOR SELECT
  USING (is_client_owner(client_id));

CREATE POLICY "alerts_matchmaker_manage" ON alerts FOR ALL
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "alerts_admin_all" ON alerts FOR ALL
  USING (get_my_role() = 'admin');

-- audit_logs
CREATE POLICY "audit_logs_admin_only" ON audit_logs FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "audit_logs_insert_any" ON audit_logs FOR INSERT
  WITH CHECK (TRUE);

-- support_notes
CREATE POLICY "support_notes_client_view" ON support_notes FOR SELECT
  USING (is_client_owner(client_id));

CREATE POLICY "support_notes_matchmaker_manage" ON support_notes FOR ALL
  USING (is_assigned_matchmaker(client_id));

CREATE POLICY "support_notes_admin_all" ON support_notes FOR ALL
  USING (get_my_role() = 'admin');

-- ============================================================================
-- DERIVED KPI VIEW
-- ============================================================================

CREATE OR REPLACE VIEW client_kpi_summary AS
SELECT
  c.id AS client_id,
  COALESCE(SUM(das.swipes), 0) AS total_swipes,
  COALESCE(SUM(das.new_matches), 0) AS total_matches,
  COALESCE(SUM(das.conversations), 0) AS total_conversations,
  COALESCE(SUM(das.dates_closed), 0) AS total_dates_closed,
  (
    SELECT COUNT(*) FROM date_opportunities do2
    WHERE do2.client_id = c.id AND do2.client_decision = 'approved'
  ) AS dates_approved,
  CASE WHEN COALESCE(SUM(das.swipes), 0) > 0
    THEN ROUND(SUM(das.new_matches)::numeric / SUM(das.swipes), 4)
    ELSE 0
  END AS match_rate,
  CASE WHEN COALESCE(SUM(das.new_matches), 0) > 0
    THEN ROUND(SUM(das.conversations)::numeric / SUM(das.new_matches), 4)
    ELSE 0
  END AS conversation_rate,
  CASE WHEN COALESCE(SUM(das.conversations), 0) > 0
    THEN ROUND(SUM(das.dates_closed)::numeric / SUM(das.conversations), 4)
    ELSE 0
  END AS close_rate
FROM clients c
LEFT JOIN daily_app_stats das ON das.client_id = c.id
GROUP BY c.id;

-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO dating_apps (app_name, description) VALUES
  ('Hinge', 'The app designed to be deleted'),
  ('Tinder', 'Swipe-based dating app'),
  ('Bumble', 'Women make the first move'),
  ('Raya', 'Elite dating application'),
  ('The League', 'Selective dating community')
ON CONFLICT DO NOTHING;
