/**
 * Simple in-memory rate limiter for Express
 * 
 * Schützt kritische Endpunkte vor Missbrauch:
 * - Luna-Chat: max 20 Nachrichten/Minute pro IP
 * - Kontaktformular: max 3 Anfragen/Stunde pro IP
 * - Voice Transcription: max 10 Anfragen/Minute pro IP
 * - TTS: max 15 Anfragen/Minute pro IP
 * 
 * Für Produktivumgebung empfohlen: Redis-basiertes Rate-Limiting
 */

import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [, store] of stores) {
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }
}, 5 * 60 * 1000);

function getClientIP(req: Request): string {
  // Trust X-Forwarded-For when behind a reverse proxy (Cloudflare, nginx)
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Creates a rate-limiting middleware
 * 
 * @param storeName - Unique name for this limiter's store
 * @param maxRequests - Maximum requests in the time window
 * @param windowMs - Time window in milliseconds
 * @param message - Error message to return when rate-limited
 */
export function createRateLimiter(
  storeName: string,
  maxRequests: number,
  windowMs: number,
  message = 'Zu viele Anfragen. Bitte versuche es später erneut.'
) {
  if (!stores.has(storeName)) {
    stores.set(storeName, new Map());
  }
  const store = stores.get(storeName)!;

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIP(req);
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      // New window
      store.set(ip, { count: 1, resetAt: now + windowMs });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      return res.status(429).json({ error: message });
    }

    // Increment counter
    entry.count++;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - entry.count);
    next();
  };
}

// Pre-configured rate limiters for specific endpoints
// Luna-Chat: 20 messages per minute
export const chatRateLimiter = createRateLimiter(
  'luna-chat',
  20,
  60 * 1000,
  'Du sendest zu viele Nachrichten. Bitte warte einen Moment.'
);

// Kontaktformular: 3 submissions per hour
export const contactRateLimiter = createRateLimiter(
  'contact-form',
  3,
  60 * 60 * 1000,
  'Du hast zu viele Nachrichten gesendet. Bitte versuche es in einer Stunde erneut.'
);

// Voice Transcription: 10 per minute
export const voiceRateLimiter = createRateLimiter(
  'voice-transcription',
  10,
  60 * 1000,
  'Zu viele Sprachaufnahmen. Bitte warte einen Moment.'
);

// TTS: 15 per minute
export const ttsRateLimiter = createRateLimiter(
  'tts',
  15,
  60 * 1000,
  'Zu viele Sprachausgaben. Bitte warte einen Moment.'
);

// General API: 100 per minute
export const generalApiRateLimiter = createRateLimiter(
  'general-api',
  100,
  60 * 1000,
  'Zu viele Anfragen. Bitte versuche es später erneut.'
);

// Upload: 5 per minute
export const uploadRateLimiter = createRateLimiter(
  'upload',
  5,
  60 * 1000,
  'Zu viele Uploads. Bitte warte einen Moment.'
);
