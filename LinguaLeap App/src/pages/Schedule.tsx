import { useState } from 'react';
import { Calendar, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type ScheduleProps = {
  onBack: () => void;
  onScheduled: () => void;
};

export default function Schedule({ onBack, onScheduled }: ScheduleProps) {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const handleSchedule = async () => {
    if (!profile || !selectedDate || !selectedTime) return;

    setLoading(true);
    const scheduledTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();

    const { error } = await supabase.from('conversation_schedules').insert({
      user_id: profile.id,
      scheduled_time: scheduledTime,
      status: 'pending',
    });

    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        onScheduled();
      }, 2000);
    }
    setLoading(false);
  };

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Conversation Scheduled!</h2>
          <p className="text-gray-600 mb-6">We'll match you with a conversation partner soon.</p>
        </div>
      </div>
    );
  }

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

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule a Conversation</h1>
            <p className="text-gray-600">Choose your preferred time and we'll match you with a partner</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
            <div className="mb-8">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                <Calendar className="w-6 h-6 text-[#5b4fb8]" />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                max={maxDate}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#5b4fb8] focus:ring-2 focus:ring-purple-200 outline-none transition-all text-lg"
              />
            </div>

            <div className="mb-8">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                <Clock className="w-6 h-6 text-[#5b4fb8]" />
                Select Time
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      selectedTime === time
                        ? 'bg-[#5b4fb8] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && selectedTime && (
              <div className="mb-8 p-4 rounded-xl gradient-accent">
                <p className="text-center text-gray-800">
                  <span className="font-semibold">Selected:</span>{' '}
                  {new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  at {selectedTime}
                </p>
              </div>
            )}

            <button
              onClick={handleSchedule}
              disabled={!selectedDate || !selectedTime || loading}
              className="w-full gradient-primary text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
