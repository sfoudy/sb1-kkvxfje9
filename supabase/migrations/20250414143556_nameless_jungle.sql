/*
  # Add competition collaboration features
  
  1. New Tables
    - `competition_collaborators`
      - `id` (uuid, primary key)
      - `competition_id` (uuid, references competitions)
      - `user_id` (uuid, references auth.users)
      - `role` (text, either 'admin' or 'editor')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on new table
    - Add policies for collaboration access
    - Update existing policies to include collaborator access

  3. Changes
    - Add collaborator-aware policies to competitions table
    - Add collaborator-aware policies to participants table
    - Add collaborator-aware policies to player_selections table
*/

-- Create competition_collaborators table
CREATE TABLE IF NOT EXISTS competition_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES competitions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'editor')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(competition_id, user_id)
);

-- Enable RLS
ALTER TABLE competition_collaborators ENABLE ROW LEVEL SECURITY;

-- Policies for competition_collaborators
CREATE POLICY "Users can view their collaboration records"
  ON competition_collaborators
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Competition owners can manage collaborators"
  ON competition_collaborators
  FOR ALL
  TO authenticated
  USING (
    competition_id IN (
      SELECT id FROM competitions WHERE created_by = auth.uid()
    )
  );

-- Update competitions policies
DROP POLICY IF EXISTS "Users can delete their own competitions" ON competitions;
DROP POLICY IF EXISTS "Users can view competitions they created or have access to" ON competitions;

CREATE POLICY "Users can delete competitions they own or admin"
  ON competitions
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT competition_id 
      FROM competition_collaborators 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view competitions they created or collaborate on"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT competition_id 
      FROM competition_collaborators 
      WHERE user_id = auth.uid()
    )
  );

-- Update participants policies
DROP POLICY IF EXISTS "Users can create participants" ON participants;
DROP POLICY IF EXISTS "Users can delete participants in their competitions" ON participants;

CREATE POLICY "Users can manage participants"
  ON participants
  FOR ALL
  TO authenticated
  USING (
    competition_id IN (
      SELECT id FROM competitions WHERE created_by = auth.uid()
      UNION
      SELECT competition_id FROM competition_collaborators 
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Update player_selections policies
DROP POLICY IF EXISTS "Users can create player selections" ON player_selections;
DROP POLICY IF EXISTS "Users can delete player selections in their competitions" ON player_selections;

CREATE POLICY "Users can manage player selections"
  ON player_selections
  FOR ALL
  TO authenticated
  USING (
    participant_id IN (
      SELECT p.id
      FROM participants p
      LEFT JOIN competitions c ON c.id = p.competition_id
      LEFT JOIN competition_collaborators cc ON cc.competition_id = c.id
      WHERE c.created_by = auth.uid() OR (cc.user_id = auth.uid() AND cc.role IN ('admin', 'editor'))
    )
  );