/*
  # Golf Sweepstakes Initial Schema

  1. New Tables
    - competitions
      - id (uuid, primary key)
      - title (text)
      - major_type (text)
      - created_by (uuid, references auth.users)
      - access_code (text)
      - start_date (timestamptz)
      - end_date (timestamptz)
      - created_at (timestamptz)
      
    - participants
      - id (uuid, primary key)
      - competition_id (uuid, references competitions)
      - user_id (uuid, references auth.users)
      - username (text)
      - total_score (integer)
      - penalty_score (integer)
      - created_at (timestamptz)
      
    - player_selections
      - id (uuid, primary key)
      - participant_id (uuid, references participants)
      - player_name (text)
      - current_score (integer)
      - missed_cut (boolean)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create competitions table
CREATE TABLE competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  major_type text NOT NULL,
  created_by uuid REFERENCES auth.users NOT NULL,
  access_code text UNIQUE NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_major_type CHECK (major_type IN ('masters', 'pga', 'us_open', 'the_open'))
);

-- Create participants table
CREATE TABLE participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES competitions NOT NULL,
  user_id uuid REFERENCES auth.users,
  username text NOT NULL,
  total_score integer DEFAULT 0,
  penalty_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create player_selections table
CREATE TABLE player_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants NOT NULL,
  player_name text NOT NULL,
  current_score integer DEFAULT 0,
  missed_cut boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_selections ENABLE ROW LEVEL SECURITY;

-- Competitions policies
CREATE POLICY "Users can view competitions they created or have access to"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT competition_id 
      FROM participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create competitions"
  ON competitions
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Participants policies
CREATE POLICY "Users can view participants in their competitions"
  ON participants
  FOR SELECT
  TO authenticated
  USING (
    competition_id IN (
      SELECT id 
      FROM competitions 
      WHERE created_by = auth.uid() OR
      id IN (
        SELECT competition_id 
        FROM participants 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create participants"
  ON participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    competition_id IN (
      SELECT id 
      FROM competitions 
      WHERE created_by = auth.uid()
    )
  );

-- Player selections policies
CREATE POLICY "Users can view player selections in their competitions"
  ON player_selections
  FOR SELECT
  TO authenticated
  USING (
    participant_id IN (
      SELECT id 
      FROM participants 
      WHERE competition_id IN (
        SELECT id 
        FROM competitions 
        WHERE created_by = auth.uid() OR
        id IN (
          SELECT competition_id 
          FROM participants 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create player selections"
  ON player_selections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    participant_id IN (
      SELECT id 
      FROM participants 
      WHERE competition_id IN (
        SELECT id 
        FROM competitions 
        WHERE created_by = auth.uid()
      )
    )
  );