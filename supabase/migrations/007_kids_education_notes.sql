-- Add kids, education, and notes fields
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS has_kids TEXT; -- yes, no, prefer_not_to_say
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS kids_details TEXT;
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS education TEXT[];  -- multiple colleges/universities
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS client_notes TEXT; -- open notes about himself

-- Add kids preference and notes to preferences (what he wants)
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS kids_preference TEXT; -- wants_kids, no_kids, open, has_kids_ok, no_preference
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS target_notes TEXT; -- open notes about what he wants
