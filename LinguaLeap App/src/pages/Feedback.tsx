import { useState, useEffect } from 'react';
import { Award, TrendingUp, BookOpen, Volume2, Calendar, ArrowLeft, FileText, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Feedback as FeedbackType, Conversation } from '../lib/supabase';

type FeedbackProps = {
  conversationId: string;
  onScheduleNext: () => void;
  onBackToDashboard: () => void;
};

export default function Feedback({ conversationId, onScheduleNext, onBackToDashboard }: FeedbackProps) {
  const { profile } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    loadOrCreateFeedback();
  }, [conversationId, profile]);

  async function loadOrCreateFeedback() {
    if (!profile) return;

    let { data: existingFeedback } = await supabase
      .from('feedback')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', profile.id)
      .maybeSingle();

    if (!existingFeedback) {
      const vocabScore = 70 + Math.floor(Math.random() * 25);
      const pronScore = 75 + Math.floor(Math.random() * 20);
      const fluencyScore = 72 + Math.floor(Math.random() * 23);

      const improvements = [
        'Focus on using more advanced vocabulary to express complex ideas.',
        'Practice pronunciation of challenging consonant clusters.',
        'Work on reducing filler words like "um" and "uh" for better fluency.',
        'Try to expand your responses with more detailed examples.',
        'Pay attention to word stress patterns in multi-syllable words.',
      ];

      const { data: newFeedback } = await supabase
        .from('feedback')
        .insert({
          conversation_id: conversationId,
          user_id: profile.id,
          vocabulary_mastery: vocabScore,
          pronunciation_score: pronScore,
          fluency_score: fluencyScore,
          improvement_notes: improvements[Math.floor(Math.random() * improvements.length)],
          highlighted_errors: [
            { text: 'intresting', correction: 'interesting', timestamp: '2:34' },
            { text: 'definately', correction: 'definitely', timestamp: '5:12' },
          ],
          vocab_used: [
            { word: 'perspective', context: 'Used correctly in discussion context' },
            { word: 'elaborate', context: 'Great use of academic vocabulary' },
            { word: 'fascinating', context: 'Strong descriptive language' },
          ],
        })
        .select()
        .single();

      existingFeedback = newFeedback;

      await supabase
        .from('profiles')
        .update({
          total_conversations: (profile.total_conversations || 0) + 1,
          elo_rating: profile.elo_rating + Math.floor(Math.random() * 20) - 5,
        })
        .eq('id', profile.id);
    }

    setFeedback(existingFeedback);

    const { data: convData } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();

    if (convData) {
      setConversation(convData);
    }

    setLoading(false);
  }

  if (loading || !feedback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Award className="w-8 h-8 text-[#5b4fb8]" />
          </div>
          <div className="text-[#5b4fb8] text-xl">Analyzing your performance...</div>
        </div>
      </div>
    );
  }

  const avgScore = Math.round(
    (feedback.vocabulary_mastery + feedback.pronunciation_score + feedback.fluency_score) / 3
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-5xl font-bold text-white">{avgScore}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Great Job, {profile?.full_name}!</h1>
            <p className="text-gray-600">Here's your detailed performance feedback</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="w-8 h-8 text-[#5b4fb8]" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{feedback.vocabulary_mastery}</div>
              <div className="text-sm font-semibold text-gray-600">Vocabulary Mastery</div>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5b4fb8] rounded-full transition-all"
                  style={{ width: `${feedback.vocabulary_mastery}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <Volume2 className="w-8 h-8 text-[#79a64d]" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{feedback.pronunciation_score}</div>
              <div className="text-sm font-semibold text-gray-600">Pronunciation</div>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#79a64d] rounded-full transition-all"
                  style={{ width: `${feedback.pronunciation_score}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-[#5b4fb8]" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{feedback.fluency_score}</div>
              <div className="text-sm font-semibold text-gray-600">Fluency</div>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5b4fb8] rounded-full transition-all"
                  style={{ width: `${feedback.fluency_score}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Key Improvements</h2>
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <p className="text-gray-800 leading-relaxed">{feedback.improvement_notes}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Highlighted Corrections</h3>
              <div className="space-y-3">
                {(feedback.highlighted_errors as Array<{ text: string; correction: string; timestamp: string }>).map(
                  (error, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-mono">
                        {error.timestamp}
                      </div>
                      <div className="flex-1">
                        <span className="line-through text-red-600">{error.text}</span>
                        <span className="mx-2">→</span>
                        <span className="text-green-600 font-semibold">{error.correction}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Vocabulary Highlights</h3>
              <div className="space-y-3">
                {(feedback.vocab_used as Array<{ word: string; context: string }>).map((vocab, idx) => (
                  <div key={idx} className="border-l-4 border-[#79a64d] pl-3">
                    <div className="font-bold text-[#5b4fb8]">{vocab.word}</div>
                    <div className="text-sm text-gray-600">{vocab.context}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {conversation && conversation.transcript && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#5b4fb8]" />
                  <h2 className="text-xl font-bold text-gray-900">Conversation Transcript</h2>
                </div>
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-[#5b4fb8] font-semibold hover:underline text-sm"
                >
                  {showTranscript ? 'Hide' : 'Show'} Transcript
                </button>
              </div>

              {showTranscript && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#79a64d]" />
                      <span className="text-sm font-semibold text-gray-700">
                        Accuracy: {conversation.accuracy_percentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#5b4fb8]" />
                      <span className="text-sm font-semibold text-gray-700">
                        Duration: {conversation.duration_minutes} min
                      </span>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-xl">
                    {conversation.transcript.split('\n').map((line, idx) => {
                      const [speaker, ...textParts] = line.split(':');
                      const text = textParts.join(':').trim();
                      if (!text) return null;

                      return (
                        <div key={idx} className="mb-4">
                          <div className="font-bold text-[#5b4fb8] mb-1">{speaker}:</div>
                          <div className="text-gray-700 pl-4">{text}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Keep the Momentum Going!</h2>
            <p className="text-gray-600 mb-6">Ready to continue improving your language skills?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onScheduleNext}
                className="gradient-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Schedule Next Conversation
              </button>
              <button
                onClick={onBackToDashboard}
                className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
