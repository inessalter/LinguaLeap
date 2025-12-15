import { useState, useEffect } from 'react';
import { Lightbulb, X, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Topic = {
  id: string;
  topic: string;
  suggested_keywords: string[];
  difficulty_level: string;
};

type TopicCategory = {
  name: string;
  icon: React.ReactNode;
  topics: Topic[];
  color: string;
};

type InspirationSectionProps = {
  onSelectTopic: (topic: string, keywords: string[]) => void;
  currentTopic: string;
};

export default function InspirationSection({ onSelectTopic, currentTopic }: InspirationSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && topics.length === 0) {
      loadTopics();
    }
  }, [isOpen]);

  async function loadTopics() {
    setLoading(true);
    const { data } = await supabase
      .from('conversation_topics')
      .select('*')
      .order('difficulty_level', { ascending: true });

    if (data) {
      setTopics(data);
    }
    setLoading(false);
  }

  const categories: TopicCategory[] = [
    {
      name: 'Technology & Innovation',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      topics: topics.filter(t =>
        t.topic.toLowerCase().includes('technology') ||
        t.topic.toLowerCase().includes('artificial intelligence') ||
        t.topic.toLowerCase().includes('digital')
      )
    },
    {
      name: 'Environment & Sustainability',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      topics: topics.filter(t =>
        t.topic.toLowerCase().includes('sustainable') ||
        t.topic.toLowerCase().includes('energy') ||
        t.topic.toLowerCase().includes('climate')
      )
    },
    {
      name: 'Social & Cultural',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      topics: topics.filter(t =>
        t.topic.toLowerCase().includes('social') ||
        t.topic.toLowerCase().includes('cultural') ||
        t.topic.toLowerCase().includes('communication')
      )
    },
    {
      name: 'Career & Professional',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500',
      topics: topics.filter(t =>
        t.topic.toLowerCase().includes('career') ||
        t.topic.toLowerCase().includes('work') ||
        t.topic.toLowerCase().includes('professional')
      )
    },
    {
      name: 'Health & Wellness',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'from-rose-500 to-pink-500',
      topics: topics.filter(t =>
        t.topic.toLowerCase().includes('health') ||
        t.topic.toLowerCase().includes('wellbeing')
      )
    },
    {
      name: 'Education & Learning',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'from-indigo-500 to-purple-500',
      topics: topics.filter(t =>
        t.topic.toLowerCase().includes('education') ||
        t.topic.toLowerCase().includes('learning') ||
        t.topic.toLowerCase().includes('language') ||
        t.topic.toLowerCase().includes('academic')
      )
    },
    {
      name: 'Creative & Arts',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500',
      topics: topics.filter(t =>
        t.topic.toLowerCase().includes('creative') ||
        t.topic.toLowerCase().includes('art')
      )
    }
  ].filter(category => category.topics.length > 0);

  const getRandomTopic = () => {
    if (topics.length === 0) return;
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    onSelectTopic(randomTopic.topic, randomTopic.suggested_keywords);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-green-100 hover:from-purple-200 hover:to-green-200 rounded-xl font-semibold text-gray-700 transition-all transform hover:scale-105"
      >
        <Lightbulb className="w-5 h-5 text-[#79a64d]" />
        Need Inspiration?
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-green-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Find Inspiration</h2>
              <p className="text-sm text-gray-600">Choose a topic to practice</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#5b4fb8]"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Browse by Category</h3>
                <button
                  onClick={getRandomTopic}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5b4fb8] to-[#79a64d] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Random Topic
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {categories.map((category, idx) => (
                  <div
                    key={idx}
                    className="bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-all cursor-pointer"
                    onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white`}>
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{category.name}</h4>
                        <p className="text-xs text-gray-500">{category.topics.length} topics</p>
                      </div>
                    </div>

                    {selectedCategory === category.name && (
                      <div className="mt-4 space-y-2 animate-fade-in">
                        {category.topics.map((topic) => (
                          <button
                            key={topic.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTopic(topic.topic, topic.suggested_keywords);
                              setIsOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-all border ${
                              currentTopic === topic.topic
                                ? 'border-[#79a64d] bg-green-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="font-semibold text-sm text-gray-900 mb-1">{topic.topic}</div>
                            <div className="flex flex-wrap gap-1">
                              {topic.suggested_keywords.slice(0, 3).map((keyword, kidx) => (
                                <span
                                  key={kidx}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                topic.difficulty_level === 'beginner' ? 'bg-green-100 text-green-700' :
                                topic.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {topic.difficulty_level}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {categories.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No topics available yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
