-- Add client self-description fields (own ethnicity, body type)
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS own_ethnicity TEXT;
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS own_body_type TEXT;
