import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import uploadRouter from "../upload";
import ttsRouter from "../tts-endpoint";
import sitemapRouter from "../sitemap";
import { generalApiRateLimiter, uploadRateLimiter } from "./rate-limiter";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ============================================================
  // Security Headers Middleware (OWASP Best Practices)
  // ============================================================
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME-type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // XSS Protection (legacy browsers)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer Policy - only send origin for cross-origin requests
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy - restrict access to sensitive browser features
    res.setHeader(
      'Permissions-Policy',
      'camera=(), geolocation=(), microphone=(self), payment=(self)'
    );

    // HSTS - enforce HTTPS (1 year, include subdomains)
    // Only set in production to avoid issues with local development
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // Content Security Policy
    // Tailored for charlybrand.de: allows CDN resources, Google Analytics,
    // Stripe, Lemniscus booking, and Umami analytics
    const cspDirectives = [
      "default-src 'self'",
      // Scripts: self, inline (for React hydration), eval (for dev), and trusted CDNs
      `script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com${process.env.UMAMI_SCRIPT_URL ? ' ' + new URL(process.env.UMAMI_SCRIPT_URL).origin : ''}`,
      // Styles: self, inline (for Tailwind/React), and CDN
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
      // Images: self, data URIs, and storage/CDN
      "img-src 'self' data: blob: https: http:",
      // Fonts: self and Google Fonts (fallback if local fonts fail)
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
      // Connect: API calls, analytics, Stripe
      `connect-src 'self' https://www.google-analytics.com https://api.stripe.com https://lemniscus.de${process.env.UMAMI_SCRIPT_URL ? ' ' + new URL(process.env.UMAMI_SCRIPT_URL).origin : ''}`,
      // Frames: only Stripe checkout
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      // Media: self and S3 storage for audio files
      "media-src 'self' blob: https:",
      // Base URI restriction
      "base-uri 'self'",
      // Form action restriction
      "form-action 'self'",
      // Object restriction (no Flash, etc.)
      "object-src 'none'",
    ];
    res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

    next();
  });

  // IMPORTANT: Stripe webhook must be registered BEFORE express.json()
  // to ensure signature verification works with raw body
  const { handleStripeWebhook } = await import('../stripe-webhook');
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Rate-limit upload endpoint
  app.use("/api/upload", uploadRateLimiter);
  // Upload endpoint for audio files
  app.use("/api", uploadRouter);
  // TTS endpoint
  app.use(ttsRouter);
  // Sitemap endpoint
  app.use(sitemapRouter);

  // Rate-limit tRPC API (general limiter for all API calls)
  app.use("/api/trpc", generalApiRateLimiter);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);

    // DSGVO: Automatischer Cleanup alter Daten beim Server-Start
    // Läuft asynchron im Hintergrund, blockiert nicht den Start
    scheduleDataCleanup();
  });
}

/**
 * DSGVO-konformer Daten-Cleanup
 * Wird beim Server-Start und dann alle 24 Stunden ausgeführt.
 * 
 * - Conversations + Messages: 90 Tage Aufbewahrung
 * - Enneagram-Analysen: 365 Tage Aufbewahrung
 */
async function scheduleDataCleanup() {
  async function runCleanup() {
    try {
      const { cleanupOldConversations, cleanupOldAnalyses } = await import('../db');

      console.log('[DSGVO Cleanup] Starting scheduled data cleanup...');
      
      const convResult = await cleanupOldConversations(90);
      console.log(`[DSGVO Cleanup] Conversations: ${convResult.deletedConversations} deleted, ${convResult.deletedMessages} messages removed`);
      
      const analysisCount = await cleanupOldAnalyses(365);
      console.log(`[DSGVO Cleanup] Analyses: ${analysisCount} deleted`);
      
      console.log('[DSGVO Cleanup] Cleanup complete');
    } catch (error) {
      console.error('[DSGVO Cleanup] Error during scheduled cleanup:', error);
    }
  }

  // Run initial cleanup after 30 seconds (let server stabilize first)
  setTimeout(runCleanup, 30_000);

  // Then run every 24 hours
  setInterval(runCleanup, 24 * 60 * 60 * 1000);
}

startServer().catch(console.error);
