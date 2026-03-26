-- Add drinking preference and date type preference to onboarding_data
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS drinks_alcohol TEXT DEFAULT 'sometimes'; -- yes, sometimes, never
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS preferred_date_type TEXT; -- drinks, dinner, coffee, activity, flexible
ALTER TABLE onboarding_data ADD COLUMN IF NOT EXISTS drink_preferences TEXT; -- e.g. "whiskey, wine, cocktails"
