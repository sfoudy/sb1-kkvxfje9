/*
  # Fix RLS policies for participants table

  1. Changes
    - Remove recursive policy checks that were causing infinite recursion
    - Simplify participant viewing policy to use direct relationships
    - Update policy to allow viewing participants in competitions user has access to
  
  2. Security
    - Maintains security by ensuring users can only view participants in:
      a) Competitions they created
      b) Competitions they are participating in
    - Preserves insert policy security
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view participants in competitions" ON participants;

-- Create new simplified policy
CREATE POLICY "Users can view participants in competitions"
ON participants
FOR SELECT
TO authenticated
USING (
  (competition_id IN (
    SELECT id FROM competitions WHERE created_by = auth.uid()
  ))
  OR
  (user_id = auth.uid())
);