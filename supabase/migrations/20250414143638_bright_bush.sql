/*
  # Fix competitions RLS policies

  1. Changes
    - Remove recursive RLS policies on competitions table
    - Add simplified policies for better access control
  
  2. Security
    - Enable RLS on competitions table
    - Add policies for:
      - Public read access to all competitions
      - Authenticated users can create competitions
      - Owners and admin collaborators can delete competitions
      - Owners and collaborators can view their competitions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view competitions" ON competitions;
DROP POLICY IF EXISTS "Users can create competitions" ON competitions;
DROP POLICY IF EXISTS "Users can delete competitions they own or admin" ON competitions;
DROP POLICY IF EXISTS "Users can view competitions they created or collaborate on" ON competitions;

-- Create new, simplified policies
CREATE POLICY "Anyone can view competitions"
ON competitions FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create competitions"
ON competitions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners and admins can delete competitions"
ON competitions FOR DELETE
TO authenticated
USING (
  created_by = auth.uid() OR 
  id IN (
    SELECT competition_id 
    FROM competition_collaborators 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Users can view their competitions"
ON competitions FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() OR 
  id IN (
    SELECT competition_id 
    FROM competition_collaborators 
    WHERE user_id = auth.uid()
  )
);