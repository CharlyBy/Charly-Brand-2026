/**
 * Luna Text-to-Speech (TTS) Integration
 * 
 * Primaer: Google Gemini 2.5 Flash TTS mit "Sulafat" Stimme (warm, empathisch)
 * Fallback: OpenAI TTS mit "shimmer" Stimme
 * 
 * Gemini TTS liefert PCM-Rohdaten (24kHz, 16-bit, mono)
 * die serverseitig zu WAV konvertiert werden.
 */

/**
 * Gemini TTS Konfiguration
 * 
 * Verfuegbare Stimmen (Auswahl fuer therapeutischen Kontext):
 * - Sulafat: Warm (STANDARD fuer Luna)
 * - Aoede: Breezy/Luftig
 * - Achernar: Soft/Weich
 * - Kore: Firm/Bestimmt
 * - Leda: Youthful/Jugendlich
 * 
 * Alle 30 Stimmen: https://ai.google.dev/gemini-api/docs/speech-generation#voices
 */

const GEMINI_TTS_CONFIG = {
  model: 'gemini-2.5-flash-preview-tts',
  voice: 'Sulafat',  // Warm – ideal fuer empathische Gespraeche
  apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  sampleRate: 24000,
  channels: 1,
  bitDepth: 16,
} as const;

// Luna-spezifischer Prompt fuer natuerliche, empathische Sprachausgabe
const LUNA_VOICE_PROMPT = `
### DIRECTOR'S NOTES
Style: Warm, empathisch und beruhigend. Wie eine einfuehlsame Therapeutin, die 
zuhört und versteht. Sanft aber klar. Die Stimme strahlt Geborgenheit und 
Verstaendnis aus.
Pacing: Ruhig und bedacht. Keine Hektik. Kurze, natuerliche Pausen zwischen 
Saetzen. Langsamer als Alltagssprache.
Accent: Natuerliches, klares Deutsch.

### TRANSCRIPT
`.trim();

export interface TTSOptions {
  text: string;
  voice?: string;
  speed?: number;
  responseFormat?: 'mp3' | 'wav' | 'opus' | 'aac' | 'flac' | 'pcm';
  model?: string;
}

// ============================================
// KEY-AUFLOESUNG
// ============================================

function getGeminiApiKey(): string | null {
  return process.env.GEMINI_TTS_KEY 
    || process.env.GEMINI_API_KEY 
    || null;
}

function getOpenAIApiKey(): string | null {
  return process.env.OPENAI_TTS_KEY 
    || process.env.OPENAI_API_KEY 
    || null;
}

let _keyWarningLogged = false;
function logKeyStatus(): void {
  if (_keyWarningLogged) return;
  _keyWarningLogged = true;

  const geminiKey = getGeminiApiKey();
  const openaiKey = getOpenAIApiKey();

  if (geminiKey) {
    console.log('[TTS] Gemini TTS konfiguriert (Sulafat-Stimme)');
  } else if (openaiKey) {
    console.log('[TTS] OpenAI TTS als Fallback konfiguriert (shimmer-Stimme)');
  } else {
    console.warn('[TTS] WARNUNG: Weder GEMINI_TTS_KEY/GEMINI_API_KEY noch OPENAI_TTS_KEY/OPENAI_API_KEY gesetzt. TTS nicht verfuegbar.');
  }
}

// ============================================
// WAV-HEADER ERSTELLEN (fuer PCM → WAV Konvertierung)
// ============================================

function createWavHeader(pcmDataLength: number): Buffer {
  const header = Buffer.alloc(44);
  const { sampleRate, channels, bitDepth } = GEMINI_TTS_CONFIG;
  const byteRate = sampleRate * channels * (bitDepth / 8);
  const blockAlign = channels * (bitDepth / 8);

  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmDataLength, 4);
  header.write('WAVE', 8);

  // fmt sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);       // Subchunk size
  header.writeUInt16LE(1, 20);        // Audio format (PCM)
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);

  // data sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(pcmDataLength, 40);

  return header;
}

// ============================================
// GEMINI TTS (Primaer)
// ============================================

async function generateSpeechGemini(options: TTSOptions): Promise<Buffer> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nicht konfiguriert');
  }

  const { text, voice = GEMINI_TTS_CONFIG.voice } = options;

  // Baue den Prompt: Regieanweisung + Text
  const fullPrompt = `${LUNA_VOICE_PROMPT}\n${text}`;

  const requestBody = {
    contents: [{
      parts: [{
        text: fullPrompt,
      }],
    }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voice,
          },
        },
      },
    },
  };

  const url = `${GEMINI_TTS_CONFIG.apiUrl}/${GEMINI_TTS_CONFIG.model}:generateContent?key=${apiKey}`;

  console.log(`[TTS Gemini] Generiere Sprache (Stimme: ${voice}, ${text.length} Zeichen)...`);
  const startTime = Date.now();

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Gemini TTS API Fehler (${response.status}): ${errorBody.substring(0, 300)}`);
  }

  const data = await response.json() as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: {
            data: string;
            mimeType: string;
          };
        }>;
      };
    }>;
  };

  const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) {
    throw new Error('Gemini TTS: Keine Audio-Daten in der Antwort');
  }

  // PCM Base64 → Buffer
  const pcmBuffer = Buffer.from(audioData, 'base64');

  // PCM → WAV konvertieren (Browser braucht WAV-Header)
  const wavHeader = createWavHeader(pcmBuffer.length);
  const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);

  const duration = Date.now() - startTime;
  console.log(`[TTS Gemini] Fertig in ${duration}ms (${wavBuffer.length} Bytes WAV)`);

  return wavBuffer;
}

// ============================================
// OPENAI TTS (Fallback)
// ============================================

async function generateSpeechOpenAI(options: TTSOptions): Promise<Buffer> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY nicht konfiguriert');
  }

  const {
    text,
    voice = 'shimmer',
    speed = 1.0,
    responseFormat = 'mp3',
    model = 'tts-1',
  } = options;

  console.log(`[TTS OpenAI] Fallback: Generiere Sprache (Stimme: ${voice}, ${text.length} Zeichen)...`);

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      speed,
      response_format: responseFormat,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`OpenAI TTS API Fehler (${response.status}): ${errorBody.substring(0, 300)}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// ============================================
// HAUPTFUNKTION (Gemini mit OpenAI-Fallback)
// ============================================

/**
 * Generiert Sprache aus Text.
 * Primaer: Gemini TTS (Sulafat) → Fallback: OpenAI TTS (Shimmer)
 * 
 * @returns Audio-Buffer (WAV bei Gemini, MP3 bei OpenAI)
 */
export async function generateSpeech(options: TTSOptions): Promise<{
  buffer: Buffer;
  format: 'wav' | 'mp3';
  provider: 'gemini' | 'openai';
}> {
  logKeyStatus();

  const geminiKey = getGeminiApiKey();
  const openaiKey = getOpenAIApiKey();

  // Versuch 1: Gemini TTS
  if (geminiKey) {
    try {
      const buffer = await generateSpeechGemini(options);
      return { buffer, format: 'wav', provider: 'gemini' };
    } catch (error) {
      console.error('[TTS] Gemini fehlgeschlagen, versuche OpenAI-Fallback:', 
        error instanceof Error ? error.message : error);
    }
  }

  // Versuch 2: OpenAI TTS (Fallback)
  if (openaiKey) {
    try {
      const buffer = await generateSpeechOpenAI(options);
      return { buffer, format: 'mp3', provider: 'openai' };
    } catch (error) {
      console.error('[TTS] OpenAI Fallback ebenfalls fehlgeschlagen:', 
        error instanceof Error ? error.message : error);
      throw new Error('Sprachausgabe nicht verfuegbar. Bitte spaeter erneut versuchen.');
    }
  }

  throw new Error('TTS nicht konfiguriert: Weder GEMINI_API_KEY noch OPENAI_API_KEY gesetzt.');
}

/**
 * Legacy-Wrapper fuer Abwaertskompatibilitaet mit altem Interface
 * (gibt nur Buffer zurueck wie die alte Funktion)
 */
export async function generateSpeechBuffer(options: TTSOptions): Promise<Buffer> {
  const result = await generateSpeech(options);
  return result.buffer;
}
