/*
  # Fix recursive RLS policies for competitions table

  1. Changes
    - Drop existing problematic policies
    - Create new, non-recursive policies for competitions table
  
  2. Security
    - Maintain same security model but with optimized policies
    - Enable RLS (already enabled)
    - Add policies for viewing and managing competitions
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Anyone can view competitions" ON competitions;
DROP POLICY IF EXISTS "Collaborators can view competitions" ON competitions;
DROP POLICY IF EXISTS "Competition owners can manage" ON competitions;
DROP POLICY IF EXISTS "Users can create competitions" ON competitions;

-- Recreate policies without recursion
CREATE POLICY "Anyone can view competitions"
ON competitions FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create competitions"
ON competitions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Competition owners can manage"
ON competitions FOR ALL
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Simplified collaborator policy without recursion
CREATE POLICY "Collaborators can view competitions"
ON competitions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM competition_collaborators
    WHERE competition_collaborators.competition_id = competitions.id
    AND competition_collaborators.user_id = auth.uid()
  )
);