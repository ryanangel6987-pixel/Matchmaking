-- Multiple candidate photos for swipeable gallery
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS candidate_photos TEXT[] DEFAULT '{}';
