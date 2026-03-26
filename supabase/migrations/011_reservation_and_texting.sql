-- Reservation tracking on date opportunities
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS reservation_status TEXT DEFAULT 'pending'; -- pending, booked, deposit_required, confirmed, cancelled
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS reservation_notes TEXT;
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL;
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS deposit_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS phone_shared_at TIMESTAMP WITH TIME ZONE; -- when matchmaker shared the number
ALTER TABLE date_opportunities ADD COLUMN IF NOT EXISTS client_texted_at TIMESTAMP WITH TIME ZONE; -- when client confirmed they texted
