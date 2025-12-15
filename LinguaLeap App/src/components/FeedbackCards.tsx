import { AlertCircle, BookOpen, Volume2, CheckCircle, Lightbulb } from 'lucide-react';
import { GrammarError, VocabularyMistake, PronunciationIssue, RecommendedKeyword } from '../lib/supabase';

type GrammarErrorCardProps = {
  errors: GrammarError[];
};

export function GrammarErrorCard({ errors }: GrammarErrorCardProps) {
  if (errors.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Grammar</h3>
        </div>
        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
          <p className="text-green-800 font-semibold">Excellent work!</p>
          <p className="text-green-700 text-sm mt-1">
            No major grammar errors detected. Your sentence structure is clear and correct!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Grammar</h3>
          <p className="text-sm text-gray-600">{errors.length} area{errors.length > 1 ? 's' : ''} to improve</p>
        </div>
      </div>
      <div className="space-y-3">
        {errors.map((error, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-start gap-2 mb-2">
              <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-bold">
                {error.category}
              </span>
            </div>
            <div className="mb-2">
              <span className="line-through text-red-700">{error.text}</span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="text-green-700 font-semibold">{error.correction}</span>
            </div>
            <p className="text-sm text-gray-700">{error.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

type VocabularyMistakeCardProps = {
  mistakes: VocabularyMistake[];
};

export function VocabularyMistakeCard({ mistakes }: VocabularyMistakeCardProps) {
  if (mistakes.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Vocabulary</h3>
        </div>
        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
          <p className="text-green-800 font-semibold">Great vocabulary usage!</p>
          <p className="text-green-700 text-sm mt-1">
            You're using words appropriately and effectively. Keep expanding your word bank!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Vocabulary</h3>
          <p className="text-sm text-gray-600">{mistakes.length} word{mistakes.length > 1 ? 's' : ''} to review</p>
        </div>
      </div>
      <div className="space-y-3">
        {mistakes.map((mistake, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-orange-50 border border-orange-200">
            <div className="mb-2">
              <span className="font-bold text-orange-900">{mistake.word}</span>
              <span className="text-sm text-gray-600 ml-2">in context: "{mistake.context}"</span>
            </div>
            <div className="mb-2">
              <span className="text-sm text-gray-700">Better choice: </span>
              <span className="font-semibold text-green-700">{mistake.correction}</span>
            </div>
            <p className="text-sm text-gray-700 italic">{mistake.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

type PronunciationIssueCardProps = {
  issues: PronunciationIssue[];
};

export function PronunciationIssueCard({ issues }: PronunciationIssueCardProps) {
  if (issues.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Pronunciation</h3>
        </div>
        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
          <p className="text-green-800 font-semibold">Clear pronunciation!</p>
          <p className="text-green-700 text-sm mt-1">
            Your speech is clear and easy to understand. Keep up the excellent work!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
          <Volume2 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Pronunciation</h3>
          <p className="text-sm text-gray-600">{issues.length} sound{issues.length > 1 ? 's' : ''} to practice</p>
        </div>
      </div>
      <div className="space-y-3">
        {issues.map((issue, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="mb-2">
              <span className="font-bold text-blue-900">{issue.word}</span>
              <span className="text-sm text-gray-600 ml-2 font-mono">[{issue.phonetic}]</span>
            </div>
            <div className="mb-2">
              <span className="text-sm font-semibold text-blue-800">Issue: </span>
              <span className="text-sm text-gray-700">{issue.issue}</span>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-sm font-semibold text-blue-900">Tip: </span>
              <span className="text-sm text-blue-800">{issue.guidance}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type KeywordHighlightProps = {
  keywords: Array<{ word: string; context: string }>;
};

export function KeywordHighlight({ keywords }: KeywordHighlightProps) {
  if (keywords.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Keywords You Used</h3>
        </div>
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
          <p className="text-purple-800 font-semibold">Building your vocabulary!</p>
          <p className="text-purple-700 text-sm mt-1">
            Keep practicing to expand your active vocabulary range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Keywords You Used</h3>
          <p className="text-sm text-gray-600">{keywords.length} word{keywords.length > 1 ? 's' : ''} highlighted</p>
        </div>
      </div>
      <div className="space-y-3">
        {keywords.map((keyword, idx) => (
          <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2">
            <div className="font-bold text-purple-900 mb-1">{keyword.word}</div>
            <div className="text-sm text-gray-700">{keyword.context}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

type RecommendedKeywordsProps = {
  keywords: RecommendedKeyword[];
};

export function RecommendedKeywordsCard({ keywords }: RecommendedKeywordsProps) {
  if (keywords.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Recommended Keywords</h3>
        </div>
        <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
          <p className="text-yellow-800 font-semibold">Great foundation!</p>
          <p className="text-yellow-700 text-sm mt-1">
            Continue practicing to discover new vocabulary opportunities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recommended Keywords</h3>
          <p className="text-sm text-gray-600">Try using these in your next conversation</p>
        </div>
      </div>
      <div className="space-y-3">
        {keywords.map((keyword, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
            <div className="font-bold text-yellow-900 mb-2">{keyword.word}</div>
            <p className="text-sm text-gray-700 mb-2 italic">{keyword.definition}</p>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-sm font-semibold text-yellow-900">Example: </span>
              <span className="text-sm text-yellow-800">"{keyword.example_usage}"</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
