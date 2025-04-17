/*
  # Fix competitions RLS policies

  1. Changes
    - Drop existing RLS policies on competitions table
    - Create new, simplified policies without recursion
  
  2. Security
    - Enable RLS on competitions table
    - Add policies for:
      - Public read access to all competitions
      - Authenticated users can create competitions
      - Competition owners can delete their competitions
      - Competition owners and collaborators can view their competitions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view competitions" ON competitions;
DROP POLICY IF EXISTS "Owners and admins can delete competitions" ON competitions;
DROP POLICY IF EXISTS "Users can create competitions" ON competitions;
DROP POLICY IF EXISTS "Users can view their competitions" ON competitions;

-- Create new policies without recursion
CREATE POLICY "Anyone can view competitions"
ON competitions FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create competitions"
ON competitions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Competition owners can delete"
ON competitions FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Competition owners and collaborators can view"
ON competitions FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by 
  OR 
  id IN (
    SELECT competition_id 
    FROM competition_collaborators 
    WHERE user_id = auth.uid()
  )
);