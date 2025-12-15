/*
  # Allow Public Access to All Tables

  ## Overview
  Updates RLS policies on all tables to allow public access for demo purposes.
  Since the app uses mock authentication without real Supabase auth sessions,
  we need to allow anyone to access all tables.

  ## Changes
  1. Drop existing restrictive RLS policies from:
     - conversation_schedules
     - matches
     - solo_practice_sessions
     - conversations
     - feedback
     - conversation_topics
  2. Create new permissive policies that allow public access

  ## Security Notes
  - This is appropriate for a demo/prototype application
  - In production, you would use proper authentication
*/

-- conversation_schedules
DROP POLICY IF EXISTS "Users can create schedules" ON conversation_schedules;
DROP POLICY IF EXISTS "Users can view own schedules" ON conversation_schedules;
DROP POLICY IF EXISTS "Users can update own schedules" ON conversation_schedules;

CREATE POLICY "Allow public insert on conversation_schedules"
  ON conversation_schedules FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public select on conversation_schedules"
  ON conversation_schedules FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public update on conversation_schedules"
  ON conversation_schedules FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- matches
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can view their matches" ON matches;
DROP POLICY IF EXISTS "Users can update their matches" ON matches;

CREATE POLICY "Allow public insert on matches"
  ON matches FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public select on matches"
  ON matches FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public update on matches"
  ON matches FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- solo_practice_sessions
DROP POLICY IF EXISTS "Users can create solo sessions" ON solo_practice_sessions;
DROP POLICY IF EXISTS "Users can view own solo sessions" ON solo_practice_sessions;

CREATE POLICY "Allow public insert on solo_practice_sessions"
  ON solo_practice_sessions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public select on solo_practice_sessions"
  ON solo_practice_sessions FOR SELECT
  TO public
  USING (true);

-- conversations
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;

CREATE POLICY "Allow public insert on conversations"
  ON conversations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public select on conversations"
  ON conversations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public update on conversations"
  ON conversations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Allow anyone to insert feedback" ON feedback;

CREATE POLICY "Allow public insert on feedback"
  ON feedback FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public select on feedback"
  ON feedback FOR SELECT
  TO public
  USING (true);

-- conversation_topics
DROP POLICY IF EXISTS "Anyone can read topics" ON conversation_topics;

CREATE POLICY "Allow public select on conversation_topics"
  ON conversation_topics FOR SELECT
  TO public
  USING (true);