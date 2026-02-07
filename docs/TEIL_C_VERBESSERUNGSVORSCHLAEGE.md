# Teil C - Verbesserungsvorschläge (Performance, SEO, Accessibility, Architektur)

> **Projekt:** charlybrand.de
> **Analysedatum:** 2026-02-07
> **Status:** Abgeschlossen

---

## Übersicht nach Priorität

| Priorität | Anzahl | Kategorie |
|---|---|---|
| KRITISCH (sofort) | 6 | Datenschutz & Sicherheit |
| HOCH (2 Wochen) | 6 | Sicherheit & Compliance |
| MITTEL (Sprint) | 4 | Performance & SEO |
| NIEDRIG (Backlog) | 3 | UX & Accessibility |

---

## KRITISCH - Sofort umsetzen

### 1. Google Fonts lokal hosten
**Problem:** Google Fonts werden von `fonts.googleapis.com` geladen. Bei jedem Seitenaufruf wird die IP-Adresse des Nutzers an Google übermittelt.
**Rechtslage:** LG München I (Az. 3 O 17493/20) - 100€ Schadensersatz pro Verstoß.
**Lösung:**
```bash
# Fonts herunterladen und lokal einbinden
# 1. google-webfonts-helper nutzen
# 2. Fonts in /client/public/fonts/ ablegen
# 3. CSS @font-face Regeln erstellen
# 4. Google Fonts Link aus client/index.html entfernen
```

**Betroffene Dateien:**
- `client/index.html` - Google Fonts Link entfernen
- `client/public/fonts/` - Neuer Ordner mit Font-Dateien
- `client/src/index.css` oder separate CSS - @font-face Regeln

### 2. Cookie-Consent Opt-in fixen
**Siehe Teil A, Fehler #7 und Teil B, Abschnitt 2.**

### 3. KI-Disclaimer im Luna-Chat
**Problem:** Keine Kennzeichnung, dass Antworten KI-generiert sind.
**Lösung:** Header-Hinweis in LunaChat.tsx:
```tsx
<p className="text-xs text-muted-foreground">
  KI-gestützte Assistentin · Kein Ersatz für therapeutische Beratung
</p>
```

### 4. Einwilligungs-Checkbox im Kontaktformular
**Problem:** Kontaktformular hat keine Datenschutz-Einwilligung.
**Lösung:**
```tsx
<label className="flex items-start gap-2">
  <input type="checkbox" required />
  <span className="text-sm">
    Ich habe die <Link to="/datenschutz">Datenschutzerklärung</Link> gelesen 
    und stimme der Verarbeitung meiner Daten zu. *
  </span>
</label>
```

### 5. Datenschutzerklärung ergänzen
**Siehe Teil B, Abschnitt 8 - Textvorschläge.**

### 6. Audiodateien nach Transkription löschen
**Problem:** Audio-Uploads verbleiben dauerhaft auf AWS S3.
**Lösung:** Nach erfolgreicher Transkription automatisch aus S3 löschen:
```typescript
// server/routers.ts - nach transcribeVoice
await storageDelete(audioUrl); // S3-Objekt löschen
```

---

## HOCH - Innerhalb von 2 Wochen

### 7. Security-Header implementieren
**Problem:** Keine HTTP-Security-Header gesetzt.
**Lösung in Express:**
```typescript
// server/_core/index.ts
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

### 8. Rate-Limiting für öffentliche Endpunkte
**Problem:** Luna-Chat, Kontaktformular ohne Rate-Limiting - Missbrauchsrisiko.
**Lösung:**
```typescript
import rateLimit from 'express-rate-limit';
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 50, // Max 50 Anfragen pro IP
  message: 'Zu viele Anfragen. Bitte versuche es später erneut.'
});
app.use('/api/trpc/luna.chat', chatLimiter);
```

### 9. sendAnalysisPDF absichern
**Siehe Teil A, Fehler #11.**

### 10. HTML lang-Attribut korrigieren
**Siehe Teil A, Fehler #1.**

### 11. OG-Image für Social Sharing erstellen
**Problem:** `/og-image.jpg` referenziert, aber nicht vorhanden.
**Lösung:** OG-Image (1200x630px) erstellen mit Charly Brand Branding.

### 12. GA4 vs Umami klären
**Problem:** Zwei Analytics-Systeme parallel (`analytics.ts` + Umami in `index.html`).
**Empfehlung:** 
- **Umami** als DSGVO-freundliche Alternative behalten (self-hosted möglich)
- **GA4** nur mit Consent verwenden
- Oder: nur eines verwenden, um Komplexität zu reduzieren

---

## MITTEL - Performance & SEO

### 13. Lazy Loading / Code-Splitting
**Problem:** Alle Seiten werden beim initialen Load geladen.
**Lösung:**
```typescript
// client/src/App.tsx
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const KnowledgeArticle = lazy(() => import('./pages/KnowledgeArticle'));
// ... weitere Pages
```
**Erwarteter Effekt:** Initial Bundle -40%, LCP -1-2s

### 14. WebP-Bilder statt PNG
**Problem:** Bilder in PNG-Format (z.B. charly.png, logo.png).
**Lösung:**
```bash
# Konvertierung
cwebp client/public/images/charly.png -o client/public/images/charly.webp -q 85
```
**Erwarteter Effekt:** Bildgröße -60-80%

### 15. Sitemap.xml für SPA
**Problem:** Statische Sitemap funktioniert nicht optimal mit Client-Side-Rendering.
**Lösung:** Server-seitig generierte Sitemap (bereits in `server/sitemap.ts`), aber prüfen ob alle Routen enthalten sind:
- Alle 20+ Seiten-Routen aus App.tsx
- Dynamische Wissensartikel-URLs
- lastmod-Daten aktuell halten

### 16. robots.txt optimieren
**Status:** Grundsätzlich OK, aber prüfen:
- `/admin/` und `/api/` korrekt blockiert ✅
- Sitemap-URL korrekt ✅
- Crawl-Delay für Google nicht nötig

---

## NIEDRIG - Nice-to-have

### 17. Lighthouse-Score optimieren
**Erwartete Probleme:**
- CLS durch fehlende Bildgrößen-Attribute
- LCP durch große Hero-Bilder
- FID durch große JS-Bundles

**Quick Wins:**
```html
<!-- Bildgrößen angeben -->
<img src="/images/charly.png" width="400" height="500" alt="Charly Brand" />
```

### 18. ARIA-Labels konsistent
**Problem:** Einige interaktive Elemente ohne ARIA-Labels.
**Betroffene Komponenten:**
- Luna-Chat Toggle-Button
- Mobile Navigation Toggle
- Cookie-Consent Buttons
- Formular-Felder

**Fix-Beispiel:**
```tsx
<button aria-label="Luna Chat öffnen" aria-expanded={isOpen}>
```

### 19. Focus-Management im Luna-Chat
**Problem:** Kein Focus-Trapping im offenen Chat-Dialog.
**Lösung:** Focus-Trap-Bibliothek oder eigene Implementation für barrierefreie Navigation.

---

## Architektur-Hinweise

### Positiv ✅
- Saubere tRPC-basierte API-Architektur
- Gute Trennung von Server/Client/Shared
- TypeScript durchgehend verwendet
- Drizzle ORM für typsichere DB-Zugriffe
- Stripe-Integration professionell (Webhook mit Raw-Body)
- RAG-System für Wissensartikel vorhanden
- Enneagramm-System gut strukturiert

### Verbesserungspotential ⚠️
- Keine Unit-Tests (vitest konfiguriert, aber kaum Tests)
- Keine E2E-Tests
- Error-Handling teilweise inkonsistent
- Logging ohne strukturiertes Format
- Keine Health-Check-Endpoints
- Keine API-Versionierung
- `.manus/db/` enthält Debug-Daten (DB-Query-Logs) - sollte in .gitignore
