/**
 * Voice utilities for Luna Chat
 * - Audio recording using MediaRecorder API
 * - Text-to-Speech using Web Speech API
 */

// Check if browser supports Audio Recording
export const isAudioRecordingSupported = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// Check if browser supports Speech Synthesis
export const isSpeechSynthesisSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

/**
 * Audio Recording: Record audio from microphone
 * @param onStop - Callback when recording stops with audio blob
 * @param onError - Callback when error occurs
 * @returns MediaRecorder instance (can be used to stop)
 */
export const startAudioRecording = (
  onStop: (audioBlob: Blob) => void,
  onError: (error: string) => void
): Promise<MediaRecorder | null> => {
  if (!isAudioRecordingSupported()) {
    onError('Audioaufnahme wird in diesem Browser nicht unterstützt');
    return Promise.resolve(null);
  }

  return navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioChunks: Blob[] = [];
      
      // Use webm format for better browser compatibility
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      } catch (e) {
        // Fallback to default mime type if webm is not supported
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        onStop(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      return mediaRecorder;
    })
    .catch(error => {
      let errorMessage = 'Fehler beim Zugriff auf das Mikrofon';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff in deinen Browser-Einstellungen.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Kein Mikrofon gefunden. Bitte überprüfe deine Geräteeinstellungen.';
      }
      
      onError(errorMessage);
      return null;
    });
};

/**
 * Text-to-Speech: Speak text aloud
 * @param text - Text to speak
 * @param onEnd - Callback when speech ends
 * @param onError - Callback when error occurs
 */
export const speakText = (
  text: string,
  onEnd?: () => void,
  onError?: (error: string) => void
): void => {
  if (!isSpeechSynthesisSupported()) {
    onError?.('Text-to-Speech is not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure voice settings
  utterance.lang = 'de-DE'; // German language
  utterance.rate = 0.95; // Slightly slower for better understanding
  utterance.pitch = 1.0; // Normal pitch
  utterance.volume = 1.0; // Full volume

  // Try to find a German female voice
  const voices = window.speechSynthesis.getVoices();
  const germanVoice = voices.find(voice => 
    voice.lang.startsWith('de') && voice.name.toLowerCase().includes('female')
  ) || voices.find(voice => voice.lang.startsWith('de'));
  
  if (germanVoice) {
    utterance.voice = germanVoice;
  }

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (event) => {
    onError?.(`Fehler beim Vorlesen: ${event.error}`);
  };

  window.speechSynthesis.speak(utterance);
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = (): void => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Check if currently speaking
 */
export const isSpeaking = (): boolean => {
  return isSpeechSynthesisSupported() && window.speechSynthesis.speaking;
};
