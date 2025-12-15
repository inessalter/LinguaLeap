import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  university: string;
  target_language: string;
  native_language: string;
  elo_rating: number;
  total_conversations: number;
  avatar_url?: string;
  current_streak: number;
  longest_streak: number;
  last_conversation_date: string;
  created_at: string;
};

export type ConversationSchedule = {
  id: string;
  user_id: string;
  scheduled_time: string;
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  created_at: string;
};

export type Match = {
  id: string;
  schedule_id: string;
  user1_id: string;
  user2_id: string;
  conversation_topic: string;
  suggested_keywords: string[];
  status: 'matched' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  match_id: string;
  transcript?: string;
  duration_minutes: number;
  accuracy_percentage: number;
  created_at: string;
};

export type GrammarError = {
  text: string;
  correction: string;
  explanation: string;
  category: string;
};

export type VocabularyMistake = {
  word: string;
  context: string;
  correction: string;
  definition: string;
};

export type PronunciationIssue = {
  word: string;
  issue: string;
  guidance: string;
  phonetic: string;
};

export type RecommendedKeyword = {
  word: string;
  definition: string;
  example_usage: string;
};

export type Feedback = {
  id: string;
  conversation_id: string;
  user_id: string;
  vocabulary_mastery: number;
  pronunciation_score: number;
  fluency_score: number;
  tone_score?: number;
  improvement_notes: string;
  highlighted_errors: Array<{ text: string; correction: string; timestamp: string }>;
  vocab_used: Array<{ word: string; context: string }>;
  grammar_errors: GrammarError[];
  vocabulary_mistakes: VocabularyMistake[];
  pronunciation_issues: PronunciationIssue[];
  recommended_keywords: RecommendedKeyword[];
  improvement_score: number;
  overall_rating: number;
  created_at: string;
};
