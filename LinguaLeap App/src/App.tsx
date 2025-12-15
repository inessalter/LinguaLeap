import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ModeSelection from './pages/ModeSelection';
import VoiceConversation from './pages/VoiceConversation';
import AIFeedback from './pages/AIFeedback';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import { supabase } from './lib/supabase';

type Page =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'modeSelection'
  | 'profile'
  | { type: 'conversation'; matchId: string; mode: 'partner' | 'solo' }
  | { type: 'aiFeedback'; conversationId: string }
  | { type: 'feedback'; conversationId: string };

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-[#5b4fb8]" />
          </div>
          <div className="text-[#5b4fb8] text-xl font-semibold">Loading LinguaLeap...</div>
        </div>
      </div>
    );
  }

  if (user && (currentPage === 'landing' || currentPage === 'auth')) {
    setCurrentPage('dashboard');
  }

  if (!user && currentPage !== 'landing' && currentPage !== 'auth') {
    setCurrentPage('landing');
  }

  if (currentPage === 'landing') {
    return <Landing onGetStarted={() => setCurrentPage('auth')} />;
  }

  if (currentPage === 'auth') {
    return <Auth onBack={() => setCurrentPage('landing')} />;
  }

  if (!user) {
    return <Landing onGetStarted={() => setCurrentPage('auth')} />;
  }

  if (currentPage === 'dashboard') {
    return (
      <Dashboard
        onNavigate={(page) => {
          if (page === 'schedule') {
            setCurrentPage('modeSelection');
          } else if (page === 'profile') {
            setCurrentPage('profile');
          } else if (page.startsWith('match:')) {
            const matchId = page.split(':')[1];
            setCurrentPage({ type: 'conversation', matchId, mode: 'partner' });
          }
        }}
      />
    );
  }

  if (currentPage === 'profile') {
    return <Profile onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'modeSelection') {
    return (
      <ModeSelection
        onBack={() => setCurrentPage('dashboard')}
        onSelectMode={async (mode) => {
          if (!user) return;

          const { data: topicData } = await supabase
            .from('conversation_topics')
            .select('*')
            .order('random()')
            .limit(1)
            .maybeSingle();

          const topic = topicData?.topic || 'General conversation practice';
          const keywords = topicData?.suggested_keywords || [];

          if (mode === 'solo') {
            const { data: scheduleData } = await supabase
              .from('conversation_schedules')
              .insert({
                user_id: user.id,
                scheduled_time: new Date().toISOString(),
                status: 'matched',
              })
              .select()
              .single();

            if (scheduleData) {
              const { data: matchData } = await supabase
                .from('matches')
                .insert({
                  schedule_id: scheduleData.id,
                  user1_id: user.id,
                  user2_id: null,
                  conversation_topic: topic,
                  suggested_keywords: keywords,
                  conversation_mode: 'solo',
                  status: 'matched',
                })
                .select()
                .single();

              if (matchData) {
                await supabase.from('solo_practice_sessions').insert({
                  match_id: matchData.id,
                  user_id: user.id,
                  ai_persona: 'conversational',
                  voice_model: 'alloy',
                });

                setCurrentPage({ type: 'conversation', matchId: matchData.id, mode: 'solo' });
              }
            }
          } else {
            const { data: demoPartner } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', 'demo.partner@lingualeap.demo')
              .maybeSingle();

            if (demoPartner) {
              const { data: scheduleData } = await supabase
                .from('conversation_schedules')
                .insert({
                  user_id: user.id,
                  scheduled_time: new Date().toISOString(),
                  status: 'matched',
                })
                .select()
                .single();

              if (scheduleData) {
                const { data: matchData } = await supabase
                  .from('matches')
                  .insert({
                    schedule_id: scheduleData.id,
                    user1_id: user.id,
                    user2_id: demoPartner.id,
                    conversation_topic: topic,
                    suggested_keywords: keywords,
                    conversation_mode: 'partner',
                    status: 'matched',
                  })
                  .select()
                  .single();

                if (matchData) {
                  setCurrentPage({ type: 'conversation', matchId: matchData.id, mode: 'partner' });
                }
              }
            }
          }
        }}
      />
    );
  }

  if (typeof currentPage === 'object' && currentPage.type === 'conversation') {
    return (
      <VoiceConversation
        matchId={currentPage.matchId}
        mode={currentPage.mode}
        onComplete={(conversationId) => setCurrentPage({ type: 'aiFeedback', conversationId })}
        onBack={() => setCurrentPage('dashboard')}
      />
    );
  }

  if (typeof currentPage === 'object' && currentPage.type === 'aiFeedback') {
    return (
      <AIFeedback
        conversationId={currentPage.conversationId}
        onStartAnother={() => setCurrentPage('modeSelection')}
        onBackToDashboard={() => setCurrentPage('dashboard')}
      />
    );
  }

  if (typeof currentPage === 'object' && currentPage.type === 'feedback') {
    return (
      <Feedback
        conversationId={currentPage.conversationId}
        onScheduleNext={() => setCurrentPage('modeSelection')}
        onBackToDashboard={() => setCurrentPage('dashboard')}
      />
    );
  }

  return <Landing onGetStarted={() => setCurrentPage('auth')} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
