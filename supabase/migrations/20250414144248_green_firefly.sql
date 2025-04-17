/*
  # Fix infinite recursion in RLS policies

  1. Changes
    - Drop existing policies that may cause recursion
    - Create simplified policies with clear, non-recursive conditions
    - Ensure proper separation between different access levels
    
  2. Security
    - Maintain existing security model while eliminating recursion
    - Keep public read access for competitions
    - Preserve owner and collaborator access patterns
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "View competitions" ON competitions;
DROP POLICY IF EXISTS "Create competitions" ON competitions;
DROP POLICY IF EXISTS "Manage own competitions" ON competitions;
DROP POLICY IF EXISTS "View as collaborator" ON competitions;

-- Create new, simplified policies
CREATE POLICY "Public view access"
ON competitions FOR SELECT
TO public
USING (true);

CREATE POLICY "Owner full access"
ON competitions FOR ALL
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Collaborator view access"
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