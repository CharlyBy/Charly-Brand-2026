import { Router } from 'express';
import { generateSpeech } from './_core/tts.js';

const router = Router();

router.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'shimmer', speed = 1.0 } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Generate speech
    const audioBuffer = await generateSpeech({ text, voice: voice as any, speed });
    const audioBase64 = audioBuffer.toString('base64');

    // Return as JSON with base64 audio
    res.json({ audio: audioBase64 });
  } catch (error: any) {
    console.error('[TTS Endpoint] Error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

export default router;
