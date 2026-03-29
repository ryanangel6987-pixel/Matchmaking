-- Store the meeting URL (Zoom/Google Meet) from GoHighLevel booking
ALTER TABLE clients ADD COLUMN IF NOT EXISTS consultation_meeting_url TEXT;
