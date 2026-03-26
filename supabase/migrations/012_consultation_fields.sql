-- Consultation tracking
ALTER TABLE clients ADD COLUMN IF NOT EXISTS consultation_booked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS consultation_status TEXT DEFAULT 'pending'; -- pending, booked, completed, no_show
ALTER TABLE clients ADD COLUMN IF NOT EXISTS application_data JSONB DEFAULT '{}'; -- stores initial application answers
