/*
  # Add INSERT policy for archived competitions

  1. Security Changes
    - Add INSERT policy for archived_competitions table to allow users to archive their own competitions
    - Policy ensures users can only archive competitions they created
*/

CREATE POLICY "Users can archive their competitions"
  ON archived_competitions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow insert if the user is archiving their own competition
    created_by = auth.uid()
  );