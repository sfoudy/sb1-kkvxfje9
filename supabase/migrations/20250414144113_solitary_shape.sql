/*
  # Fix competition RLS policies

  1. Changes
    - Drop all existing policies on competitions table
    - Create new, simplified policies without recursion
    - Maintain same security model but with optimized implementation
  
  2. Security
    - Public read access for all competitions
    - Owners can manage their competitions
    - Collaborators can view competitions they're part of
    - Users can create new competitions
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view competitions" ON competitions;
DROP POLICY IF EXISTS "Collaborators can view competitions" ON competitions;
DROP POLICY IF EXISTS "Competition owners can manage" ON competitions;
DROP POLICY IF EXISTS "Users can create competitions" ON competitions;

-- Create new, simplified policies
CREATE POLICY "View competitions"
ON competitions FOR SELECT
TO public
USING (true);

CREATE POLICY "Create competitions"
ON competitions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Manage own competitions"
ON competitions FOR ALL
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "View as collaborator"
ON competitions FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT competition_id 
    FROM competition_collaborators 
    WHERE user_id = auth.uid()
  )
);