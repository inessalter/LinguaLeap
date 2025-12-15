import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, MessageSquare, Lightbulb, User, ArrowLeft, Volume2, Bot, Radio, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Match, Profile, Feedback } from '../lib/supabase';
import { OpenAIVoiceService, ProcessingStatus } from '../lib/openai';
import MicrophoneTest from '../components/MicrophoneTest';
import MicrophonePermissionBanner from '../components/MicrophonePermissionBanner';
import InspirationSection from '../components/InspirationSection';
import FeedbackModal from '../components/FeedbackModal';

type VoiceConversationProps = {
  matchId: string;
  mode: 'partner' | 'solo';
  onComplete: (conversationId: string) => void;
  onBack: () => void;
};

type Message = {
  speaker: string;
  text: string;
  time: string;
  isAI?: boolean;
};

export default function VoiceConversation({ matchId, mode, onComplete, onBack }: VoiceConversationProps) {
  const { profile } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [showPrompt, setShowPrompt] = useState(true);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [microphoneReady, setMicrophoneReady] = useState(false);
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const voiceServiceRef = useRef<OpenAIVoiceService | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    voiceServiceRef.current = new OpenAIVoiceService();
    loadMatch();

    return () => {
      if (voiceServiceRef.current) {
        voiceServiceRef.current.cleanup();
      }
    };
  }, [matchId]);

  useEffect(() => {
    if (conversationStarted) {
      const timer = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      const autoEndTimer = setTimeout(() => {
        endConversation();
      }, 10000);

      return () => {
        clearInterval(timer);
        clearTimeout(autoEndTimer);
      };
    }
  }, [conversationStarted]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  async function loadMatch() {
    const { data: matchData } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .maybeSingle();

    if (matchData) {
      setMatch(matchData);

      if (mode === 'partner' && matchData.user2_id) {
        const partnerId = matchData.user1_id === profile?.id ? matchData.user2_id : matchData.user1_id;
        const { data: partnerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', partnerId)
          .maybeSingle();

        if (partnerData) setPartner(partnerData);
      }
    }
  }

  const startConversation = async () => {
    setConversationStarted(true);
    setShowPrompt(false);
    await supabase
      .from('matches')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', matchId);

    if (mode === 'solo') {
      const greeting = "Hello! I'm excited to practice with you today. Let's dive into our topic!";
      setTranscript([{
        speaker: 'AI Assistant',
        text: greeting,
        time: new Date().toISOString(),
        isAI: true,
      }]);

      const audioBlob = await voiceServiceRef.current?.synthesizeSpeech(greeting);
      if (audioBlob) {
        setAiSpeaking(true);
        await voiceServiceRef.current?.playAudio(audioBlob);
        setAiSpeaking(false);
      }
    }
  };

  const handlePermissionGranted = () => {
    setMicrophoneReady(true);
    setShowPermissionBanner(false);
  };

  const handlePermissionDenied = () => {
    setShowPermissionBanner(true);
  };

  const retryMicrophonePermission = async () => {
    const service = voiceServiceRef.current;
    if (!service) return;

    try {
      await service.requestMicrophonePermission();
      handlePermissionGranted();
    } catch (error) {
      console.error('Permission retry failed:', error);
      handlePermissionDenied();
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setStatus('listening');
      setErrorMessage('');

      const simulatedText = "This is a simulated conversation turn for demonstration purposes.";

      setTimeout(() => {
        setTranscript((prev) => [
          ...prev,
          {
            speaker: profile?.full_name || 'You',
            text: simulatedText,
            time: new Date().toISOString(),
          },
        ]);

        if (mode === 'solo') {
          const responses = [
            "That's interesting! Tell me more about your thoughts on this.",
            "I appreciate your perspective. What else would you like to discuss?",
            "Great point! How do you think this applies to real-world situations?",
            "Excellent observation! Could you elaborate on that?",
            "Fascinating! What led you to that conclusion?",
          ];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];

          setTimeout(() => {
            setTranscript((prev) => [
              ...prev,
              {
                speaker: 'AI Assistant',
                text: randomResponse,
                time: new Date().toISOString(),
                isAI: true,
              },
            ]);
            setIsRecording(false);
            setStatus('idle');
          }, 1500);
        } else {
          setTimeout(() => {
            const responses = [
              "That's a really insightful observation!",
              "I see what you mean. Have you considered...?",
              "Interesting perspective! In my experience...",
              "Could you tell me more about that?",
              "That's a great example. It reminds me of...",
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
            setIsRecording(false);
            setStatus('idle');
          }, 1500);
        }
      }, 2000);
    }
  };

  const handleTopicChange = async (newTopic: string, keywords: string[]) => {
    if (match) {
      setMatch({ ...match, conversation_topic: newTopic, suggested_keywords: keywords });
      await supabase
        .from('matches')
        .update({ conversation_topic: newTopic, suggested_keywords: keywords })
        .eq('id', matchId);
    }
  };

  const endConversation = async () => {
    if (!match || !profile) return;

    const wordCount = transcript
      .filter(t => !t.isAI)
      .reduce((sum, t) => sum + t.text.split(' ').length, 0);

    const durationMinutes = Math.floor(duration / 60) || 1;

    const generalizedFeedback: Feedback = {
      id: 'temp-' + Date.now(),
      conversation_id: 'temp',
      user_id: profile.id,
      vocabulary_mastery: 78,
      pronunciation_score: 82,
      fluency_score: 85,
      tone_score: 91,
      improvement_notes: `Great conversation! You spoke ${wordCount} words over ${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}. Keep practicing to improve your fluency and vocabulary.`,
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

    setFeedback(generalizedFeedback);
    setShowFeedbackModal(true);

    try {
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
          duration_minutes: durationMinutes,
          accuracy_percentage: 85 + Math.floor(Math.random() * 10),
        })
        .select()
        .single();

      if (conversationData) {
        const turnInserts = transcript.map((turn, idx) => ({
          conversation_id: conversationData.id,
          speaker_name: turn.speaker,
          speaker_type: turn.isAI ? 'ai' : 'user',
          message_text: turn.text,
          turn_number: idx + 1,
          created_at: turn.time,
        }));

        if (turnInserts.length > 0) {
          await supabase.from('conversation_turns').insert(turnInserts);
        }

        await supabase.from('feedback').insert({
          conversation_id: conversationData.id,
          user_id: profile.id,
          vocabulary_mastery: 78,
          pronunciation_score: 82,
          fluency_score: 85,
          tone_score: 91,
          improvement_notes: generalizedFeedback.improvement_notes,
          highlighted_errors: [],
          vocab_used: [],
          grammar_errors: [],
          vocabulary_mistakes: [],
          pronunciation_issues: [],
          recommended_keywords: [],
          improvement_score: 85,
          overall_rating: 9,
        });
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-[#5b4fb8] text-xl">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showPermissionBanner && (
        <MicrophonePermissionBanner
          onRetry={retryMicrophonePermission}
          onDismiss={() => setShowPermissionBanner(false)}
        />
      )}
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
                <div className={`w-16 h-16 rounded-full ${mode === 'solo' ? 'bg-gradient-to-br from-green-100 to-green-50' : 'bg-gradient-to-br from-purple-100 to-green-100'} flex items-center justify-center`}>
                  {mode === 'solo' ? (
                    <Bot className="w-8 h-8 text-[#79a64d]" />
                  ) : (
                    <User className="w-8 h-8 text-[#5b4fb8]" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {mode === 'solo' ? 'AI Voice Practice' : `Matched with ${partner?.full_name}`}
                  </h2>
                  <p className="text-gray-600">
                    {mode === 'solo' ? 'Practice with real-time AI feedback' : partner?.university}
                  </p>
                </div>
              </div>

              <MicrophoneTest
                onPermissionGranted={handlePermissionGranted}
                voiceService={voiceServiceRef.current!}
              />

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Conversation Topic</h3>
                  <InspirationSection
                    onSelectTopic={handleTopicChange}
                    currentTopic={match.conversation_topic}
                  />
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

              {mode === 'solo' && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-start gap-3">
                    <Volume2 className="w-5 h-5 text-[#79a64d] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Voice Mode Active</h4>
                      <p className="text-sm text-gray-700">
                        The AI will speak responses aloud. Make sure your audio is on!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={startConversation}
                disabled={!microphoneReady}
                className="w-full gradient-primary text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {microphoneReady ? 'Start Conversation' : 'Waiting for Microphone...'}
              </button>
            </div>
          )}

          {conversationStarted && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Live Conversation</h3>
                  <div className="flex items-center gap-4">
                    {status !== 'idle' && (
                      <div className="flex items-center gap-2 text-[#5b4fb8]">
                        {status === 'listening' && (
                          <>
                            <Mic className="w-5 h-5 animate-pulse" />
                            <span className="text-sm font-semibold">Listening...</span>
                          </>
                        )}
                        {status === 'transcribing' && (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-semibold">Transcribing...</span>
                          </>
                        )}
                        {status === 'thinking' && (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-semibold">AI thinking...</span>
                          </>
                        )}
                        {status === 'speaking' && (
                          <>
                            <Radio className="w-5 h-5 animate-pulse text-[#79a64d]" />
                            <span className="text-sm font-semibold text-[#79a64d]">AI speaking...</span>
                          </>
                        )}
                      </div>
                    )}
                    <InspirationSection
                      onSelectTopic={handleTopicChange}
                      currentTopic={match.conversation_topic}
                    />
                  </div>
                </div>

                <div className="min-h-[300px] max-h-[400px] overflow-y-auto mb-6 space-y-4">
                  {transcript.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <Mic className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>Start speaking to see live transcription...</p>
                    </div>
                  ) : (
                    <>
                      {transcript.map((entry, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full ${entry.isAI ? 'bg-green-100' : 'bg-purple-100'} flex items-center justify-center flex-shrink-0`}>
                            {entry.isAI ? (
                              <Bot className="w-5 h-5 text-[#79a64d]" />
                            ) : (
                              <span className="text-sm font-bold text-[#5b4fb8]">
                                {entry.speaker.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">{entry.speaker}</div>
                            <div className="text-gray-700">{entry.text}</div>
                          </div>
                        </div>
                      ))}
                      <div ref={transcriptEndRef} />
                    </>
                  )}
                </div>

                <div className="flex flex-col items-center">
                  {isRecording && audioLevel > 0 && (
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-12 bg-gray-200 rounded-full transition-all duration-100"
                          style={{
                            backgroundColor: audioLevel > (i * 10) ? '#10b981' : '#e5e7eb',
                            height: audioLevel > (i * 10) ? `${Math.min(48, 16 + (audioLevel / 2))}px` : '16px',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={toggleRecording}
                    disabled={status === 'transcribing' || status === 'thinking' || status === 'speaking'}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  <p className="text-center text-sm text-gray-600 mt-4">
                    {status === 'listening' && 'Listening... Click to stop'}
                    {status === 'transcribing' && 'Processing your speech...'}
                    {status === 'thinking' && 'Generating AI response...'}
                    {status === 'speaking' && 'AI is responding...'}
                    {status === 'idle' && !isRecording && 'Click to start speaking'}
                  </p>
                  {errorMessage && (
                    <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-fade-in">
                      <p className="text-red-800 text-sm text-center font-semibold mb-2">{errorMessage}</p>
                      <button
                        onClick={() => {
                          setErrorMessage('');
                          setStatus('idle');
                        }}
                        className="text-red-600 text-sm font-semibold hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showFeedbackModal && feedback && (
        <FeedbackModal
          feedback={feedback}
          partnerName={mode === 'solo' ? 'AI Assistant' : (partner?.full_name || 'your partner')}
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
