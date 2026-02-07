/**
 * Luna TTS API Endpoint – Optimiert fuer niedrige Latenz
 * 
 * Zwei Modi:
 * 1. POST /api/tts        – Einzelner Text → Audio (fuer kurze Texte)
 * 2. POST /api/tts/stream  – Satz-Chunking mit SSE (fuer lange Texte)
 *    Splittet Text in Saetze, generiert Audio fuer jeden Satz parallel,
 *    und streamt fertige Audio-Chunks sofort zum Client.
 * 
 * Primaer: Gemini TTS (Sulafat) → Fallback: OpenAI TTS (Shimmer)
 */

import { Router } from 'express';
import { generateSpeech } from './_core/tts.js';
import { ttsRateLimiter } from './_core/rate-limiter.js';

const router = Router();

// ============================================
// TEXT-BEREINIGUNG
// ============================================

function cleanTextForTTS(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/^\s*[-*]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    // Breites Emoji-Pattern fuer alle Unicode-Emojis
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}]/gu, '')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .trim();
}

/**
 * Splittet Text in natuerliche Saetze fuer TTS-Chunking.
 * Behaelt Satzzeichen bei fuer natuerliche Prosodie.
 * Merged zu kurze Saetze (unter 20 Zeichen) mit dem naechsten.
 */
function splitIntoSentences(text: string): string[] {
  // Split an Satzgrenzen: . ! ? gefolgt von Leerzeichen oder Ende
  const raw = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  
  if (raw.length === 0) return [text];
  if (raw.length === 1) return raw;
  
  // Kurze Fragmente mit dem naechsten Satz zusammenfuegen
  const merged: string[] = [];
  let buffer = '';
  
  for (const sentence of raw) {
    if (buffer) {
      buffer += ' ' + sentence;
      if (buffer.length >= 20) {
        merged.push(buffer);
        buffer = '';
      }
    } else if (sentence.length < 20 && merged.length < raw.length - 1) {
      buffer = sentence;
    } else {
      merged.push(sentence);
    }
  }
  
  if (buffer) {
    if (merged.length > 0) {
      merged[merged.length - 1] += ' ' + buffer;
    } else {
      merged.push(buffer);
    }
  }
  
  return merged;
}

// ============================================
// ROUTE 1: Einzel-TTS (einfach, fuer kurze Texte)
// ============================================

router.post('/api/tts', ttsRateLimiter, async (req, res) => {
  try {
    const { text, voice } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text ist erforderlich' });
    }

    const cleanText = cleanTextForTTS(text);
    if (!cleanText) {
      return res.status(400).json({ error: 'Kein verwertbarer Text nach Bereinigung' });
    }

    const truncatedText = cleanText.length > 2000 
      ? cleanText.substring(0, 2000) + '...' 
      : cleanText;

    console.log(`[TTS] Generiere Sprache (${truncatedText.length} Zeichen)...`);

    const result = await generateSpeech({ 
      text: truncatedText,
      voice: voice || undefined,
    });

    const contentType = result.format === 'wav' ? 'audio/wav' : 'audio/mpeg';

    res.set({
      'Content-Type': contentType,
      'Content-Length': String(result.buffer.length),
      'X-TTS-Provider': result.provider,
      'Cache-Control': 'no-store',
    });

    res.send(result.buffer);

  } catch (error: any) {
    console.error('[TTS] Fehler:', error?.message || error);
    const isConfigError = error?.message?.includes('nicht konfiguriert');
    res.status(isConfigError ? 503 : 500).json({ 
      error: isConfigError 
        ? 'Sprachausgabe ist momentan nicht verfuegbar.' 
        : 'Fehler bei der Sprachgenerierung. Bitte versuche es erneut.' 
    });
  }
});

// ============================================
// ROUTE 2: Satz-Chunking mit SSE (fuer lange Texte)
// ============================================
// 
// Ablauf:
// 1. Text in Saetze splitten
// 2. Alle Saetze PARALLEL an TTS senden
// 3. Sobald Satz N fertig → sofort als SSE-Event senden
// 4. Client spielt Saetze der Reihe nach ab
//
// Vorteil: Latenz = Zeit fuer den ERSTEN Satz (statt fuer den ganzen Text)

router.post('/api/tts/stream', ttsRateLimiter, async (req, res) => {
  try {
    const { text, voice } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text ist erforderlich' });
    }

    const cleanText = cleanTextForTTS(text);
    if (!cleanText) {
      return res.status(400).json({ error: 'Kein verwertbarer Text' });
    }

    // Text in Saetze splitten
    const sentences = splitIntoSentences(cleanText);
    
    console.log(`[TTS Stream] ${sentences.length} Saetze, starte parallele Generierung...`);

    // SSE-Header setzen
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Nginx: kein Buffering
    });

    // Alle Saetze PARALLEL generieren
    const promises = sentences.map(async (sentence, index) => {
      try {
        const result = await generateSpeech({
          text: sentence,
          voice: voice || undefined,
        });
        return { index, sentence, buffer: result.buffer, format: result.format, provider: result.provider };
      } catch (error: any) {
        console.error(`[TTS Stream] Satz ${index + 1} fehlgeschlagen:`, error?.message);
        return { index, sentence, buffer: null, format: null, provider: null };
      }
    });

    // Map fuer geordnete Auslieferung
    const results = new Map<number, { buffer: Buffer | null; format: string | null; provider: string | null; sentence: string }>();
    let nextToSend = 0;

    // Sende Info-Event mit Anzahl der Saetze
    res.write(`data: ${JSON.stringify({ type: 'info', totalChunks: sentences.length })}\n\n`);

    // Warte auf jedes Promise und sende sofort wenn in Reihenfolge
    const sendPending = () => {
      while (results.has(nextToSend)) {
        const result = results.get(nextToSend)!;
        
        if (result.buffer) {
          const audioBase64 = result.buffer.toString('base64');
          const event = {
            type: 'audio',
            index: nextToSend,
            format: result.format,
            provider: result.provider,
            audio: audioBase64,
            text: result.sentence,
          };
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        } else {
          // Fehlgeschlagenen Satz überspringen
          res.write(`data: ${JSON.stringify({ type: 'skip', index: nextToSend, text: result.sentence })}\n\n`);
        }
        
        results.delete(nextToSend);
        nextToSend++;
      }
    };

    // Alle Promises parallel ausfuehren, Ergebnisse einsammeln
    await Promise.all(
      promises.map(async (p) => {
        const result = await p;
        results.set(result.index, result);
        sendPending();
      })
    );

    // Ende-Signal
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (error: any) {
    console.error('[TTS Stream] Fehler:', error?.message || error);
    
    // Falls SSE-Header schon gesendet, sende Fehler als Event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'TTS-Fehler aufgetreten' })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: 'Fehler bei der Sprachgenerierung' });
    }
  }
});

// ============================================
// STATUS CHECK
// ============================================

router.get('/api/tts/status', (req, res) => {
  const geminiKey = process.env.GEMINI_TTS_KEY || process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_TTS_KEY || process.env.OPENAI_API_KEY;

  res.json({
    available: !!(geminiKey || openaiKey),
    provider: geminiKey ? 'gemini' : openaiKey ? 'openai' : 'none',
    voice: geminiKey ? 'Sulafat' : 'shimmer',
    streaming: true,
  });
});

export default router;
