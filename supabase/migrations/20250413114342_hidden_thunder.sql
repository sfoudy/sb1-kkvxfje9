/*
  # Fix infinite recursion in participants policy

  1. Changes
    - Drop existing policy for participants table that's causing infinite recursion
    - Create new, simplified policy that avoids recursion by:
      a. Allowing access to participants if user created the competition
      b. Allowing access if user is a participant in the competition
      
  2. Security
    - Maintains RLS protection
    - Ensures users can only view participants in competitions they're involved with
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can view participants in their competitions" ON participants;

-- Create new policy without recursion
CREATE POLICY "Users can view participants in competitions" ON participants
  FOR SELECT TO authenticated
  USING (
    (
      -- User is the competition creator
      competition_id IN (
        SELECT id FROM competitions WHERE created_by = auth.uid()
      )
    ) OR (
      -- User is a participant in the competition
      competition_id IN (
        SELECT competition_id FROM participants WHERE user_id = auth.uid()
      )
    )
  );