/**
 * Luna TTS API Endpoint
 * 
 * POST /api/tts
 * Body: { text: string, voice?: string }
 * Response: Audio-Binary (WAV oder MP3) als Stream
 * 
 * Primaer: Gemini TTS (Sulafat) → Fallback: OpenAI TTS (Shimmer)
 */

import { Router } from 'express';
import { generateSpeech } from './_core/tts.js';
import { ttsRateLimiter } from './_core/rate-limiter.js';

const router = Router();

// Markdown/Formatierung bereinigen fuer natuerlichere Sprachausgabe
function cleanTextForTTS(text: string): string {
  return text
    // Markdown-Headers entfernen
    .replace(/#{1,6}\s*/g, '')
    // Bold/Italic entfernen
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // Links entfernen, nur Text behalten
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Code-Blöcke entfernen
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    // Aufzaehlungszeichen vereinfachen
    .replace(/^\s*[-*]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    // Emojis und Sonderzeichen entfernen
    .replace(/[✓✅❌⚠️🎉📧🎵👋➡️💜🌟✨💫🙏❤️😊🤗💪🌈]/g, '')
    // URLs entfernen
    .replace(/https?:\/\/[^\s]+/g, '')
    // Doppelte Leerzeichen entfernen
    .replace(/\s+/g, ' ')
    // Doppelte Zeilenumbrueche zu Pausen
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .trim();
}

/**
 * TTS API Route
 * 
 * Liefert Audio direkt als Binary-Stream (kein Base64-Overhead).
 * Content-Type wird passend gesetzt (audio/wav oder audio/mpeg).
 * 
 * Max. 2000 Zeichen pro Request (Schutz vor Missbrauch).
 */
router.post('/api/tts', ttsRateLimiter, async (req, res) => {
  try {
    const { text, voice } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text ist erforderlich' });
    }

    // Text bereinigen
    const cleanText = cleanTextForTTS(text);

    if (!cleanText || cleanText.length === 0) {
      return res.status(400).json({ error: 'Kein verwertbarer Text nach Bereinigung' });
    }

    // Max. 2000 Zeichen (Schutz + Gemini-Limit)
    const truncatedText = cleanText.length > 2000 
      ? cleanText.substring(0, 2000) + '...' 
      : cleanText;

    console.log(`[TTS Endpoint] Generiere Sprache (${truncatedText.length} Zeichen)...`);

    const result = await generateSpeech({ 
      text: truncatedText,
      voice: voice || undefined,
    });

    // Content-Type passend zum Provider setzen
    const contentType = result.format === 'wav' ? 'audio/wav' : 'audio/mpeg';

    res.set({
      'Content-Type': contentType,
      'Content-Length': String(result.buffer.length),
      'X-TTS-Provider': result.provider,
      'Cache-Control': 'no-store', // Audio nie cachen (DSGVO)
    });

    res.send(result.buffer);

  } catch (error: any) {
    console.error('[TTS Endpoint] Fehler:', error?.message || error);
    
    // Nutzerfreundliche Fehlermeldung
    const isConfigError = error?.message?.includes('nicht konfiguriert');
    res.status(isConfigError ? 503 : 500).json({ 
      error: isConfigError 
        ? 'Sprachausgabe ist momentan nicht verfuegbar.' 
        : 'Fehler bei der Sprachgenerierung. Bitte versuche es erneut.' 
    });
  }
});

/**
 * TTS Status Check (GET)
 * Prüft ob TTS verfuegbar ist (mind. ein API-Key gesetzt)
 */
router.get('/api/tts/status', (req, res) => {
  const geminiKey = process.env.GEMINI_TTS_KEY || process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_TTS_KEY || process.env.OPENAI_API_KEY;

  res.json({
    available: !!(geminiKey || openaiKey),
    provider: geminiKey ? 'gemini' : openaiKey ? 'openai' : 'none',
    voice: geminiKey ? 'Sulafat' : 'shimmer',
  });
});

export default router;
