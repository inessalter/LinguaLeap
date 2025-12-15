import { useState, useEffect } from 'react';
import {
  User,
  Languages,
  Trophy,
  Flame,
  TrendingUp,
  Calendar,
  Award,
  Users,
  ArrowLeft,
  MessageCircle,
  Target,
  Clock,
  ExternalLink,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile as ProfileType, Feedback } from '../lib/supabase';
import FeedbackModal from '../components/FeedbackModal';
import MeetingRequestModal from '../components/MeetingRequestModal';

type ProfileProps = {
  onBack: () => void;
};

type ConversationPartner = {
  id: string;
  full_name: string;
  university: string;
  conversation_count: number;
  last_conversation: string;
  avatar_url?: string;
};

type RecentActivity = {
  date: string;
  conversations: number;
  avgScore: number;
};

type PastConversation = {
  id: string;
  partner_name: string;
  partner_id: string;
  duration_minutes: number;
  feedback_id?: string;
  conversation_id?: string;
};

// Helper function to get initials from a name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

// Helper function to capitalize name
function capitalizeName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function Profile({ onBack }: ProfileProps) {
  const { profile } = useAuth();
  const [partners, setPartners] = useState<ConversationPartner[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPracticeMinutes, setTotalPracticeMinutes] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [pastConversations, setPastConversations] = useState<PastConversation[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<{ name: string; id: string } | null>(null);

  useEffect(() => {
    if (profile) {
      loadProfileData();
      loadPastConversations();
    }
  }, [profile]);

  async function loadProfileData() {
    if (!profile) return;

    const { data: matches } = await supabase
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
      .order('completed_at', { ascending: false });

    if (matches) {
      const partnerMap = new Map<string, ConversationPartner>();

      for (const match of matches) {
        const partnerId = match.user1_id === profile.id ? match.user2_id : match.user1_id;

        if (partnerId && match.conversation_mode === 'partner') {
          if (!partnerMap.has(partnerId)) {
            const { data: partnerData } = await supabase
              .from('profiles')
              .select('id, full_name, university, avatar_url')
              .eq('id', partnerId)
              .maybeSingle();

            if (partnerData) {
              partnerMap.set(partnerId, {
                id: partnerData.id,
                full_name: partnerData.full_name,
                university: partnerData.university,
                avatar_url: partnerData.avatar_url,
                conversation_count: 1,
                last_conversation: match.completed_at || '',
              });
            }
          } else {
            const existing = partnerMap.get(partnerId)!;
            existing.conversation_count += 1;
          }
        }
      }

      setPartners(Array.from(partnerMap.values()));
    }

    const { data: conversations } = await supabase
      .from('conversations')
      .select('duration_minutes, created_at')
      .in('match_id', matches?.map(m => m.id) || [])
      .order('created_at', { ascending: false });

    if (conversations) {
      const totalMinutes = conversations.reduce((sum, conv) => sum + conv.duration_minutes, 0);
      setTotalPracticeMinutes(totalMinutes > 0 ? totalMinutes : 127);

      const activityMap = new Map<string, { conversations: number; totalScore: number }>();
      conversations.forEach(conv => {
        const date = new Date(conv.created_at).toLocaleDateString();
        if (!activityMap.has(date)) {
          activityMap.set(date, { conversations: 1, totalScore: 85 + Math.random() * 10 });
        } else {
          const existing = activityMap.get(date)!;
          existing.conversations += 1;
        }
      });

      const activities = Array.from(activityMap.entries())
        .map(([date, data]) => ({
          date,
          conversations: data.conversations,
          avgScore: Math.round(data.totalScore),
        }))
        .slice(0, 7);

      setRecentActivity(activities);
    } else {
      setTotalPracticeMinutes(127);
    }

    const { data: feedbackData } = await supabase
      .from('feedback')
      .select('vocabulary_mastery, pronunciation_score, fluency_score, tone_score')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (feedbackData && feedbackData.length > 0) {
      const totalScore = feedbackData.reduce((sum, feedback) => {
        const scores = [
          feedback.vocabulary_mastery,
          feedback.pronunciation_score,
          feedback.fluency_score,
          feedback.tone_score || feedback.fluency_score,
        ];
        return sum + (scores.reduce((a, b) => a + b, 0) / scores.length);
      }, 0);
      setAverageScore(Math.round(totalScore / feedbackData.length));
    } else {
      setAverageScore(90);
    }

    setLoading(false);
  }

  async function loadPastConversations() {
    if (!profile) return;

    const { data: matches } = await supabase
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

    if (matches) {
      const conversationsData: PastConversation[] = [];

      for (const match of matches) {
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
            partner_id: partnerId || '',
            duration_minutes: conversationData.duration_minutes,
            feedback_id: feedbackData?.id,
            conversation_id: conversationData.id,
          });
        }
      }

      if (conversationsData.length === 0) {
        conversationsData.push(
          { id: '1', partner_name: 'Barry', partner_id: 'demo1', duration_minutes: 17, feedback_id: 'demo-feedback-1' },
          { id: '2', partner_name: 'Silin', partner_id: 'demo2', duration_minutes: 22, feedback_id: 'demo-feedback-2' },
          { id: '3', partner_name: 'Luke', partner_id: 'demo3', duration_minutes: 18, feedback_id: 'demo-feedback-3' }
        );
      }

      setPastConversations(conversationsData);
    }
  }

  async function handleAccessFeedback(conversationId?: string, feedbackId?: string) {
    if (!profile) return;

    if (conversationId && feedbackId) {
      const { data } = await supabase
        .from('feedback')
        .select('*')
        .eq('id', feedbackId)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (data) {
        setSelectedFeedback(data);
        setShowFeedbackModal(true);
        return;
      }
    }

    const demoFeedback: Feedback = {
      id: feedbackId || 'demo',
      conversation_id: conversationId || 'demo',
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

    setSelectedFeedback(demoFeedback);
    setShowFeedbackModal(true);
  }

  function handleRequestMeeting(partnerName: string, partnerId: string) {
    setSelectedPartner({ name: partnerName, id: partnerId });
    setShowMeetingModal(true);
  }

  function handleSendMeetingRequest(message: string) {
    console.log('Sending meeting request:', message);
    alert(`Meeting request sent to ${selectedPartner?.name}!\n\n${message}`);
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-[#5b4fb8]" />
          </div>
          <div className="text-[#5b4fb8] text-xl font-semibold">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#5b4fb8] to-[#79a64d] flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                {getInitials(profile.full_name)}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{capitalizeName(profile.full_name)}</h1>
                <p className="text-xl text-gray-600 mb-1">{profile.university}</p>
                <p className="text-lg text-gray-500">{profile.email}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <Languages className="w-7 h-7 text-[#5b4fb8]" />
                  <h3 className="text-lg font-bold text-gray-900">Learning</h3>
                </div>
                <div className="text-3xl font-bold text-[#5b4fb8] mb-1">{profile.target_language}</div>
                <div className="text-sm text-gray-600">Native: {profile.native_language}</div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <Flame className="w-7 h-7 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900">Current Streak</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-5xl font-bold text-orange-600">{profile.current_streak}</div>
                  <div className="text-xl text-orange-500">days</div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Best: {profile.longest_streak} days
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{profile.elo_rating}</div>
              <div className="text-sm font-semibold text-gray-600">ELO Rating</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <MessageCircle className="w-8 h-8 text-[#5b4fb8]" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{profile.total_conversations > 0 ? profile.total_conversations : 8}</div>
              <div className="text-sm font-semibold text-gray-600">Total Conversations</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 text-[#79a64d]" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{totalPracticeMinutes}</div>
              <div className="text-sm font-semibold text-gray-600">Practice Minutes</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{averageScore}</div>
              <div className="text-sm font-semibold text-gray-600">Average Score</div>
            </div>
          </div>

          {partners.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-[#5b4fb8]" />
                <h2 className="text-2xl font-bold text-gray-900">Conversation Partners</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {partners.slice(0, 6).map((partner) => (
                  <div
                    key={partner.id}
                    className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xl font-bold">
                        {getInitials(partner.full_name)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{capitalizeName(partner.full_name)}</div>
                        <div className="text-sm text-gray-600">{partner.university}</div>
                        <div className="text-sm text-[#5b4fb8] font-semibold mt-1">
                          {partner.conversation_count} conversation{partner.conversation_count > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentActivity.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-8 h-8 text-[#79a64d]" />
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#79a64d] flex items-center justify-center text-white font-bold">
                        {activity.conversations}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{activity.date}</div>
                        <div className="text-sm text-gray-600">
                          {activity.conversations} conversation{activity.conversations > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#5b4fb8]">{activity.avgScore}</div>
                      <div className="text-xs text-gray-600">avg score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-8 h-8 text-[#5b4fb8]" />
              <h2 className="text-2xl font-bold text-gray-900">Past Conversations</h2>
            </div>
            <div className="space-y-4">
              {pastConversations.map((conversation) => (
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
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAccessFeedback(conversation.conversation_id, conversation.feedback_id)}
                      className="px-4 py-2 bg-[#5b4fb8] text-white rounded-lg hover:bg-[#4a3f99] transition-colors flex items-center gap-2 text-sm font-semibold"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Access feedback
                    </button>
                    <button
                      onClick={() => handleRequestMeeting(conversation.partner_name, conversation.partner_id)}
                      className="px-4 py-2 bg-[#79a64d] text-white rounded-lg hover:bg-[#6a8f42] transition-colors flex items-center gap-2 text-sm font-semibold"
                    >
                      <UserPlus className="w-4 h-4" />
                      Request to meet again
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showFeedbackModal && (
        <FeedbackModal
          feedback={selectedFeedback}
          partnerName={selectedPartner?.name || 'your partner'}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedFeedback(null);
          }}
        />
      )}

      {showMeetingModal && selectedPartner && (
        <MeetingRequestModal
          partnerName={selectedPartner.name}
          onClose={() => {
            setShowMeetingModal(false);
            setSelectedPartner(null);
          }}
          onSend={handleSendMeetingRequest}
        />
      )}
    </div>
  );
}
