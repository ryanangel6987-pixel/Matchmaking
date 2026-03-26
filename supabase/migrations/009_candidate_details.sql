-- Add more candidate detail fields for deal-breaker auto-flagging
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS candidate_ethnicity TEXT;
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS candidate_education TEXT;
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS candidate_profession TEXT;
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS candidate_height_inches INTEGER;
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS candidate_has_kids TEXT;
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS candidate_location TEXT;
