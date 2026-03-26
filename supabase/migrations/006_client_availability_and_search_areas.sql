-- Client weekly availability slots (interactive calendar)
CREATE TABLE client_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL, -- Monday, Tuesday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, day_of_week, start_time)
);

CREATE INDEX idx_client_availability_client ON client_availability(client_id);
ALTER TABLE client_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "availability_client_manage_own" ON client_availability FOR ALL
  USING (is_client_owner(client_id));
CREATE POLICY "availability_matchmaker_view" ON client_availability FOR SELECT
  USING (is_assigned_matchmaker(client_id));
CREATE POLICY "availability_admin_all" ON client_availability FOR ALL
  USING (get_my_role() = 'admin');

-- Client search areas (up to 3 locations with radius)
CREATE TABLE client_search_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  radius_miles INTEGER NOT NULL DEFAULT 25 CHECK (radius_miles >= 10),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_client_search_areas_client ON client_search_areas(client_id);
ALTER TABLE client_search_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_areas_client_manage_own" ON client_search_areas FOR ALL
  USING (is_client_owner(client_id));
CREATE POLICY "search_areas_matchmaker_view" ON client_search_areas FOR SELECT
  USING (is_assigned_matchmaker(client_id));
CREATE POLICY "search_areas_admin_all" ON client_search_areas FOR ALL
  USING (get_my_role() = 'admin');

-- Add venue preference fields to onboarding_data
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS venue_categories TEXT[]; -- cocktail bars, lounges, dining, etc.
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS venue_no_gos TEXT[]; -- dive bars, weird activities, etc.
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS venue_suggestions TEXT; -- specific venue names client wants
