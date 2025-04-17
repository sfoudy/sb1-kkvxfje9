/*
  # Fix competitions table RLS policies

  1. Changes
    - Drop existing RLS policies on competitions table that are causing recursion
    - Create new, simplified RLS policies for competitions table:
      - Public can view competitions
      - Authenticated users can view competitions they own or collaborate on
      - Authenticated users can create competitions
      - Only owners can delete competitions

  2. Security
    - Maintains RLS security while preventing infinite recursion
    - Uses direct column comparisons instead of subqueries where possible
    - Properly handles competition ownership and collaboration access
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Anyone can view competitions" ON competitions;
DROP POLICY IF EXISTS "Competition owners and collaborators can view" ON competitions;
DROP POLICY IF EXISTS "Competition owners can delete" ON competitions;
DROP POLICY IF EXISTS "Users can create competitions" ON competitions;

-- Create new, simplified policies
CREATE POLICY "Anyone can view competitions"
ON competitions FOR SELECT
TO public
USING (true);

CREATE POLICY "Competition owners can manage"
ON competitions FOR ALL
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Collaborators can view competitions"
ON competitions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM competition_collaborators 
    WHERE competition_collaborators.competition_id = id 
    AND competition_collaborators.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create competitions"
ON competitions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);