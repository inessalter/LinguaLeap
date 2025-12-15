import { Clock, MessageCircle, TrendingUp, Award, Download } from 'lucide-react';

type ConversationTurn = {
  id: string;
  speaker_name: string;
  speaker_type: string;
  message_text: string;
  turn_number: number;
  created_at: string;
};

type ConversationSummaryProps = {
  turns: ConversationTurn[];
  durationMinutes: number;
  topic: string;
};

export default function ConversationSummary({ turns, durationMinutes, topic }: ConversationSummaryProps) {
  const userTurns = turns.filter(t => t.speaker_type === 'user');
  const aiTurns = turns.filter(t => t.speaker_type === 'ai');

  const totalWords = userTurns.reduce((sum, turn) => sum + turn.message_text.split(' ').length, 0);
  const avgWordsPerTurn = userTurns.length > 0 ? Math.round(totalWords / userTurns.length) : 0;

  const longestTurn = userTurns.reduce((longest, turn) => {
    const wordCount = turn.message_text.split(' ').length;
    return wordCount > (longest?.message_text.split(' ').length || 0) ? turn : longest;
  }, userTurns[0]);

  const downloadTranscript = () => {
    const transcriptText = turns
      .sort((a, b) => a.turn_number - b.turn_number)
      .map(turn => `[${turn.speaker_name}]: ${turn.message_text}`)
      .join('\n\n');

    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Conversation Summary</h2>
        <button
          onClick={downloadTranscript}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Transcript
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Duration</span>
          </div>
          <div className="text-3xl font-bold text-blue-900">{durationMinutes}</div>
          <div className="text-xs text-blue-700">minutes</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">Your Turns</span>
          </div>
          <div className="text-3xl font-bold text-purple-900">{userTurns.length}</div>
          <div className="text-xs text-purple-700">exchanges</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-900">Total Words</span>
          </div>
          <div className="text-3xl font-bold text-green-900">{totalWords}</div>
          <div className="text-xs text-green-700">words spoken</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-semibold text-orange-900">Avg per Turn</span>
          </div>
          <div className="text-3xl font-bold text-orange-900">{avgWordsPerTurn}</div>
          <div className="text-xs text-orange-700">words</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-2">Conversation Topic</h3>
        <p className="text-gray-700">{topic}</p>
      </div>

      {longestTurn && (
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-6 h-6 text-yellow-600" />
            <h3 className="font-bold text-gray-900">Best Moment</h3>
          </div>
          <p className="text-gray-700 italic mb-2">"{longestTurn.message_text}"</p>
          <p className="text-sm text-gray-600">
            Your longest contribution with {longestTurn.message_text.split(' ').length} words!
          </p>
        </div>
      )}
    </div>
  );
}
