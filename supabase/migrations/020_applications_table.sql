-- Applications table: stores pre-call qualification data before account creation
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  city TEXT,
  profession TEXT,
  age INTEGER,
  height TEXT,
  own_ethnicity TEXT,
  own_body_type TEXT,
  life_window TEXT,
  biggest_challenge TEXT,
  duration TEXT,
  tried_before TEXT,
  current_results TEXT,
  priority_level INTEGER,
  ideal_partner TEXT,
  her_age_min INTEGER,
  her_age_max INTEGER,
  her_ethnicities TEXT[] DEFAULT '{}',
  her_body_types TEXT[] DEFAULT '{}',
  lead_score INTEGER DEFAULT 0,
  lead_tier TEXT DEFAULT 'medium', -- high, medium, likely_unqualified
  status TEXT DEFAULT 'pending', -- pending, activated, rejected
  activated_at TIMESTAMP WITH TIME ZONE,
  activated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_email ON applications(email);
CREATE INDEX idx_applications_lead_tier ON applications(lead_tier);

-- RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Admin can see and manage all applications
CREATE POLICY "applications_admin_all" ON applications FOR ALL
  USING (get_my_role() = 'admin');

-- Anyone can insert (public form submission)
CREATE POLICY "applications_public_insert" ON applications FOR INSERT
  WITH CHECK (true);
