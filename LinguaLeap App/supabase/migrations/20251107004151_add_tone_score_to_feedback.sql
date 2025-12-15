/*
  # Add Tone Score to Feedback

  1. Changes
    - Add `tone_score` column to `feedback` table to track conversational tone quality
    - Column stores integer value (0-100) representing how natural and engaging the user's tone was
    - Defaults to NULL for existing records
  
  2. Purpose
    - Enable AI feedback to evaluate not just fluency and vocabulary, but also conversational tone
    - Provides users with comprehensive feedback on their speaking style
    - Supports the new AI Feedback screen that displays fluency, vocabulary, and tone metrics
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feedback' AND column_name = 'tone_score'
  ) THEN
    ALTER TABLE feedback ADD COLUMN tone_score integer;
    COMMENT ON COLUMN feedback.tone_score IS 'Conversational tone quality score (0-100)';
  END IF;
END $$;
