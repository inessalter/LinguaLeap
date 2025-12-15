import { Users, Bot, ArrowLeft, Sparkles } from 'lucide-react';

type ModeSelectionProps = {
  onBack: () => void;
  onSelectMode: (mode: 'partner' | 'solo') => void;
};

export default function ModeSelection({ onBack, onSelectMode }: ModeSelectionProps) {
  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Practice Mode</h1>
            <p className="text-xl text-gray-600">Select how you'd like to practice today</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <button
              onClick={() => onSelectMode('partner')}
              className="group bg-white rounded-3xl p-10 shadow-lg border-2 border-gray-200 hover:border-[#5b4fb8] hover:shadow-2xl transition-all transform hover:scale-105 text-left"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-[#5b4fb8]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Partner Match</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get matched with another learner at your skill level. Practice real conversations
                with authentic human interaction and peer-to-peer learning.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#79a64d]"></div>
                  <span>ELO-based matching</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#79a64d]"></div>
                  <span>Real conversation dynamics</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#79a64d]"></div>
                  <span>Cultural exchange opportunity</span>
                </div>
              </div>
              <div className="mt-8 px-6 py-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl text-[#5b4fb8] font-semibold text-center group-hover:bg-gradient-to-r group-hover:from-[#5b4fb8] group-hover:to-[#79a64d] group-hover:text-white transition-all">
                Find a Partner
              </div>
            </button>

            <button
              onClick={() => onSelectMode('solo')}
              className="group bg-white rounded-3xl p-10 shadow-lg border-2 border-gray-200 hover:border-[#79a64d] hover:shadow-2xl transition-all transform hover:scale-105 text-left relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-green-500 text-white rounded-full text-xs font-bold">
                <Sparkles className="w-3 h-3" />
                <span>AI Powered</span>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bot className="w-10 h-10 text-[#79a64d]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">AI Voice Practice</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Practice anytime with ChatGPT voice integration. Get instant feedback,
                adaptive conversations, and practice at your own pace.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#5b4fb8]"></div>
                  <span>24/7 availability</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#5b4fb8]"></div>
                  <span>Real-time voice interaction</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#5b4fb8]"></div>
                  <span>Instant pronunciation feedback</span>
                </div>
              </div>
              <div className="mt-8 px-6 py-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl text-[#79a64d] font-semibold text-center group-hover:bg-gradient-to-r group-hover:from-[#79a64d] group-hover:to-[#5b4fb8] group-hover:text-white transition-all">
                Start AI Practice
              </div>
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Both modes provide detailed feedback and help improve your language skills
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
