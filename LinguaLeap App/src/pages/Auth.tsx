import { useState } from 'react';
import { MessageCircle, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type AuthProps = {
  onBack: () => void;
};

export default function Auth({ onBack }: AuthProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email);

      if (signInError) {
        setError(signInError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-[#5b4fb8]" />
            <span className="text-xl font-bold text-[#5b4fb8]">LinguaLeap</span>
          </button>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Sign in to continue your progress
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#5b4fb8] focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  placeholder="you@email.com"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Enter any email to sign in or create an account</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
