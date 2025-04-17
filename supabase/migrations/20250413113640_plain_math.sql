/*
  # Fix participants table RLS policies

  1. Changes
    - Replace recursive participants policy with a simplified version
    - Policy now directly checks if user created the competition or is a participant
  
  2. Security
    - Maintains data access control while avoiding recursion
    - Users can still only view participants in competitions they own or participate in
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view participants in their competitions" ON participants;

-- Create new simplified policy
CREATE POLICY "Users can view participants in their competitions"
ON participants
FOR SELECT
TO authenticated
USING (
  competition_id IN (
    -- User is the competition creator
    SELECT id FROM competitions WHERE created_by = auth.uid()
    UNION
    -- User is a participant in the competition
    SELECT competition_id FROM participants WHERE user_id = auth.uid()
  )
);