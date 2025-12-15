/*
  # LinguaLeap Database Schema

  ## Overview
  Creates the complete database structure for LinguaLeap, an AI-powered language learning platform
  that connects university students for conversation practice with ELO-based matching.

  ## New Tables

  ### `profiles`
  - `id` (uuid, FK to auth.users) - User identifier
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `university` (text) - University affiliation
  - `target_language` (text) - Language being learned
  - `native_language` (text) - User's native language
  - `elo_rating` (integer) - Skill rating for matching (default 1200)
  - `total_conversations` (integer) - Count of completed conversations
  - `avatar_url` (text, nullable) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp

  ### `conversation_schedules`
  - `id` (uuid, PK) - Schedule identifier
  - `user_id` (uuid, FK) - User who created the schedule
  - `scheduled_time` (timestamptz) - Proposed conversation time
  - `status` (text) - pending/matched/completed/cancelled
  - `created_at` (timestamptz) - Schedule creation timestamp

  ### `matches`
  - `id` (uuid, PK) - Match identifier
  - `schedule_id` (uuid, FK) - Associated schedule
  - `user1_id` (uuid, FK) - First participant
  - `user2_id` (uuid, FK) - Second participant
  - `conversation_topic` (text) - Assigned discussion topic
  - `suggested_keywords` (jsonb) - Array of vocabulary suggestions
  - `status` (text) - matched/in_progress/completed
  - `started_at` (timestamptz, nullable) - Conversation start time
  - `completed_at` (timestamptz, nullable) - Conversation end time
  - `created_at` (timestamptz) - Match creation timestamp

  ### `conversations`
  - `id` (uuid, PK) - Conversation identifier
  - `match_id` (uuid, FK) - Associated match
  - `transcript` (text, nullable) - Full conversation transcript
  - `duration_minutes` (integer) - Length of conversation
  - `accuracy_percentage` (integer) - Overall transcription accuracy
  - `created_at` (timestamptz) - Conversation timestamp

  ### `feedback`
  - `id` (uuid, PK) - Feedback identifier
  - `conversation_id` (uuid, FK) - Associated conversation
  - `user_id` (uuid, FK) - Feedback recipient
  - `vocabulary_mastery` (integer) - Score 0-100
  - `pronunciation_score` (integer) - Score 0-100
  - `fluency_score` (integer) - Score 0-100
  - `improvement_notes` (text) - Personalized suggestions
  - `highlighted_errors` (jsonb) - Array of error corrections
  - `vocab_used` (jsonb) - Array of vocabulary successfully used
  - `created_at` (timestamptz) - Feedback generation timestamp

  ## Security
  - Enable RLS on all tables
  - Users can read/update their own profile
  - Users can create schedules and view their own schedules
  - Users can view matches they're part of
  - Users can view conversations and feedback for their matches
  - Authenticated users required for all operations

  ## Notes
  - ELO rating starts at 1200 (standard chess rating baseline)
  - Conversation topics and keywords stored as JSONB for flexibility
  - All timestamps use timestamptz for proper timezone handling
  - Status fields use text with check constraints for data integrity
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  university text NOT NULL,
  target_language text NOT NULL DEFAULT 'English',
  native_language text NOT NULL,
  elo_rating integer NOT NULL DEFAULT 1200,
  total_conversations integer NOT NULL DEFAULT 0,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create conversation_schedules table
CREATE TABLE IF NOT EXISTS conversation_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversation_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedules"
  ON conversation_schedules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create schedules"
  ON conversation_schedules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules"
  ON conversation_schedules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES conversation_schedules(id) ON DELETE CASCADE,
  user1_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_topic text NOT NULL,
  suggested_keywords jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'matched' CHECK (status IN ('matched', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id)
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  transcript text,
  duration_minutes integer NOT NULL DEFAULT 0,
  accuracy_percentage integer NOT NULL DEFAULT 0 CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations for their matches"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = conversations.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vocabulary_mastery integer NOT NULL DEFAULT 0 CHECK (vocabulary_mastery >= 0 AND vocabulary_mastery <= 100),
  pronunciation_score integer NOT NULL DEFAULT 0 CHECK (pronunciation_score >= 0 AND pronunciation_score <= 100),
  fluency_score integer NOT NULL DEFAULT 0 CHECK (fluency_score >= 0 AND fluency_score <= 100),
  improvement_notes text NOT NULL,
  highlighted_errors jsonb DEFAULT '[]'::jsonb,
  vocab_used jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON conversation_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_time ON conversation_schedules(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_schedule ON matches(schedule_id);
CREATE INDEX IF NOT EXISTS idx_conversations_match ON conversations(match_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_conversation ON feedback(conversation_id);