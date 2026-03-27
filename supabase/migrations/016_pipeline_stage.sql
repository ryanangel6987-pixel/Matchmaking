-- Add pipeline stage columns for matchmaker and admin kanban tracking
-- Matchmaker stages: date_assigned, account_live, first_swipes, first_date, five_dates
-- Admin stages: new_signup, call_booked, onboarding_complete, profile_build, profile_complete, assigned, profile_live, first_date, five_dates
ALTER TABLE clients ADD COLUMN IF NOT EXISTS mm_pipeline_stage TEXT DEFAULT 'date_assigned';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS admin_pipeline_stage TEXT DEFAULT 'new_signup';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS mm_stage_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE clients ADD COLUMN IF NOT EXISTS admin_stage_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
