import { useState } from 'react';
import { X, Calendar, Clock, Send } from 'lucide-react';

type MeetingRequestModalProps = {
  partnerName: string;
  onClose: () => void;
  onSend: (timeSuggestions: string) => void;
};

export default function MeetingRequestModal({ partnerName, onClose, onSend }: MeetingRequestModalProps) {
  const [timeSuggestions, setTimeSuggestions] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleSend = () => {
    if (timeSuggestions.trim() || (selectedDate && selectedTime)) {
      const message = timeSuggestions.trim()
        ? timeSuggestions
        : `I'd love to meet again! How about ${selectedDate} at ${selectedTime}?`;
      onSend(message);
      onClose();
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Request to Meet Again</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Send a meeting request to <span className="font-semibold text-[#5b4fb8]">{partnerName}</span>
          </p>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-green-50 border-2 border-gray-200 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-[#5b4fb8]" />
              <label className="text-sm font-semibold text-gray-700">Select Date</label>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getTomorrowDate()}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-[#5b4fb8] focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-green-50 border-2 border-gray-200 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-[#79a64d]" />
              <label className="text-sm font-semibold text-gray-700">Select Time</label>
            </div>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-[#5b4fb8] focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Or write a custom message
            </label>
            <textarea
              value={timeSuggestions}
              onChange={(e) => setTimeSuggestions(e.target.value)}
              placeholder="Hi! I really enjoyed our conversation. Would you like to meet again? I'm available on..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#5b4fb8] focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
              rows={4}
            />
          </div>
          <p className="text-xs text-gray-500">
            Your message will be sent to {partnerName}'s email
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!timeSuggestions.trim() && (!selectedDate || !selectedTime)}
            className="flex-1 gradient-primary text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}
