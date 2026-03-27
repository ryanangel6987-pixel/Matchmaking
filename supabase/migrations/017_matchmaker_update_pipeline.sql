-- Allow matchmakers to update pipeline stage on their assigned clients
CREATE POLICY "clients_matchmaker_update_stage" ON clients FOR UPDATE
  USING (assigned_matchmaker_id = get_my_profile_id())
  WITH CHECK (assigned_matchmaker_id = get_my_profile_id());
