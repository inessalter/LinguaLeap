/*
  # Add Comprehensive Feedback Fields

  ## Overview
  Enhances the feedback table to support detailed mistake categorization and improvement tracking
  for the automatic feedback system that displays after every conversation.

  ## New Fields

  ### Mistake Categories
  - `grammar_errors` (jsonb) - Array of grammar mistakes with corrections
    Structure: [{ text, correction, explanation, category }]
  
  - `vocabulary_mistakes` (jsonb) - Array of vocabulary errors with suggestions
    Structure: [{ word, context, correction, definition }]
  
  - `pronunciation_issues` (jsonb) - Array of pronunciation problems
    Structure: [{ word, issue, guidance, phonetic }]

  ### Learning Enhancement
  - `recommended_keywords` (jsonb) - Array of suggested vocabulary for future practice
    Structure: [{ word, definition, example_usage }]
  
  - `improvement_score` (integer) - Percentage improvement compared to previous sessions (0-100)
  - `overall_rating` (integer) - Overall conversation performance rating (1-10, default 10)

  ## Purpose
  - Enable comprehensive mistake tracking across grammar, vocabulary, and pronunciation
  - Provide actionable recommendations for improvement
  - Track user progress over time with improvement scores
  - Support the always-visible feedback page with rich, categorized data
  - Allow default/placeholder values when actual analysis isn't available

  ## Notes
  - All JSONB fields default to empty arrays for clean initialization
  - Overall rating defaults to 10 to create positive reinforcement
  - Fields support both AI-generated and placeholder/default content
*/

DO $$ 
BEGIN
  -- Add grammar_errors field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feedback' AND column_name = 'grammar_errors'
  ) THEN
    ALTER TABLE feedback ADD COLUMN grammar_errors jsonb DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN feedback.grammar_errors IS 'Array of grammar mistakes with corrections and explanations';
  END IF;

  -- Add vocabulary_mistakes field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feedback' AND column_name = 'vocabulary_mistakes'
  ) THEN
    ALTER TABLE feedback ADD COLUMN vocabulary_mistakes jsonb DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN feedback.vocabulary_mistakes IS 'Array of vocabulary errors with definitions and corrections';
  END IF;

  -- Add pronunciation_issues field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feedback' AND column_name = 'pronunciation_issues'
  ) THEN
    ALTER TABLE feedback ADD COLUMN pronunciation_issues jsonb DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN feedback.pronunciation_issues IS 'Array of pronunciation problems with guidance';
  END IF;

  -- Add recommended_keywords field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feedback' AND column_name = 'recommended_keywords'
  ) THEN
    ALTER TABLE feedback ADD COLUMN recommended_keywords jsonb DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN feedback.recommended_keywords IS 'Array of suggested vocabulary for future practice';
  END IF;

  -- Add improvement_score field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feedback' AND column_name = 'improvement_score'
  ) THEN
    ALTER TABLE feedback ADD COLUMN improvement_score integer DEFAULT 0 CHECK (improvement_score >= -100 AND improvement_score <= 100);
    COMMENT ON COLUMN feedback.improvement_score IS 'Percentage improvement compared to previous sessions (-100 to 100)';
  END IF;

  -- Add overall_rating field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feedback' AND column_name = 'overall_rating'
  ) THEN
    ALTER TABLE feedback ADD COLUMN overall_rating integer DEFAULT 10 CHECK (overall_rating >= 1 AND overall_rating <= 10);
    COMMENT ON COLUMN feedback.overall_rating IS 'Overall conversation performance rating (1-10)';
  END IF;
END $$;
