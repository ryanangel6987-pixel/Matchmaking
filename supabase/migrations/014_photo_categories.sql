ALTER TABLE photos ADD COLUMN IF NOT EXISTS photo_category TEXT DEFAULT 'general'; -- face_body, lifestyle, current_profile, curated, general
