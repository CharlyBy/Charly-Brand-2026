/**
 * OpenAI Text-to-Speech (TTS) Integration
 * 
 * Converts Luna's text responses into natural-sounding speech using OpenAI's TTS API.
 * Uses the "shimmer" voice for a warm, empathetic tone perfect for therapeutic conversations.
 */

import OpenAI from 'openai';
import { ENV } from './env';

// Initialize OpenAI client
// Note: TTS requires a real OpenAI API key, not Manus Forge API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_TTS_KEY || process.env.OPENAI_API_KEY || ENV.forgeApiKey,
  // Don't set baseURL to use OpenAI's default endpoint
});

export interface TTSOptions {
  text: string;
  voice?: 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer' | 'verse' | 'marin' | 'cedar';
  model?: 'gpt-4o-mini-tts' | 'tts-1' | 'tts-1-hd';
  speed?: number; // 0.25 to 4.0
  responseFormat?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
}

/**
 * Generate speech from text using OpenAI TTS
 * 
 * @param options - TTS configuration options
 * @returns Audio buffer that can be streamed to the client
 */
export async function generateSpeech(options: TTSOptions): Promise<Buffer> {
  const {
    text,
    voice = 'shimmer', // Default to shimmer for Luna's warm, empathetic tone
    model = 'tts-1', // Use standard TTS model
    speed = 1.0,
    responseFormat = 'mp3',
  } = options;

  try {
    const response = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      speed,
      response_format: responseFormat,
    });

    // Convert response to buffer
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('[TTS] Failed to generate speech:', error);
    throw new Error('Failed to generate speech');
  }
}

/**
 * Generate speech with streaming support for faster playback
 * 
 * @param options - TTS configuration options
 * @returns Readable stream of audio data
 */
export async function generateSpeechStream(options: TTSOptions) {
  const {
    text,
    voice = 'shimmer',
    model = 'tts-1',
    speed = 1.0,
    responseFormat = 'mp3',
  } = options;

  try {
    const response = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      speed,
      response_format: responseFormat,
    });

    // Return the response body as a stream
    return response.body;
  } catch (error) {
    console.error('[TTS] Failed to generate speech stream:', error);
    throw new Error('Failed to generate speech stream');
  }
}
