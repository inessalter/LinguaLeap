const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export type VoiceModel = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export type ProcessingStatus = 'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking' | 'error';

export class OpenAIVoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isRecording = false;
  public stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private chunkInterval: number | null = null;
  private abortController: AbortController | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private onChunkCallback: ((blob: Blob) => void) | null = null;

  async requestMicrophonePermission(): Promise<MediaStream | null> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support microphone access');
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      console.log('Microphone permission granted');
      return this.stream;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          throw new Error('Microphone permission denied');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No microphone found');
        } else if (error.name === 'NotReadableError') {
          throw new Error('Microphone is already in use');
        }
      }
      throw new Error('Failed to access microphone');
    }
  }

  getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return '';
  }

  async startRecording(): Promise<void> {
    try {
      if (!this.stream) {
        this.stream = await this.requestMicrophonePermission();
      }

      if (!this.stream) {
        throw new Error('No audio stream available');
      }

      const mimeType = this.getSupportedMimeType();
      if (!mimeType) {
        throw new Error('No supported audio format found');
      }

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      console.log('Recording started with mime type:', mimeType);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async startStreamingRecording(onChunk: (blob: Blob) => void): Promise<void> {
    try {
      if (!this.stream) {
        this.stream = await this.requestMicrophonePermission();
      }

      if (!this.stream) {
        throw new Error('No audio stream available');
      }

      const mimeType = this.getSupportedMimeType();
      if (!mimeType) {
        throw new Error('No supported audio format found');
      }

      this.onChunkCallback = onChunk;
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Audio chunk available, size:', event.data.size);
          if (this.onChunkCallback) {
            this.onChunkCallback(event.data);
          }
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };

      this.mediaRecorder.start(1500);
      this.isRecording = true;
      console.log('Streaming recording started with 1.5s chunks');
    } catch (error) {
      console.error('Error starting streaming recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.isRecording = false;
        console.log('Recording stopped, blob size:', audioBlob.size);
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  setupAudioAnalyser(stream: MediaStream): AnalyserNode {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (!this.analyser) {
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
    }

    return this.analyser;
  }

  isAnalyserReady(): boolean {
    return this.analyser !== null;
  }

  getAudioLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    return Math.min(100, (average / 128) * 100);
  }

  startAudioLevelMonitoring(callback: (level: number) => void): void {
    const monitor = () => {
      const level = this.getAudioLevel();
      callback(level);
      this.animationFrameId = requestAnimationFrame(monitor);
    };
    monitor();
  }

  stopAudioLevelMonitoring(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!API_KEY || API_KEY === 'your_openai_api_key_here') {
      console.log('No API key, using simulated transcription');
      return this.simulateTranscription();
    }

    try {
      console.log('Starting transcription, blob size:', audioBlob.size, 'type:', audioBlob.type);

      const formData = new FormData();
      const filename = audioBlob.type.includes('webm') ? 'audio.webm' :
                      audioBlob.type.includes('mp4') ? 'audio.mp4' :
                      audioBlob.type.includes('ogg') ? 'audio.ogg' : 'audio.webm';

      formData.append('file', audioBlob, filename);
      formData.append('model', 'whisper-1');

      console.log('Sending transcription request to OpenAI...');
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Transcription API error:', response.status, errorText);
        throw new Error(`Transcription failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Transcription successful:', data.text);
      return data.text || 'No transcription available';
    } catch (error) {
      console.error('Error transcribing audio:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      return this.simulateTranscription();
    }
  }

  async generateAIResponse(
    conversationHistory: Array<{ role: string; content: string }>,
    topic: string
  ): Promise<string> {
    if (!API_KEY || API_KEY === 'your_openai_api_key_here') {
      console.log('No API key, using simulated AI response');
      return this.simulateAIResponse();
    }

    try {
      console.log('Generating AI response for conversation with', conversationHistory.length, 'messages');

      this.abortController = new AbortController();

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a friendly, conversational language learning partner helping someone practice English. The conversation topic is: "${topic}". Keep responses brief (2-3 sentences max), natural, and encouraging. Ask follow-up questions to keep the conversation flowing naturally, like a real conversation. Be supportive and help the learner feel confident.`,
            },
            ...conversationHistory,
          ],
          max_tokens: 120,
          temperature: 0.8,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI response API error:', response.status, errorText);
        throw new Error(`AI response failed: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;
      console.log('AI response generated:', aiMessage);
      return aiMessage || this.simulateAIResponse();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('AI response request aborted');
        throw error;
      }
      console.error('Error generating AI response:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      return this.simulateAIResponse();
    } finally {
      this.abortController = null;
    }
  }

  async generateFeedback(
    transcript: string,
    duration: number,
    topic: string
  ): Promise<{
    fluency: number;
    vocabulary: number;
    tone: number;
    fluencyComment: string;
    vocabularyComment: string;
    toneComment: string;
    overallNotes: string;
  }> {
    if (!API_KEY || API_KEY === 'your_openai_api_key_here') {
      console.log('No API key, using simulated feedback');
      return this.simulateFeedback();
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert language learning coach analyzing a conversation transcript. Provide scores (0-100) and encouraging feedback for three areas: fluency, vocabulary, and tone. Format your response as JSON with this structure:
{
  "fluency": <number 0-100>,
  "vocabulary": <number 0-100>,
  "tone": <number 0-100>,
  "fluencyComment": "<1-2 sentence encouraging comment>",
  "vocabularyComment": "<1-2 sentence encouraging comment>",
  "toneComment": "<1-2 sentence encouraging comment>",
  "overallNotes": "<2-3 sentence overall encouraging summary>"
}

Be positive and constructive. Focus on what the learner did well while offering gentle suggestions for improvement.`,
            },
            {
              role: 'user',
              content: `Analyze this ${duration}-minute conversation about "${topic}":\n\n${transcript}\n\nProvide scores and feedback.`,
            },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`Feedback generation failed: ${response.status}`);
      }

      const data = await response.json();
      const feedback = JSON.parse(data.choices[0].message.content);
      return feedback;
    } catch (error) {
      console.error('Error generating feedback:', error);
      return this.simulateFeedback();
    }
  }

  private simulateFeedback() {
    const fluency = 75 + Math.floor(Math.random() * 20);
    const vocabulary = 70 + Math.floor(Math.random() * 25);
    const tone = 78 + Math.floor(Math.random() * 18);

    return {
      fluency,
      vocabulary,
      tone,
      fluencyComment: "You're speaking smoothly and naturally!",
      vocabularyComment: "Nice variety in your expressions!",
      toneComment: "Your conversational tone is warm and engaging!",
      overallNotes: "Great job! You're making steady progress with each conversation.",
    };
  }

  async synthesizeSpeech(text: string, voice: VoiceModel = 'nova'): Promise<Blob | null> {
    if (!API_KEY || API_KEY === 'your_openai_api_key_here') {
      console.log('No API key, skipping speech synthesis');
      return null;
    }

    try {
      console.log('Synthesizing speech for text:', text.substring(0, 50) + '...');

      this.abortController = new AbortController();

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice,
          speed: 1.0,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Speech synthesis API error:', response.status, errorText);
        throw new Error('Speech synthesis failed');
      }

      const audioBlob = await response.blob();
      console.log('Speech synthesis successful, blob size:', audioBlob.size);
      return audioBlob;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Speech synthesis request aborted');
        throw error;
      }
      console.error('Error synthesizing speech:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      return null;
    } finally {
      this.abortController = null;
    }
  }

  async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      const audio = new Audio(URL.createObjectURL(audioBlob));
      this.currentAudio = audio;

      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = () => {
        this.currentAudio = null;
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch((error) => {
        console.error('Audio play failed:', error);
        this.currentAudio = null;
        reject(error);
      });
    });
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  private simulateTranscription(): string {
    const responses = [
      "I think this is a really interesting topic to discuss.",
      "From my perspective, there are several important factors to consider.",
      "That's a great point. I'd like to add that...",
      "Could you elaborate on that a bit more?",
      "I've been thinking about this recently, and I believe...",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private simulateAIResponse(): string {
    const responses = [
      "That's a fascinating perspective! What made you think about it that way?",
      "I completely understand. Can you give me an example of what you mean?",
      "That's really interesting. Have you considered how this might affect...?",
      "Great point! This reminds me of another aspect we should explore.",
      "I appreciate you sharing that. What do you think would be the ideal solution?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  stopMicrophoneStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        console.log('Microphone track stopped:', track.label);
      });
      this.stream = null;
    }
  }

  abortPendingRequests(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  cleanup(): void {
    this.stopAudioLevelMonitoring();
    this.stopMicrophoneStream();
    this.stopAudio();
    this.abortPendingRequests();

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    if (this.chunkInterval) {
      clearInterval(this.chunkInterval);
      this.chunkInterval = null;
    }

    this.mediaRecorder = null;
    this.analyser = null;
    this.audioContext = null;
    this.onChunkCallback = null;
    console.log('OpenAI Voice Service cleaned up');
  }
}
