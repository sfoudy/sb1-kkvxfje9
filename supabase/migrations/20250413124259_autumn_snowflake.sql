/*
  # Fix cascade delete issues

  1. Changes
    - Clean up any orphaned records
    - Ensure cascade deletes are properly configured
    - Add explicit cascade delete policies
  
  2. Security
    - Maintain existing RLS policies
    - Add delete policies for proper authorization
*/

-- First clean up any orphaned records
DELETE FROM player_selections
WHERE participant_id NOT IN (SELECT id FROM participants);

DELETE FROM participants
WHERE competition_id NOT IN (SELECT id FROM competitions);

-- Drop existing foreign key constraints
ALTER TABLE player_selections DROP CONSTRAINT IF EXISTS player_selections_participant_id_fkey;
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_competition_id_fkey;

-- Re-create the foreign key constraints with ON DELETE CASCADE
ALTER TABLE player_selections
  ADD CONSTRAINT player_selections_participant_id_fkey
  FOREIGN KEY (participant_id)
  REFERENCES participants(id)
  ON DELETE CASCADE;

ALTER TABLE participants
  ADD CONSTRAINT participants_competition_id_fkey
  FOREIGN KEY (competition_id)
  REFERENCES competitions(id)
  ON DELETE CASCADE;

-- Add delete policies
CREATE POLICY "Users can delete their own competitions"
  ON competitions
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete participants in their competitions"
  ON participants
  FOR DELETE
  TO authenticated
  USING (competition_id IN (
    SELECT id FROM competitions WHERE created_by = auth.uid()
  ));

CREATE POLICY "Users can delete player selections in their competitions"
  ON player_selections
  FOR DELETE
  TO authenticated
  USING (participant_id IN (
    SELECT p.id FROM participants p
    JOIN competitions c ON c.id = p.competition_id
    WHERE c.created_by = auth.uid()
  ));