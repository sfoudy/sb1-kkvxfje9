/*
  # Add cascading deletes for participants

  1. Changes
    - Add ON DELETE CASCADE to player_selections foreign key
    - Add ON DELETE CASCADE to participants foreign key

  2. Security
    - No changes to RLS policies
*/

-- First drop the existing foreign key constraints
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