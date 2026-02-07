/**
 * OpenAI TTS Voice Integration for Luna
 * 
 * Provides text-to-speech functionality using OpenAI's TTS API
 * with the "shimmer" voice for a warm, empathetic tone.
 */

import { trpc } from './trpc';

// Current audio element for playback
let currentAudio: HTMLAudioElement | null = null;

/**
 * Speak text using OpenAI TTS (Shimmer voice)
 * 
 * @param text - Text to convert to speech
 * @param voice - Voice to use (default: shimmer)
 * @param speed - Speech speed (0.25 to 4.0, default: 1.0)
 */
export async function speakTextWithTTS(
  text: string,
  voice: 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer' | 'verse' | 'marin' | 'cedar' = 'shimmer',
  speed: number = 1.0
): Promise<void> {
  // Stop any currently playing audio
  stopSpeaking();

  try {
    // Call backend TTS endpoint
    const client = trpc.useUtils().client;
    const response = await client.luna.textToSpeech.mutate({
      text,
      voice,
      speed,
    });

    // Convert base64 to audio blob
    const audioBlob = base64ToBlob(response.audio, 'audio/mpeg');
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create and play audio element
    currentAudio = new Audio(audioUrl);
    
    // Cleanup URL when audio ends
    currentAudio.addEventListener('ended', () => {
      URL.revokeObjectURL(audioUrl);
    });

    // Play audio
    await currentAudio.play();
  } catch (error) {
    console.error('[TTS] Failed to speak text:', error);
    throw error;
  }
}

/**
 * Stop currently playing speech
 */
export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/**
 * Check if TTS is currently speaking
 */
export function isSpeaking(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Check if TTS is supported (always true for OpenAI TTS)
 */
export function isTTSSupported(): boolean {
  return true;
}
