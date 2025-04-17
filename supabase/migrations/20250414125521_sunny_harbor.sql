/*
  # Add competition archiving tables

  1. New Tables
    - `archived_competitions`
      - `id` (uuid, primary key)
      - `original_id` (uuid, reference to original competition)
      - `title` (text)
      - `major_type` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `created_by` (uuid)
      - `archived_at` (timestamptz)
    
    - `archived_participants`
      - `id` (uuid, primary key)
      - `archived_competition_id` (uuid)
      - `original_id` (uuid)
      - `username` (text)
      - `final_score` (integer)
      - `final_position` (integer)
      
    - `archived_player_selections`
      - `id` (uuid, primary key)
      - `archived_participant_id` (uuid)
      - `player_name` (text)
      - `final_score` (integer)
      - `missed_cut` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for viewing archived competitions
*/

-- Create archived competitions table
CREATE TABLE IF NOT EXISTS archived_competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id uuid REFERENCES competitions(id),
  title text NOT NULL,
  major_type text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  archived_at timestamptz DEFAULT now(),
  CONSTRAINT valid_major_type CHECK (major_type = ANY (ARRAY['masters'::text, 'pga'::text, 'us_open'::text, 'the_open'::text]))
);

-- Create archived participants table
CREATE TABLE IF NOT EXISTS archived_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  archived_competition_id uuid REFERENCES archived_competitions(id) ON DELETE CASCADE,
  original_id uuid REFERENCES participants(id),
  username text NOT NULL,
  final_score integer NOT NULL,
  final_position integer NOT NULL
);

-- Create archived player selections table
CREATE TABLE IF NOT EXISTS archived_player_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  archived_participant_id uuid REFERENCES archived_participants(id) ON DELETE CASCADE,
  player_name text NOT NULL,
  final_score integer NOT NULL,
  missed_cut boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE archived_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_player_selections ENABLE ROW LEVEL SECURITY;

-- Policies for archived_competitions
CREATE POLICY "Users can view their archived competitions"
  ON archived_competitions
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Policies for archived_participants
CREATE POLICY "Users can view archived participants"
  ON archived_participants
  FOR SELECT
  TO authenticated
  USING (
    archived_competition_id IN (
      SELECT id FROM archived_competitions 
      WHERE created_by = auth.uid()
    )
  );

-- Policies for archived_player_selections
CREATE POLICY "Users can view archived player selections"
  ON archived_player_selections
  FOR SELECT
  TO authenticated
  USING (
    archived_participant_id IN (
      SELECT ap.id 
      FROM archived_participants ap
      JOIN archived_competitions ac ON ac.id = ap.archived_competition_id
      WHERE ac.created_by = auth.uid()
    )
  );