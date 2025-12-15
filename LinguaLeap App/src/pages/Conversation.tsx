import { useState, useEffect } from 'react';
import { Mic, MicOff, MessageSquare, Lightbulb, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Match, Profile, Feedback } from '../lib/supabase';
import FeedbackModal from '../components/FeedbackModal';

type ConversationProps = {
  matchId: string;
  onComplete: (conversationId: string) => void;
  onBack: () => void;
};

export default function Conversation({ matchId, onComplete, onBack }: ConversationProps) {
  const { profile } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string; time: string }>>([]);
  const [showPrompt, setShowPrompt] = useState(true);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  useEffect(() => {
    if (conversationStarted) {
      const timer = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [conversationStarted]);

  async function loadMatch() {
    const { data: matchData } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .maybeSingle();

    if (matchData) {
      setMatch(matchData);
      const partnerId = matchData.user1_id === profile?.id ? matchData.user2_id : matchData.user1_id;

      const { data: partnerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId)
        .maybeSingle();

      if (partnerData) setPartner(partnerData);
    }
  }

  const startConversation = async () => {
    setConversationStarted(true);
    setShowPrompt(false);
    await supabase
      .from('matches')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', matchId);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        const responses = [
          "I think this topic is really interesting because...",
          "In my experience, I've noticed that...",
          "That's a great point. What I find fascinating is...",
          "Could you elaborate on that? I'd like to understand...",
          "From my perspective, the key aspect is...",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setTranscript((prev) => [
          ...prev,
          {
            speaker: partner?.full_name || 'Partner',
            text: randomResponse,
            time: new Date().toISOString(),
          },
        ]);
      }, 3000);
    }
  };

  const refreshTopic = () => {
    const topics = [
      "Let's discuss the impact of technology on education",
      "How about we talk about sustainable living practices?",
      "What are your thoughts on work-life balance?",
      "Let's explore cultural differences in communication",
    ];
    const newTopic = topics[Math.floor(Math.random() * topics.length)];
    if (match) {
      setMatch({ ...match, conversation_topic: newTopic });
    }
  };

  const endConversation = async () => {
    if (!match || !profile) return;

    await supabase.from('matches').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', matchId);

    const transcriptText = transcript.map((t) => `${t.speaker}: ${t.text}`).join('\n');
    const { data: conversationData } = await supabase
      .from('conversations')
      .insert({
        match_id: matchId,
        transcript: transcriptText,
        duration_minutes: Math.floor(duration / 60) || 3,
        accuracy_percentage: 85 + Math.floor(Math.random() * 10),
      })
      .select()
      .single();

    if (conversationData) {
      const demoFeedback: Feedback = {
        id: 'demo-' + conversationData.id,
        conversation_id: conversationData.id,
        user_id: profile.id,
        vocabulary_mastery: 7.8,
        pronunciation_score: 8.2,
        fluency_score: 8.5,
        tone_score: 9.1,
        improvement_notes: `You spoke ${transcript.length * 20} words over ${Math.floor(duration / 60) || 3} minutes. Your consistency is impressive!`,
        highlighted_errors: [],
        vocab_used: [],
        grammar_errors: [],
        vocabulary_mistakes: [],
        pronunciation_issues: [],
        recommended_keywords: [],
        improvement_score: 85,
        overall_rating: 8.5,
        created_at: new Date().toISOString(),
      };

      setFeedback(demoFeedback);
      setShowFeedbackModal(true);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!match || !partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-[#5b4fb8] text-xl">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Exit</span>
          </button>
          {conversationStarted && (
            <div className="flex items-center gap-4">
              <div className="text-lg font-bold text-[#5b4fb8]">{formatDuration(duration)}</div>
              <button
                onClick={endConversation}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                End Conversation
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {!conversationStarted && showPrompt && (
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 mb-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-green-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-[#5b4fb8]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Matched with {partner.full_name}</h2>
                  <p className="text-gray-600">{partner.university}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Conversation Topic</h3>
                  <button
                    onClick={refreshTopic}
                    className="text-[#5b4fb8] text-sm font-semibold hover:underline"
                  >
                    Refresh Topic
                  </button>
                </div>
                <div className="p-4 rounded-xl gradient-accent">
                  <p className="text-gray-800 text-lg">{match.conversation_topic}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
                  <Lightbulb className="w-5 h-5 text-[#79a64d]" />
                  Suggested Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(match.suggested_keywords as string[] || []).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-white border-2 border-[#79a64d] text-[#79a64d] rounded-xl font-semibold text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={startConversation}
                className="w-full gradient-primary text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
              >
                Start Conversation
              </button>
            </div>
          )}

          {conversationStarted && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Live Conversation</h3>
                  <button
                    onClick={refreshTopic}
                    className="flex items-center gap-2 text-[#5b4fb8] text-sm font-semibold hover:underline"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Need inspiration?
                  </button>
                </div>

                <div className="min-h-[300px] max-h-[400px] overflow-y-auto mb-6 space-y-4">
                  {transcript.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <Mic className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>Start speaking to see live transcription...</p>
                    </div>
                  ) : (
                    transcript.map((entry, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-[#5b4fb8]">
                            {entry.speaker.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">{entry.speaker}</div>
                          <div className="text-gray-700">{entry.text}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={toggleRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-110 ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'gradient-primary hover:shadow-2xl'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="w-10 h-10 text-white" />
                    ) : (
                      <Mic className="w-10 h-10 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-center text-sm text-gray-600 mt-4">
                  {isRecording ? 'Recording... Click to pause' : 'Click to start speaking'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {showFeedbackModal && feedback && (
        <FeedbackModal
          feedback={feedback}
          partnerName={partner?.full_name || 'your partner'}
          onClose={() => {
            setShowFeedbackModal(false);
            setFeedback(null);
          }}
          onBackToDashboard={() => {
            setShowFeedbackModal(false);
            setFeedback(null);
            onBack();
          }}
        />
      )}
    </div>
  );
}
