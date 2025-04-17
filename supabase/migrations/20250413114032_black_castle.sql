/*
  # Simplify competitions table RLS policy

  1. Changes
    - Drop existing SELECT policy on competitions table
    - Create new simplified SELECT policy that allows all authenticated users to view competitions
    
  2. Security
    - Enables all authenticated users to view all competitions
    - Maintains INSERT policy requiring users to be authenticated
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view competitions they created or have access to" ON competitions;

-- Create new simplified policy
CREATE POLICY "Users can view competitions they created or have access to"
ON competitions
FOR SELECT
TO authenticated
USING (TRUE);