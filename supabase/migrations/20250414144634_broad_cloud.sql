/*
  # Update sharing policies

  1. Changes
    - Drop existing policies
    - Recreate policies to allow public viewing of competitions and related data
    - Maintain write restrictions to owners only
    
  2. Security
    - Anyone can view competitions and their data
    - Only owners can modify competitions and related data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view competitions" ON competitions;
DROP POLICY IF EXISTS "Owners can manage competitions" ON competitions;
DROP POLICY IF EXISTS "Anyone can view participants" ON participants;
DROP POLICY IF EXISTS "Owners can manage participants" ON participants;
DROP POLICY IF EXISTS "Anyone can view player selections" ON player_selections;
DROP POLICY IF EXISTS "Owners can manage player selections" ON player_selections;

-- Update competition policies
CREATE POLICY "Anyone can view competitions"
ON competitions FOR SELECT
TO public
USING (true);

CREATE POLICY "Owners can manage competitions"
ON competitions FOR ALL
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Update participant policies
CREATE POLICY "Anyone can view participants"
ON participants FOR SELECT
TO public
USING (true);

CREATE POLICY "Owners can manage participants"
ON participants FOR ALL
TO authenticated
USING (
  competition_id IN (
    SELECT id FROM competitions
    WHERE created_by = auth.uid()
  )
);

-- Update player selections policies
CREATE POLICY "Anyone can view player selections"
ON player_selections FOR SELECT
TO public
USING (true);

CREATE POLICY "Owners can manage player selections"
ON player_selections FOR ALL
TO authenticated
USING (
  participant_id IN (
    SELECT p.id
    FROM participants p
    JOIN competitions c ON c.id = p.competition_id
    WHERE c.created_by = auth.uid()
  )
);