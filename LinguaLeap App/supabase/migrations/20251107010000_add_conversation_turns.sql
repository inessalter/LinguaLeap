/*
  # Add Conversation Turns Tracking

  ## Overview
  Creates a table to track individual message exchanges during conversations
  for better analysis and replay functionality.

  ## New Tables

  ### `conversation_turns`
  - `id` (uuid, PK) - Turn identifier
  - `conversation_id` (uuid, FK) - Associated conversation
  - `speaker_name` (text) - Name of the speaker
  - `speaker_type` (text) - 'user' or 'ai' or 'partner'
  - `message_text` (text) - The spoken/transcribed text
  - `audio_duration_ms` (integer) - Duration of audio in milliseconds
  - `turn_number` (integer) - Sequential turn number
  - `created_at` (timestamptz) - When the turn occurred

  ## Security
  - Enable RLS on conversation_turns
  - Users can view turns for their own conversations
  - Users can insert turns during their conversations

  ## Notes
  - Enables detailed conversation analysis
  - Supports replay and review functionality
  - Tracks timing for fluency analysis
*/

-- Create conversation_turns table
CREATE TABLE IF NOT EXISTS conversation_turns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  speaker_name text NOT NULL,
  speaker_type text NOT NULL CHECK (speaker_type IN ('user', 'ai', 'partner')),
  message_text text NOT NULL,
  audio_duration_ms integer DEFAULT 0,
  turn_number integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversation_turns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view turns for their conversations"
  ON conversation_turns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      INNER JOIN matches m ON m.id = c.match_id
      WHERE c.id = conversation_turns.conversation_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create turns for their conversations"
  ON conversation_turns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      INNER JOIN matches m ON m.id = c.match_id
      WHERE c.id = conversation_turns.conversation_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_conversation_turns_conversation ON conversation_turns(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_turns_created ON conversation_turns(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_turns_number ON conversation_turns(conversation_id, turn_number);
