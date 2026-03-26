-- Matchmaker availability (working days and hours)
CREATE TABLE matchmaker_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  working_days TEXT[] DEFAULT '{Monday,Tuesday,Wednesday,Thursday,Friday}',
  start_time TIME DEFAULT '09:00',
  end_time TIME DEFAULT '17:00',
  timezone TEXT DEFAULT 'America/New_York',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_matchmaker_availability_profile ON matchmaker_availability(profile_id);

ALTER TABLE matchmaker_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "availability_own_manage" ON matchmaker_availability FOR ALL
  USING (profile_id = get_my_profile_id());

CREATE POLICY "availability_admin_all" ON matchmaker_availability FOR ALL
  USING (get_my_role() = 'admin');

-- Client can read their matchmaker's availability
CREATE POLICY "availability_client_view_matchmaker" ON matchmaker_availability FOR SELECT
  USING (
    profile_id IN (
      SELECT c.assigned_matchmaker_id FROM clients c
      WHERE c.profile_id = get_my_profile_id()
    )
  );

-- Matchmaker session tracking (login/logout times)
CREATE TABLE matchmaker_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  logout_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_matchmaker_sessions_profile ON matchmaker_sessions(profile_id);
CREATE INDEX idx_matchmaker_sessions_login ON matchmaker_sessions(login_at);

ALTER TABLE matchmaker_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_own_manage" ON matchmaker_sessions FOR ALL
  USING (profile_id = get_my_profile_id());

CREATE POLICY "sessions_admin_all" ON matchmaker_sessions FOR ALL
  USING (get_my_role() = 'admin');
