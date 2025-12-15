import { MessageCircle } from 'lucide-react';

type LandingProps = {
  onGetStarted: () => void;
};

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-green-50 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-7xl md:text-8xl font-bold mb-8 tracking-tight">
            <span className="text-[#5b4fb8]">Lingua</span>
            <span className="text-[#79a64d]">Leap</span>
          </h1>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Speak confidently in any language
          </h2>

          <p className="text-xl md:text-2xl text-gray-700 mb-12 font-light">
            Real-time conversations, AI feedback, and measurable growth.
          </p>

          <button
            onClick={onGetStarted}
            className="gradient-primary text-white px-16 py-5 rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Get Started
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-16 mt-32 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold text-[#5b4fb8] mb-3">1M+</div>
            <div className="text-lg md:text-xl text-gray-700 font-medium">Conversations</div>
          </div>

          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold text-[#79a64d] mb-3">50K+</div>
            <div className="text-lg md:text-xl text-gray-700 font-medium">Active Learners</div>
          </div>

          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold text-[#5b4fb8] mb-3">30+</div>
            <div className="text-lg md:text-xl text-gray-700 font-medium">Languages</div>
          </div>
        </div>
      </main>

      <footer className="py-8">
        <div className="text-center text-gray-500">
          <p className="text-sm">© 2025 LinguaLeap. Built for universities and advanced language learners.</p>
        </div>
      </footer>
    </div>
  );
}
