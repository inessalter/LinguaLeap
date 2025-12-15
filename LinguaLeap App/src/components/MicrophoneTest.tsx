import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle, Loader, Volume2 } from 'lucide-react';
import { OpenAIVoiceService } from '../lib/openai';

type MicrophoneStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'testing' | 'error';

type MicrophoneTestProps = {
  onPermissionGranted: () => void;
  voiceService: OpenAIVoiceService;
};

export default function MicrophoneTest({ onPermissionGranted, voiceService }: MicrophoneTestProps) {
  const [status, setStatus] = useState<MicrophoneStatus>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const testStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    requestPermission();
    return () => {
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestPermission = async () => {
    setStatus('requesting');
    setErrorMessage('');

    try {
      const stream = await voiceService.requestMicrophonePermission();

      if (stream) {
        testStreamRef.current = stream;
        voiceService.setupAudioAnalyser(stream);
        setStatus('granted');
        onPermissionGranted();
      }
    } catch (error) {
      console.error('Microphone permission error:', error);
      setStatus('denied');

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to access microphone');
      }
    }
  };

  const startTest = () => {
    if (status !== 'granted') return;

    setIsTesting(true);
    setStatus('testing');

    voiceService.startAudioLevelMonitoring((level) => {
      setAudioLevel(level);
    });

    setTimeout(() => {
      stopTest();
    }, 5000);
  };

  const stopTest = () => {
    voiceService.stopAudioLevelMonitoring();
    setIsTesting(false);
    setStatus('granted');
    setAudioLevel(0);
  };

  const retryPermission = async () => {
    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach(track => track.stop());
      testStreamRef.current = null;
    }
    await requestPermission();
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return 'Click the camera icon in the address bar, then allow microphone access and refresh the page.';
    } else if (userAgent.includes('firefox')) {
      return 'Click the microphone icon in the address bar, select "Allow" and refresh the page.';
    } else if (userAgent.includes('safari')) {
      return 'Go to Safari > Settings for This Website > Microphone > Allow, then refresh the page.';
    } else if (userAgent.includes('edg')) {
      return 'Click the lock icon in the address bar, then allow microphone access and refresh the page.';
    }

    return 'Please enable microphone access in your browser settings and refresh the page.';
  };

  return (
    <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          status === 'granted' ? 'bg-green-100' :
          status === 'denied' || status === 'error' ? 'bg-red-100' :
          'bg-gray-100'
        }`}>
          {status === 'requesting' && <Loader className="w-6 h-6 text-gray-600 animate-spin" />}
          {status === 'granted' && <CheckCircle className="w-6 h-6 text-green-600" />}
          {(status === 'denied' || status === 'error') && <AlertCircle className="w-6 h-6 text-red-600" />}
          {status === 'idle' && <Mic className="w-6 h-6 text-gray-600" />}
          {status === 'testing' && <Volume2 className="w-6 h-6 text-blue-600 animate-pulse" />}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {status === 'requesting' && 'Requesting Microphone Access...'}
            {status === 'granted' && 'Microphone Ready'}
            {status === 'denied' && 'Microphone Access Denied'}
            {status === 'error' && 'Microphone Error'}
            {status === 'idle' && 'Microphone Setup'}
            {status === 'testing' && 'Testing Microphone...'}
          </h3>

          {status === 'requesting' && (
            <p className="text-gray-700 text-sm">
              Please allow microphone access when prompted by your browser.
            </p>
          )}

          {status === 'granted' && !isTesting && (
            <div>
              <p className="text-gray-700 text-sm mb-3">
                Your microphone is connected and ready to use.
              </p>
              <button
                onClick={startTest}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Test Microphone
              </button>
            </div>
          )}

          {status === 'testing' && (
            <div>
              <p className="text-gray-700 text-sm mb-3">
                Speak into your microphone. You should see the bars move.
              </p>
              <div className="flex items-center gap-2 mb-2">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-8 bg-gray-200 rounded-sm transition-all duration-100"
                    style={{
                      backgroundColor: audioLevel > (i * 10) ? '#10b981' : '#e5e7eb',
                      opacity: audioLevel > (i * 10) ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
              <button
                onClick={stopTest}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold text-sm hover:bg-gray-600 transition-colors"
              >
                Stop Test
              </button>
            </div>
          )}

          {(status === 'denied' || status === 'error') && (
            <div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                <p className="text-red-800 font-semibold text-sm mb-2">
                  {errorMessage || 'Unable to access microphone'}
                </p>
                <p className="text-red-700 text-sm">
                  {getBrowserInstructions()}
                </p>
              </div>
              <button
                onClick={retryPermission}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Retry Permission
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
