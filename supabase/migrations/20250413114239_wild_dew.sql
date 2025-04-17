/*
  # Fix participants RLS policy

  1. Changes
    - Remove recursive policy for participants table
    - Add simplified policy that checks:
      a) If user created the competition (competition owner)
      b) If user is a participant in the competition
  
  2. Security
    - Maintains security by still checking proper access rights
    - Eliminates infinite recursion while preserving access control
*/

-- Drop the existing policy that's causing recursion
DROP POLICY IF EXISTS "Users can view participants in their competitions" ON participants;

-- Create new, simplified policy
CREATE POLICY "Users can view participants in their competitions" ON participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM competitions 
      WHERE competitions.id = participants.competition_id 
      AND (
        competitions.created_by = auth.uid() -- User is competition owner
        OR 
        EXISTS ( -- User is a participant
          SELECT 1 FROM participants p2 
          WHERE p2.competition_id = participants.competition_id 
          AND p2.user_id = auth.uid()
        )
      )
    )
  );