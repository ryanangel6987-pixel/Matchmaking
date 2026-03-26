-- Add ban tracking to credentials
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS was_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS ban_notes TEXT;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS banned_photos_reused BOOLEAN DEFAULT FALSE;
-- Add status column if not exists (some code references it)
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
-- Add notes column if not exists
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS notes TEXT;
