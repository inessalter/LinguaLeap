/*
  # Remove Auth Constraint and Add Demo Partner

  ## Overview
  Removes the foreign key constraint from profiles to auth.users
  since we're using mock authentication. Then creates the demo partner profile.

  ## Changes
  1. Drop the foreign key constraint from profiles to auth.users
  2. Create demo partner profile for partner practice mode

  ## Security Notes
  - This is appropriate for a demo/prototype application
  - In production, you would keep the auth.users constraint
*/

-- Drop the foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Insert demo partner profile
INSERT INTO profiles (id, email, full_name, university, target_language, native_language, elo_rating, total_conversations)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo.partner@lingualeap.demo',
  'Alex Chen',
  'University of California, Berkeley',
  'English',
  'Mandarin',
  1250,
  47
)
ON CONFLICT (email) DO NOTHING;