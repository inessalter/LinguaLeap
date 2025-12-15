/*
  # Allow Public Profile Access

  ## Overview
  Updates RLS policies on profiles table to allow public access for demo purposes.
  Since the app uses mock authentication without real Supabase auth sessions,
  we need to allow anyone to create and read profiles.

  ## Changes
  1. Drop existing restrictive RLS policies
  2. Create new permissive policies that allow:
     - Anyone to insert profiles
     - Anyone to read profiles
     - Anyone to update profiles

  ## Security Notes
  - This is appropriate for a demo/prototype application
  - In production, you would use proper authentication
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create new permissive policies for demo purposes
CREATE POLICY "Allow anyone to insert profiles"
  ON profiles FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow anyone to read profiles"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anyone to update profiles"
  ON profiles FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);