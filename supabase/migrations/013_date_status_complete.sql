-- Migration 013: Date status machine — feedback columns on date_opportunities
-- Also adds priority column to actions table for onboarding handoff

ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS date_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS feedback_status TEXT DEFAULT 'none'; -- none, pending, submitted
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS feedback_rating INTEGER; -- 1-5
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS feedback_notes TEXT;
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS feedback_want_second_date BOOLEAN;
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS feedback_submitted_at TIMESTAMP WITH TIME ZONE;

-- Add priority to actions (used by onboarding handoff and future features)
ALTER TABLE actions ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Constrain feedback_status values
ALTER TABLE date_opportunities ADD CONSTRAINT chk_feedback_status
  CHECK (feedback_status IN ('none', 'pending', 'submitted'));

-- Constrain feedback_rating range
ALTER TABLE date_opportunities ADD CONSTRAINT chk_feedback_rating
  CHECK (feedback_rating IS NULL OR (feedback_rating >= 1 AND feedback_rating <= 5));

-- Index for querying dates needing feedback
CREATE INDEX IF NOT EXISTS idx_date_opportunities_feedback_status ON date_opportunities(feedback_status);
