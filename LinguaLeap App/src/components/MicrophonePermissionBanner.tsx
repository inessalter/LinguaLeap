import { AlertCircle, X } from 'lucide-react';

type MicrophonePermissionBannerProps = {
  onRetry: () => void;
  onDismiss?: () => void;
  errorMessage?: string;
};

export default function MicrophonePermissionBanner({
  onRetry,
  onDismiss,
  errorMessage = 'Microphone access is required for voice conversations',
}: MicrophonePermissionBannerProps) {
  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return {
        browser: 'Chrome',
        steps: [
          'Click the camera or microphone icon in the address bar (left side)',
          'Select "Always allow" for microphone access',
          'Click "Done" and refresh this page',
        ],
      };
    } else if (userAgent.includes('firefox')) {
      return {
        browser: 'Firefox',
        steps: [
          'Click the microphone icon in the address bar',
          'Remove the block by clicking the X next to "Blocked Temporarily"',
          'Refresh this page and allow when prompted',
        ],
      };
    } else if (userAgent.includes('safari')) {
      return {
        browser: 'Safari',
        steps: [
          'Go to Safari menu > Settings for This Website',
          'Find "Microphone" and change to "Allow"',
          'Refresh this page',
        ],
      };
    } else if (userAgent.includes('edg')) {
      return {
        browser: 'Edge',
        steps: [
          'Click the lock or camera icon in the address bar',
          'Find "Microphone" and change to "Allow"',
          'Refresh this page',
        ],
      };
    }

    return {
      browser: 'your browser',
      steps: [
        'Look for a microphone or camera icon in your address bar',
        'Enable microphone access',
        'Refresh this page',
      ],
    };
  };

  const instructions = getBrowserInstructions();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />

            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">
                Microphone Access Required
              </h3>
              <p className="mb-3 text-red-50">
                {errorMessage}
              </p>

              <div className="bg-red-700 bg-opacity-50 rounded-lg p-4 mb-3">
                <p className="font-semibold mb-2">
                  To enable microphone in {instructions.browser}:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-red-50">
                  {instructions.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                >
                  Retry Permission Request
                </button>
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="px-4 py-2 bg-red-700 bg-opacity-50 text-white rounded-lg font-semibold hover:bg-red-800 hover:bg-opacity-50 transition-colors"
                  >
                    I'll Fix This Later
                  </button>
                )}
              </div>
            </div>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-white hover:text-red-100 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
