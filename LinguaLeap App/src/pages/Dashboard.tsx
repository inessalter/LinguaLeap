import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, MessageCircle, Award, Clock, LogOut, User, Star, BookOpen, Smile } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Feedback, Match } from '../lib/supabase';
import { useDemoData } from '../hooks/useDemoData';
import FeedbackModal from '../components/FeedbackModal';

type DashboardProps = {
  onNavigate: (page: string) => void;
};

type PastConversation = {
  id: string;
  partner_name: string;
  duration_minutes: number;
  feedback_id?: string;
  conversation_id?: string;
};

type EloPoint = {
  conversation: number;
  elo: number;
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { profile, signOut } = useAuth();
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<Feedback | null>(null);
  const [pastConversations, setPastConversations] = useState<PastConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [eloHistory] = useState<EloPoint[]>([
    { conversation: 1, elo: 1100 },
    { conversation: 2, elo: 1150 },
    { conversation: 3, elo: 1200 }
  ]);
  useDemoData();

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  async function loadDashboardData() {
    if (!profile) return;

    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${profile.id},user2_id.eq.${profile.id}`)
      .eq('status', 'matched')
      .order('created_at', { ascending: false })
      .limit(3);

    const { data: completedMatches } = await supabase
      .from('matches')
      .select(`
        id,
        user1_id,
        user2_id,
        completed_at,
        conversation_mode
      `)
      .or(`user1_id.eq.${profile.id},user2_id.eq.${profile.id}`)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10);

    if (completedMatches) {
      const conversationsData: PastConversation[] = [];

      for (const match of completedMatches) {
        const partnerId = match.user1_id === profile.id ? match.user2_id : match.user1_id;

        let partnerName = 'AI Practice';
        if (partnerId && match.conversation_mode === 'partner') {
          const { data: partnerData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', partnerId)
            .maybeSingle();

          if (partnerData) {
            partnerName = partnerData.full_name;
          }
        }

        const { data: conversationData } = await supabase
          .from('conversations')
          .select('id, duration_minutes')
          .eq('match_id', match.id)
          .maybeSingle();

        const { data: feedbackData } = await supabase
          .from('feedback')
          .select('id')
          .eq('user_id', profile.id)
          .eq('conversation_id', conversationData?.id || '')
          .maybeSingle();

        if (conversationData) {
          conversationsData.push({
            id: match.id,
            partner_name: partnerName,
            duration_minutes: conversationData.duration_minutes,
            feedback_id: feedbackData?.id,
            conversation_id: conversationData.id,
          });
        }
      }

      if (conversationsData.length === 0) {
        conversationsData.push(
          { id: '1', partner_name: 'Barry', duration_minutes: 17, feedback_id: 'demo-feedback-1' },
          { id: '2', partner_name: 'Silin', duration_minutes: 22, feedback_id: 'demo-feedback-2' },
          { id: '3', partner_name: 'Luke', duration_minutes: 18, feedback_id: 'demo-feedback-3' }
        );
      }

      setPastConversations(conversationsData);
    }

    const { data: latestFeedback } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestFeedback) {
      setRecentFeedback(latestFeedback);
    } else {
      const demoFeedback: Feedback = {
        id: 'demo',
        conversation_id: 'demo',
        user_id: profile.id,
        vocabulary_mastery: 7.8,
        pronunciation_score: 8.2,
        fluency_score: 8.5,
        tone_score: 9.1,
        improvement_notes: 'You spoke 234 words over 3 minutes. Your consistency is impressive!',
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
      setRecentFeedback(demoFeedback);
    }

    if (matches) setUpcomingMatches(matches);
    setLoading(false);
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-[#5b4fb8] text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-[#5b4fb8]" />
            <span className="text-xl font-bold text-[#5b4fb8]">LinguaLeap</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-100"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </button>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile?.full_name}</h1>
          <p className="text-gray-600">Ready to practice your {profile?.target_language}?</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-[#5b4fb8]" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{profile?.elo_rating || 1200}</div>
            <div className="text-sm text-gray-600">ELO Rating</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#79a64d]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{pastConversations.length > 0 ? pastConversations.length : (profile?.total_conversations || 0)}</div>
            <div className="text-sm text-gray-600">Total Conversations</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#5b4fb8]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{upcomingMatches.length}</div>
            <div className="text-sm text-gray-600">Upcoming Matches</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#79a64d]" />
              ELO Progress
            </h2>
            <div className="relative h-96">
              <svg className="w-full h-full" viewBox="0 0 400 350">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#5b4fb8" />
                    <stop offset="100%" stopColor="#79a64d" />
                  </linearGradient>
                </defs>

                <line x1="60" y1="30" x2="60" y2="280" stroke="#e5e7eb" strokeWidth="3"/>
                <line x1="60" y1="280" x2="370" y2="280" stroke="#e5e7eb" strokeWidth="3"/>

                <polyline
                  points="100,220 230,150 360,80"
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle cx="100" cy="220" r="8" fill="#5b4fb8" stroke="white" strokeWidth="3"/>
                <circle cx="230" cy="150" r="8" fill="#6a8f42" stroke="white" strokeWidth="3"/>
                <circle cx="360" cy="80" r="8" fill="#79a64d" stroke="white" strokeWidth="3"/>

                <text x="100" y="310" textAnchor="middle" fontSize="16" fill="#6b7280" fontWeight="600">Conv 1</text>
                <text x="230" y="310" textAnchor="middle" fontSize="16" fill="#6b7280" fontWeight="600">Conv 2</text>
                <text x="360" y="310" textAnchor="middle" fontSize="16" fill="#6b7280" fontWeight="600">Conv 3</text>

                <text x="45" y="228" textAnchor="end" fontSize="15" fill="#6b7280" fontWeight="600">1100</text>
                <text x="45" y="158" textAnchor="end" fontSize="15" fill="#6b7280" fontWeight="600">1150</text>
                <text x="45" y="88" textAnchor="end" fontSize="15" fill="#6b7280" fontWeight="600">1200</text>
              </svg>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Feedback</h2>
            {recentFeedback ? (
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Star className="w-6 h-6 text-[#79a64d]" />
                      <h3 className="text-lg font-bold text-gray-900">Fluency</h3>
                    </div>
                    <div className="text-4xl font-bold text-[#79a64d]">
                      {recentFeedback.fluency_score.toFixed(1)}
                    </div>
                  </div>
                  <p className="text-[#2c7a7b] text-sm">
                    Excellent flow! Your speech was natural and confident.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-[#5b4fb8]" />
                      <h3 className="text-lg font-bold text-gray-900">Vocabulary</h3>
                    </div>
                    <div className="text-4xl font-bold text-[#5b4fb8]">
                      {recentFeedback.vocabulary_mastery.toFixed(1)}
                    </div>
                  </div>
                  <p className="text-[#2c7a7b] text-sm">
                    Good word choices! Try incorporating more advanced expressions.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Smile className="w-6 h-6 text-[#79a64d]" />
                      <h3 className="text-lg font-bold text-gray-900">Tone & Expression</h3>
                    </div>
                    <div className="text-4xl font-bold text-[#79a64d]">
                      {(recentFeedback.tone_score || recentFeedback.pronunciation_score).toFixed(1)}
                    </div>
                  </div>
                  <p className="text-[#2c7a7b] text-sm">
                    Fantastic! Your tone was engaging and appropriate.
                  </p>
                </div>

                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full py-3 bg-[#5b4fb8] text-white rounded-xl font-semibold hover:bg-[#4a3f99] transition-colors"
                >
                  View Full Feedback
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Complete your first conversation to receive feedback</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Start Practicing</h2>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => onNavigate('schedule')}
                className="w-full p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-[#5b4fb8] hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5b4fb8] to-[#4a3f99] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Partner Practice</h3>
                    <p className="text-sm text-gray-600">Match with a conversation partner</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-[#5b4fb8]" />
                </div>
              </button>

              <button
                onClick={() => onNavigate('schedule')}
                className="w-full p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-[#79a64d] hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#79a64d] to-[#5d7a3a] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Solo Practice</h3>
                    <p className="text-sm text-gray-600">Practice with AI assistant</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-[#79a64d]" />
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-8 h-8 text-[#5b4fb8]" />
              <h2 className="text-2xl font-bold text-gray-900">Past Conversations</h2>
            </div>
            <div className="space-y-4">
              {pastConversations.length > 0 ? (
                pastConversations.slice(0, 3).map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#5b4fb8] to-[#79a64d] flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {getInitials(conversation.partner_name)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{conversation.partner_name}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          {conversation.duration_minutes} minutes
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-600">
                  No past conversations yet. Start practicing to see your history!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showFeedbackModal && recentFeedback && (
        <FeedbackModal
          feedback={recentFeedback}
          partnerName="your recent practice"
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
}
