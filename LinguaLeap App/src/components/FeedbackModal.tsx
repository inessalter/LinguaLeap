import { X, Star, BookOpen, Smile, TrendingUp } from 'lucide-react';
import { Feedback } from '../lib/supabase';

type FeedbackModalProps = {
  feedback: Feedback | null;
  partnerName: string;
  onClose: () => void;
  onBackToDashboard?: () => void;
};

export default function FeedbackModal({ feedback, partnerName, onClose, onBackToDashboard }: FeedbackModalProps) {
  if (!feedback) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">AI Coach Feedback</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600">Loading feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#2c7a7b]">AI Coach Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-6 h-6 text-[#79a64d]" />
                <h3 className="text-lg font-bold text-gray-900">Fluency</h3>
              </div>
              <div className="text-4xl font-bold text-[#79a64d]">
                {feedback.fluency_score.toFixed(1)}
              </div>
            </div>
            <p className="text-[#2c7a7b] mt-2">
              Excellent flow! Your speech was natural and confident. Keep practicing to maintain this rhythm.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-6 h-6 text-[#5b4fb8]" />
                <h3 className="text-lg font-bold text-gray-900">Vocabulary</h3>
              </div>
              <div className="text-4xl font-bold text-[#5b4fb8]">
                {feedback.vocabulary_mastery.toFixed(1)}
              </div>
            </div>
            <p className="text-[#2c7a7b] mt-2">
              Good word choices! Try incorporating more advanced expressions to boost your score.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 mb-3">
                <Smile className="w-6 h-6 text-[#79a64d]" />
                <h3 className="text-lg font-bold text-gray-900">Tone & Expression</h3>
              </div>
              <div className="text-4xl font-bold text-[#79a64d]">
                {(feedback.tone_score || feedback.pronunciation_score).toFixed(1)}
              </div>
            </div>
            <p className="text-[#2c7a7b] mt-2">
              Fantastic! Your tone was engaging and appropriate. You're speaking with real confidence.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-[#79a64d]" />
              <h3 className="text-lg font-bold text-gray-900">Overall Progress</h3>
            </div>
            <p className="text-[#2c7a7b]">
              {feedback.improvement_notes || 'Great conversation! Your consistency is impressive. Keep up the excellent work!'}
            </p>
          </div>

          {feedback.grammar_errors && feedback.grammar_errors.length > 0 && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Grammar Tips</h3>
              <div className="space-y-3">
                {feedback.grammar_errors.slice(0, 3).map((error, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold">Issue:</span> {error.text}
                    </p>
                    <p className="text-[#2c7a7b]">
                      <span className="font-semibold">Correction:</span> {error.correction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {feedback.recommended_keywords && feedback.recommended_keywords.length > 0 && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Recommended Keywords</h3>
              <div className="space-y-2">
                {feedback.recommended_keywords.slice(0, 5).map((keyword, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-semibold text-[#5b4fb8]">{keyword.word}</p>
                    <p className="text-gray-600">{keyword.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex-1 gradient-primary text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Back to Dashboard
            </button>
          )}
          <button
            onClick={onClose}
            className={`${onBackToDashboard ? 'flex-1' : 'w-full'} border-2 border-[#5b4fb8] text-[#5b4fb8] py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
