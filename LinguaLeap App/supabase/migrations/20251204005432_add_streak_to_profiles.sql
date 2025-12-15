/*
  # Add Streak Tracking to Profiles

  ## Overview
  Adds streak tracking functionality to user profiles to gamify the learning experience
  and encourage daily practice.

  ## New Fields
  - `current_streak` (integer) - Number of consecutive days with conversations (default 3)
  - `longest_streak` (integer) - Highest streak ever achieved (default 3)
  - `last_conversation_date` (date) - Date of most recent conversation for streak calculation

  ## Purpose
  - Track user engagement through daily conversation streaks
  - Motivate consistent practice with visible progress metrics
  - Display achievements in user profile

  ## Notes
  - Streak resets if user misses a day
  - Longest streak persists as a personal best record
  - Default value of 3 provides immediate positive reinforcement for new users
*/

DO $$ 
BEGIN
  -- Add current_streak field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'current_streak'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_streak integer DEFAULT 3 CHECK (current_streak >= 0);
    COMMENT ON COLUMN profiles.current_streak IS 'Number of consecutive days with conversations';
  END IF;

  -- Add longest_streak field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'longest_streak'
  ) THEN
    ALTER TABLE profiles ADD COLUMN longest_streak integer DEFAULT 3 CHECK (longest_streak >= 0);
    COMMENT ON COLUMN profiles.longest_streak IS 'Highest streak ever achieved';
  END IF;

  -- Add last_conversation_date field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_conversation_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_conversation_date date DEFAULT CURRENT_DATE;
    COMMENT ON COLUMN profiles.last_conversation_date IS 'Date of most recent conversation for streak calculation';
  END IF;
END $$;
