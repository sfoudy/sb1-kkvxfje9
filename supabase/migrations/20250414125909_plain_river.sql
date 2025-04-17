/*
  # Add deletion policies for archived competitions

  1. Changes
    - Add DELETE policies to archived tables
    - Only competition creators can delete their archived data
    - Cascading delete through archived_participants and archived_player_selections
*/

-- Add DELETE policies for archived_competitions
CREATE POLICY "Users can delete their archived competitions"
  ON archived_competitions
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Add DELETE policies for archived_participants
CREATE POLICY "Users can delete archived participants"
  ON archived_participants
  FOR DELETE
  TO authenticated
  USING (
    archived_competition_id IN (
      SELECT id FROM archived_competitions 
      WHERE created_by = auth.uid()
    )
  );

-- Add DELETE policies for archived_player_selections
CREATE POLICY "Users can delete archived player selections"
  ON archived_player_selections
  FOR DELETE
  TO authenticated
  USING (
    archived_participant_id IN (
      SELECT ap.id 
      FROM archived_participants ap
      JOIN archived_competitions ac ON ac.id = ap.archived_competition_id
      WHERE ac.created_by = auth.uid()
    )
  );