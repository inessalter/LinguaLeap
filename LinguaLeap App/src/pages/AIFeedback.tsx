import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, MessageCircle, Mic, CheckCircle, Calendar, Trophy, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Feedback as FeedbackType } from '../lib/supabase';
import { generateDefaultFeedback, calculateImprovementScore, getPreviousAverageScore } from '../lib/feedbackGenerator';
import ConversationSummary from '../components/ConversationSummary';
import {
  GrammarErrorCard,
  VocabularyMistakeCard,
  PronunciationIssueCard,
  KeywordHighlight,
  RecommendedKeywordsCard,
} from '../components/FeedbackCards';

type AIFeedbackProps = {
  conversationId: string;
  onStartAnother: () => void;
  onBackToDashboard: () => void;
};

type FeedbackMetric = {
  label: string;
  score: number;
  comment: string;
  icon: React.ReactNode;
  color: string;
};

type ConversationTurn = {
  id: string;
  speaker_name: string;
  speaker_type: string;
  message_text: string;
  turn_number: number;
  created_at: string;
};

export default function AIFeedback({ conversationId, onStartAnother, onBackToDashboard }: AIFeedbackProps) {
  const { profile } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScores, setShowScores] = useState(false);
  const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([]);
  const [conversationDuration, setConversationDuration] = useState(0);
  const [conversationTopic, setConversationTopic] = useState('');

  useEffect(() => {
    loadFeedbackData();
  }, [conversationId, profile]);

  async function loadFeedbackData() {
    if (!profile) return;

    let { data: existingFeedback } = await supabase
      .from('feedback')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', profile.id)
      .maybeSingle();

    const { data: conversationData } = await supabase
      .from('conversations')
      .select('transcript, duration_minutes, match_id')
      .eq('id', conversationId)
      .maybeSingle();

    if (!conversationData) {
      setLoading(false);
      return;
    }

    setConversationDuration(conversationData.duration_minutes);

    const { data: matchData } = await supabase
      .from('matches')
      .select('conversation_topic')
      .eq('id', conversationData.match_id)
      .maybeSingle();

    if (matchData) {
      setConversationTopic(matchData.conversation_topic);
    }

    const { data: turnsData } = await supabase
      .from('conversation_turns')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('turn_number', { ascending: true });

    if (turnsData) {
      setConversationTurns(turnsData);
    }

    if (!existingFeedback) {
      const previousAvg = await getPreviousAverageScore(profile.id, supabase);

      const defaultFeedback = generateDefaultFeedback(
        matchData?.conversation_topic,
        previousAvg ? 5 : 0
      );

      const currentAvg = (
        defaultFeedback.vocabulary_mastery +
        defaultFeedback.pronunciation_score +
        defaultFeedback.fluency_score +
        defaultFeedback.tone_score
      ) / 4;

      const improvementScore = calculateImprovementScore(currentAvg, previousAvg);

      const { data: newFeedback } = await supabase
        .from('feedback')
        .insert({
          conversation_id: conversationId,
          user_id: profile.id,
          vocabulary_mastery: defaultFeedback.vocabulary_mastery,
          pronunciation_score: defaultFeedback.pronunciation_score,
          fluency_score: defaultFeedback.fluency_score,
          tone_score: defaultFeedback.tone_score,
          improvement_notes: defaultFeedback.improvement_notes,
          highlighted_errors: defaultFeedback.highlighted_errors,
          vocab_used: defaultFeedback.vocab_used,
          grammar_errors: defaultFeedback.grammar_errors,
          vocabulary_mistakes: defaultFeedback.vocabulary_mistakes,
          pronunciation_issues: defaultFeedback.pronunciation_issues,
          recommended_keywords: defaultFeedback.recommended_keywords,
          improvement_score: improvementScore,
          overall_rating: defaultFeedback.overall_rating,
        })
        .select()
        .single();

      existingFeedback = newFeedback;

      const avgScore = (defaultFeedback.fluency_score + defaultFeedback.vocabulary_mastery + defaultFeedback.tone_score) / 3;
      const eloChange = Math.floor((avgScore - 75) / 2) + 10;
      const updatedElo = profile.elo_rating + Math.max(5, Math.min(30, eloChange));

      await supabase
        .from('profiles')
        .update({
          total_conversations: (profile.total_conversations || 0) + 1,
          elo_rating: updatedElo,
        })
        .eq('id', profile.id);
    }

    setFeedback(existingFeedback);
    setLoading(false);
    setTimeout(() => setShowScores(true), 300);
  }

  if (loading || !feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Sparkles className="w-10 h-10 text-[#79a64d]" />
          </div>
          <div className="text-gray-800 text-2xl font-bold">Analyzing your conversation...</div>
          <div className="text-gray-600 text-lg mt-2">Preparing your detailed feedback</div>
        </div>
      </div>
    );
  }

  const fluencyScore = feedback.fluency_score;
  const vocabularyScore = feedback.vocabulary_mastery;
  const toneScore = feedback.tone_score || Math.round((fluencyScore + vocabularyScore) / 2);
  const pronunciationScore = feedback.pronunciation_score;

  const overallRating = feedback.overall_rating || 10;

  const metrics: FeedbackMetric[] = [
    {
      label: 'Fluency',
      score: fluencyScore,
      comment: fluencyScore >= 85 ? "You're speaking smoothly and naturally!" : "Good flow! Keep building confidence.",
      icon: <MessageCircle className="w-8 h-8" />,
      color: 'from-blue-400 to-blue-500'
    },
    {
      label: 'Vocabulary',
      score: vocabularyScore,
      comment: vocabularyScore >= 85 ? "Impressive word choices! Your vocabulary is expanding." : "Nice variety in your expressions!",
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-purple-400 to-purple-500'
    },
    {
      label: 'Tone',
      score: toneScore,
      comment: toneScore >= 85 ? "Your conversational tone is warm and engaging!" : "Good energy in your speech!",
      icon: <Mic className="w-8 h-8" />,
      color: 'from-green-400 to-green-500'
    },
    {
      label: 'Pronunciation',
      score: pronunciationScore,
      comment: pronunciationScore >= 85 ? "Crystal clear pronunciation!" : "Your speech is understandable!",
      icon: <Mic className="w-8 h-8" />,
      color: 'from-orange-400 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[#79a64d] to-[#5b4fb8] shadow-2xl mb-6 transform hover:scale-105 transition-transform">
              <div className="text-center">
                <div className="text-6xl font-bold text-white">{overallRating}</div>
                <div className="text-sm text-white font-semibold">/10</div>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-3">
              Outstanding Work, {profile?.full_name?.split(' ')[0]}!
            </h1>
            <p className="text-2xl text-gray-600">Here's your detailed feedback</p>

            {feedback.improvement_score !== 0 && (
              <div className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-white rounded-full shadow-lg border-2 border-green-200">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-lg font-bold text-green-700">
                  {feedback.improvement_score > 0 ? '+' : ''}{feedback.improvement_score}% improvement
                </span>
              </div>
            )}
          </div>

          {conversationTurns.length > 0 && (
            <ConversationSummary
              turns={conversationTurns}
              durationMinutes={conversationDuration}
              topic={conversationTopic}
            />
          )}

          <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-700 ${showScores ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {metrics.map((metric, idx) => (
              <div
                key={metric.label}
                className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all transform hover:scale-105"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-4 text-white mx-auto`}>
                  {metric.icon}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2 text-center">{metric.score}</div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 text-center">{metric.label}</div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: showScores ? `${metric.score}%` : '0%' }}
                  />
                </div>
                <p className="text-xs text-gray-700 text-center leading-relaxed">{metric.comment}</p>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-[#5b4fb8]" />
              <h2 className="text-3xl font-bold text-gray-900">Detailed Analysis</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <GrammarErrorCard errors={feedback.grammar_errors || []} />
              <VocabularyMistakeCard mistakes={feedback.vocabulary_mistakes || []} />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <PronunciationIssueCard issues={feedback.pronunciation_issues || []} />
              <KeywordHighlight keywords={feedback.vocab_used || []} />
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-[#79a64d]" />
              <h2 className="text-3xl font-bold text-gray-900">Level Up Your Vocabulary</h2>
            </div>
            <RecommendedKeywordsCard keywords={feedback.recommended_keywords || []} />
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-[#79a64d]" />
              <h2 className="text-2xl font-bold text-gray-900">Overall Feedback</h2>
            </div>
            <p className="text-lg text-gray-800 text-center leading-relaxed mb-2">
              {feedback.improvement_notes}
            </p>
            <p className="text-gray-600 text-center font-semibold">
              Keep up the amazing work! Every conversation makes you stronger.
            </p>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={onStartAnother}
              className="w-full gradient-primary text-white py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 animate-pulse-slow"
            >
              <Calendar className="w-7 h-7" />
              Start Another Conversation
            </button>
            <button
              onClick={onBackToDashboard}
              className="w-full bg-white text-gray-700 py-5 rounded-2xl font-bold text-lg border-2 border-gray-200 hover:bg-gray-50 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
