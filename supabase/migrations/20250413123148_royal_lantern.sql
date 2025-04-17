/*
  # Fix cascade deletion for competitions and participants

  This migration ensures that when a competition or participant is deleted,
  all related records are properly removed from the database.

  1. Changes
    - Add ON DELETE CASCADE to foreign key constraints
    - Re-create constraints to ensure proper cascading deletion

  2. Security
    - No changes to RLS policies
    - Existing security remains intact
*/

-- First ensure we have no orphaned records
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