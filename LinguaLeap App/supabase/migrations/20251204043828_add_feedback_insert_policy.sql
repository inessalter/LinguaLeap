/*
  # Add INSERT Policy for Feedback Table

  ## Overview
  Adds the missing INSERT policy to the feedback table, allowing authenticated users
  to create their own feedback records after conversations.

  ## Changes
  - Add INSERT policy for feedback table that allows users to insert feedback for their own conversations
  - Policy checks that the user_id matches the authenticated user's ID

  ## Security
  - Users can only insert feedback records for themselves
  - user_id must match auth.uid()

  ## Purpose
  - Fixes the issue where feedback cannot be saved to the database after conversations
  - Enables the "End Conversation" button to properly save and display feedback
*/

CREATE POLICY "Users can insert own feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
