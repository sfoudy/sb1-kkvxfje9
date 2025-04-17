/*
  # Remove collaborator functionality and simplify policies

  1. Changes
    - Drop collaborator table and related policies
    - Simplify competition policies to basic ownership model
    - Update participant and player selection policies
    
  2. Security
    - Maintain public read access
    - Restrict write operations to competition owners only
*/

-- Drop collaborator table and all its dependencies
DROP TABLE IF EXISTS competition_collaborators CASCADE;

-- Drop all existing policies
DROP POLICY IF EXISTS "Public view access" ON competitions;
DROP POLICY IF EXISTS "Owner full access" ON competitions;
DROP POLICY IF EXISTS "Collaborator view access" ON competitions;

-- Create simplified policies for competitions
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
DROP POLICY IF EXISTS "Anyone can view participants" ON participants;
DROP POLICY IF EXISTS "Users can manage participants" ON participants;

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
DROP POLICY IF EXISTS "Anyone can view player selections" ON player_selections;
DROP POLICY IF EXISTS "Users can manage player selections" ON player_selections;

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