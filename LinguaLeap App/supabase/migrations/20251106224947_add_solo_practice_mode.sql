/*
  # Add Solo Practice Mode Support

  ## Overview
  Extends the schema to support solo practice sessions with ChatGPT voice integration
  alongside the existing partner matching system.

  ## Changes
  1. Add conversation_mode column to matches table (partner/solo)
  2. Create solo_practice_sessions table for AI conversations
  3. Update matches table to support optional partner (for solo mode)

  ## New Fields
  - matches.conversation_mode: 'partner' or 'solo'
  - matches.user2_id: Now nullable for solo practice
  - solo_practice_sessions: Dedicated table for AI conversation metadata

  ## Security
  - Users can only access their own solo practice sessions
  - RLS policies updated to support both modes
*/

-- Add conversation_mode to matches table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'conversation_mode'
  ) THEN
    ALTER TABLE matches ADD COLUMN conversation_mode text NOT NULL DEFAULT 'partner' CHECK (conversation_mode IN ('partner', 'solo'));
  END IF;
END $$;

-- Make user2_id nullable for solo practice
DO $$
BEGIN
  ALTER TABLE matches ALTER COLUMN user2_id DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create solo_practice_sessions table
CREATE TABLE IF NOT EXISTS solo_practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ai_persona text NOT NULL DEFAULT 'conversational',
  voice_model text NOT NULL DEFAULT 'alloy',
  total_turns integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE solo_practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own solo sessions"
  ON solo_practice_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create solo sessions"
  ON solo_practice_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_solo_sessions_user ON solo_practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_solo_sessions_match ON solo_practice_sessions(match_id);

-- Update matches RLS to support solo mode
DROP POLICY IF EXISTS "Users can view their matches" ON matches;
CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user1_id 
    OR auth.uid() = user2_id 
    OR (conversation_mode = 'solo' AND auth.uid() = user1_id)
  );

DROP POLICY IF EXISTS "Users can update their matches" ON matches;
CREATE POLICY "Users can update their matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user1_id 
    OR auth.uid() = user2_id 
    OR (conversation_mode = 'solo' AND auth.uid() = user1_id)
  )
  WITH CHECK (
    auth.uid() = user1_id 
    OR auth.uid() = user2_id 
    OR (conversation_mode = 'solo' AND auth.uid() = user1_id)
  );

-- Allow inserting matches for solo practice
CREATE POLICY "Users can create matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user1_id);