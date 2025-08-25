/*
  # Create confessions table for public sharing

  1. New Tables
    - `confessions`
      - `id` (uuid, primary key)
      - `name` (text, user's name or handle)
      - `confession` (text, the confession content)
      - `severity` (text, severity level)
      - `mode` (text, heaven or hell mode)
      - `likes` (integer, number of likes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `confessions` table
    - Add policy for anyone to read confessions
    - Add policy for anyone to insert confessions
    - Add policy for anyone to update likes
*/

CREATE TABLE IF NOT EXISTS confessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  confession text NOT NULL,
  severity text NOT NULL DEFAULT 'Minor',
  mode text NOT NULL DEFAULT 'heaven',
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all confessions (public gallery)
CREATE POLICY "Anyone can read confessions"
  ON confessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert new confessions
CREATE POLICY "Anyone can create confessions"
  ON confessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to update likes on confessions
CREATE POLICY "Anyone can update likes"
  ON confessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for better performance on created_at ordering
CREATE INDEX IF NOT EXISTS confessions_created_at_idx ON confessions(created_at DESC);

-- Create index for better performance on likes ordering
CREATE INDEX IF NOT EXISTS confessions_likes_idx ON confessions(likes DESC);