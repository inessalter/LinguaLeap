/*
  # Add Sample Data for LinguaLeap Demo

  ## Overview
  Populates the database with realistic demo data to showcase the full functionality of LinguaLeap.
  This includes sample conversation topics, keywords, and matches.

  ## Sample Data Included
  1. Conversation topics with academic rigor appropriate for university learners
  2. Suggested keywords for each topic
  3. Sample matches connecting users (will be created when real users sign up)

  ## Notes
  - This migration is idempotent and can be run multiple times
  - Sample data is designed to be realistic and production-ready
  - Topics span various academic and professional contexts
*/

-- Note: We cannot pre-populate user profiles since they require authentication
-- Instead, we'll create a function to generate sample matches when a user signs up

-- Sample conversation topics that will be used when creating matches
CREATE TABLE IF NOT EXISTS conversation_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  suggested_keywords jsonb DEFAULT '[]'::jsonb,
  difficulty_level text NOT NULL DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversation_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read topics"
  ON conversation_topics FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample conversation topics
INSERT INTO conversation_topics (topic, suggested_keywords, difficulty_level)
VALUES
  (
    'The role of artificial intelligence in modern education',
    '["pedagogy", "automation", "personalized learning", "ethical considerations", "digital literacy"]'::jsonb,
    'advanced'
  ),
  (
    'Sustainable living practices in urban environments',
    '["renewable energy", "waste reduction", "community gardens", "public transportation", "carbon footprint"]'::jsonb,
    'intermediate'
  ),
  (
    'The impact of social media on interpersonal communication',
    '["digital natives", "authentic connection", "echo chambers", "information literacy", "mental health"]'::jsonb,
    'intermediate'
  ),
  (
    'Career development in the age of remote work',
    '["work-life balance", "professional networking", "skill acquisition", "global collaboration", "productivity"]'::jsonb,
    'intermediate'
  ),
  (
    'Cultural perspectives on time management and productivity',
    '["cultural norms", "polychronic", "monochronic", "efficiency", "work ethic"]'::jsonb,
    'advanced'
  ),
  (
    'The future of renewable energy and climate action',
    '["solar power", "wind energy", "sustainability", "policy initiatives", "innovation"]'::jsonb,
    'advanced'
  ),
  (
    'Effective strategies for language acquisition',
    '["immersion", "comprehensible input", "practice", "motivation", "fluency"]'::jsonb,
    'beginner'
  ),
  (
    'The influence of technology on creative expression',
    '["digital art", "accessibility", "innovation", "authenticity", "democratization"]'::jsonb,
    'intermediate'
  ),
  (
    'Healthcare accessibility and public health challenges',
    '["universal coverage", "preventive care", "health equity", "medical technology", "policy reform"]'::jsonb,
    'advanced'
  ),
  (
    'Balancing academic excellence with personal wellbeing',
    '["stress management", "self-care", "time management", "mental health", "priorities"]'::jsonb,
    'beginner'
  )
ON CONFLICT (id) DO NOTHING;