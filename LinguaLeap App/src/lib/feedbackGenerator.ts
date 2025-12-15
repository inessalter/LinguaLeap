import { GrammarError, VocabularyMistake, PronunciationIssue, RecommendedKeyword } from './supabase';

export type DefaultFeedbackData = {
  vocabulary_mastery: number;
  pronunciation_score: number;
  fluency_score: number;
  tone_score: number;
  improvement_notes: string;
  highlighted_errors: Array<{ text: string; correction: string; timestamp: string }>;
  vocab_used: Array<{ word: string; context: string }>;
  grammar_errors: GrammarError[];
  vocabulary_mistakes: VocabularyMistake[];
  pronunciation_issues: PronunciationIssue[];
  recommended_keywords: RecommendedKeyword[];
  improvement_score: number;
  overall_rating: number;
};

const encouragingMessages = [
  "Excellent work! You're making great progress in your language learning journey.",
  "Outstanding performance! Your confidence and communication skills are really shining through.",
  "Great job! Every conversation helps you become more fluent and natural.",
  "Wonderful effort! You're building strong communication skills with each practice session.",
  "Impressive! Your dedication to learning is paying off in your speaking ability.",
];

const improvementMessages = [
  "Keep up the momentum! You're showing steady improvement.",
  "Your progress is noticeable! Continue practicing regularly for best results.",
  "You're on an upward trajectory! Each conversation makes you stronger.",
  "Fantastic growth! Your consistency is leading to real improvement.",
  "Well done! You're making measurable progress in your fluency.",
];

const topicBasedKeywords: Record<string, RecommendedKeyword[]> = {
  technology: [
    {
      word: 'innovative',
      definition: 'Introducing new ideas; original and creative in thinking',
      example_usage: 'The company developed an innovative solution to the problem.',
    },
    {
      word: 'algorithm',
      definition: 'A process or set of rules to be followed in calculations',
      example_usage: 'The search engine uses a complex algorithm to rank results.',
    },
    {
      word: 'implementation',
      definition: 'The process of putting a decision or plan into effect',
      example_usage: 'The implementation of the new system took three months.',
    },
  ],
  education: [
    {
      word: 'curriculum',
      definition: 'The subjects comprising a course of study',
      example_usage: 'The school updated its curriculum to include more practical skills.',
    },
    {
      word: 'methodology',
      definition: 'A system of methods used in a particular field',
      example_usage: 'The teacher uses an interactive methodology to engage students.',
    },
    {
      word: 'assessment',
      definition: 'The evaluation or estimation of something',
      example_usage: 'Regular assessment helps track student progress effectively.',
    },
  ],
  business: [
    {
      word: 'strategy',
      definition: 'A plan of action designed to achieve a long-term goal',
      example_usage: 'The company needs a clear strategy to enter new markets.',
    },
    {
      word: 'synergy',
      definition: 'The interaction of elements that produce a greater effect together',
      example_usage: 'The merger created synergy between the two companies.',
    },
    {
      word: 'stakeholder',
      definition: 'A person with an interest or concern in something',
      example_usage: 'We need to consider all stakeholders before making this decision.',
    },
  ],
  default: [
    {
      word: 'perspective',
      definition: 'A particular attitude toward or way of viewing something',
      example_usage: 'Looking at the issue from a different perspective helped us find a solution.',
    },
    {
      word: 'elaborate',
      definition: 'To develop or present in detail',
      example_usage: 'Could you elaborate on that point? I want to understand it better.',
    },
    {
      word: 'significant',
      definition: 'Important enough to be noticed or have an effect',
      example_usage: 'This discovery represents a significant breakthrough in the field.',
    },
  ],
};

export function generateDefaultFeedback(
  conversationTopic?: string,
  improvementScore?: number
): DefaultFeedbackData {
  const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
  const improvementMessage = improvementMessages[Math.floor(Math.random() * improvementMessages.length)];

  const finalMessage = improvementScore && improvementScore > 0
    ? improvementMessage
    : randomMessage;

  const topicLower = conversationTopic?.toLowerCase() || '';
  let keywords = topicBasedKeywords.default;

  if (topicLower.includes('technology') || topicLower.includes('computer') || topicLower.includes('digital')) {
    keywords = topicBasedKeywords.technology;
  } else if (topicLower.includes('education') || topicLower.includes('learning') || topicLower.includes('school')) {
    keywords = topicBasedKeywords.education;
  } else if (topicLower.includes('business') || topicLower.includes('work') || topicLower.includes('professional')) {
    keywords = topicBasedKeywords.business;
  }

  return {
    vocabulary_mastery: 92,
    pronunciation_score: 90,
    fluency_score: 91,
    tone_score: 93,
    improvement_notes: finalMessage,
    highlighted_errors: [],
    vocab_used: [
      {
        word: 'discussion',
        context: 'Great use when introducing your thoughts',
      },
      {
        word: 'perspective',
        context: 'Excellent academic vocabulary',
      },
    ],
    grammar_errors: [],
    vocabulary_mistakes: [],
    pronunciation_issues: [],
    recommended_keywords: keywords,
    improvement_score: improvementScore || 0,
    overall_rating: 10,
  };
}

export function calculateImprovementScore(
  currentAvg: number,
  previousAvg: number | null
): number {
  if (previousAvg === null || previousAvg === 0) {
    return 0;
  }

  const improvement = ((currentAvg - previousAvg) / previousAvg) * 100;
  return Math.round(Math.max(-100, Math.min(100, improvement)));
}

export async function getPreviousAverageScore(
  userId: string,
  supabase: any
): Promise<number | null> {
  const { data: previousFeedback } = await supabase
    .from('feedback')
    .select('vocabulary_mastery, pronunciation_score, fluency_score, tone_score')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  if (!previousFeedback || previousFeedback.length === 0) {
    return null;
  }

  const totalScore = previousFeedback.reduce((sum: number, feedback: any) => {
    const scores = [
      feedback.vocabulary_mastery,
      feedback.pronunciation_score,
      feedback.fluency_score,
      feedback.tone_score || feedback.fluency_score,
    ];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return sum + avg;
  }, 0);

  return totalScore / previousFeedback.length;
}
