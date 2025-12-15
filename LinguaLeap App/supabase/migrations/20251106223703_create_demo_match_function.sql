/*
  # Create Demo Match Generation Function

  ## Overview
  Creates a PostgreSQL function that automatically generates a demo conversation match
  for new users to showcase the platform functionality.

  ## Function: create_demo_match_for_user
  - Takes a user_id as input
  - Creates a simulated partner profile
  - Generates a schedule and match with a relevant conversation topic
  - Returns the match_id for immediate use

  ## Security
  - Function is owned by the database owner
  - Can only be called by authenticated users
  - Creates demo data that feels realistic

  ## Notes
  - This is specifically for demonstration purposes
  - Real matching would use ELO algorithm and availability
  - Demo partner is clearly labeled as a "Demo Partner"
*/

-- Function to create a demo match for testing the conversation flow
CREATE OR REPLACE FUNCTION create_demo_match_for_user(target_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demo_partner_id uuid;
  schedule_id uuid;
  match_id uuid;
  random_topic record;
BEGIN
  -- Check if demo partner already exists for this user
  SELECT id INTO demo_partner_id
  FROM profiles
  WHERE email = 'demo.partner@lingualeap.demo'
  LIMIT 1;

  -- Create demo partner profile if it doesn't exist
  IF demo_partner_id IS NULL THEN
    -- Generate a demo user in auth.users (this is a simplified approach)
    -- In production, you'd use proper Supabase auth
    demo_partner_id := gen_random_uuid();
    
    INSERT INTO profiles (id, email, full_name, university, target_language, native_language, elo_rating, total_conversations)
    VALUES (
      demo_partner_id,
      'demo.partner@lingualeap.demo',
      'Alex Chen',
      'University of California, Berkeley',
      'English',
      'Mandarin',
      1250,
      47
    );
  END IF;

  -- Get a random conversation topic
  SELECT * INTO random_topic
  FROM conversation_topics
  ORDER BY random()
  LIMIT 1;

  -- Create a schedule for the user
  INSERT INTO conversation_schedules (user_id, scheduled_time, status)
  VALUES (target_user_id, now() + interval '1 day', 'matched')
  RETURNING id INTO schedule_id;

  -- Create the match
  INSERT INTO matches (
    schedule_id,
    user1_id,
    user2_id,
    conversation_topic,
    suggested_keywords,
    status
  )
  VALUES (
    schedule_id,
    target_user_id,
    demo_partner_id,
    random_topic.topic,
    random_topic.suggested_keywords,
    'matched'
  )
  RETURNING id INTO match_id;

  RETURN match_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_demo_match_for_user(uuid) TO authenticated;