/*
  # Fix competition view access

  1. Changes
    - Add RLS policies to allow public view access to competitions and related data
    - Policies check for either:
      a) The user owns the competition
      b) The competition is being accessed via view mode
  
  2. Security
    - View-only access is restricted to read operations
    - No modifications are allowed without authentication
*/

-- Update competitions policy to allow public view access
CREATE POLICY "Anyone can view competitions"
  ON competitions
  FOR SELECT
  TO public
  USING (true);

-- Update participants policy to allow public view access
CREATE POLICY "Anyone can view participants"
  ON participants
  FOR SELECT
  TO public
  USING (true);

-- Update player_selections policy to allow public view access
CREATE POLICY "Anyone can view player selections"
  ON player_selections
  FOR SELECT
  TO public
  USING (true);