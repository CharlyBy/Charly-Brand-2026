# Teil A - Fehlerbericht & Code-Review

> **Projekt:** charlybrand.de
> **Analysedatum:** 2026-02-07
> **Analyst:** KI-gestützte Code-Analyse
> **Status:** Abgeschlossen

---

## Zusammenfassung

13 Fehler identifiziert: **3 kritisch (Sicherheit/DSGVO)**, 5 hoch, 3 mittel, 2 niedrig.

---

## Tech-Stack Übersicht

| Komponente | Technologie | Version |
|---|---|---|
| Frontend | React | 19.1.1 |
| Build | Vite | ^5.0.0 |
| Backend | Express + tRPC | ^4.21.2 / ^11.6.0 |
| Datenbank | MySQL (Drizzle ORM) | mysql2 ^3.15.0 / drizzle-orm ^0.44.5 |
| KI | OpenAI API (Manus Forge) | ^4.104.0 |
| Payments | Stripe | ^20.1.0 |
| Styling | Tailwind CSS | ^4.x |
| Sprache | TypeScript | 5.9.3 |
| Hosting | Manus (Node.js, Deutschland) | - |

---

## Fehlertabelle

| # | Datei | Zeile | Schwere | Fehlerart | Beschreibung | Fix |
|---|---|---|---|---|---|---|
| 1 | `client/index.html` | 2 | MITTEL | SEO/Semantik | `lang="en"` statt `lang="de"` | `<html lang="de">` setzen |
| 2 | `client/src/lib/analytics.ts` | 6 | KRITISCH | Sicherheit/DSGVO | GA4 Measurement-ID `G-L30F3450BH` hardcoded im Quellcode | Via Env-Variable: `import.meta.env.VITE_GA_MEASUREMENT_ID` |
| 3 | `client/src/components/LunaChat.tsx` | 197 | NIEDRIG | React-Warnung | `speakText` in useEffect-Dependency ohne `useCallback` | `speakText` mit `useCallback` wrappen oder Dependency entfernen |
| 4 | `client/src/components/LunaChat.tsx` | 568 | NIEDRIG | Deprecation | `onKeyPress` deprecated | Ersetzen durch `onKeyDown={handleKeyPress}` |
| 5 | `client/src/lib/voice-tts.ts` | 31 | HOCH | Runtime-Fehler | `trpc.useUtils().client` außerhalb eines React-Hooks | Datei nicht im Einsatz (LunaChat nutzt `tts-simple.ts`); entfernen oder fixen |
| 6 | `server/_core/tts.ts` | 14 | KRITISCH | Sicherheit | OpenAI-Key-Fallback-Leak: fällt auf `ENV.forgeApiKey` zurück | Nur dedizierten Key `OPENAI_TTS_KEY` verwenden; Fallback entfernen |
| 7 | `client/src/components/CookieConsent.tsx` | 10 | KRITISCH | DSGVO-Verstoß | `analyticsEnabled` default `true` (Opt-in vorselektiert) | `useState(false)` setzen |
| 8 | `server/routers.ts` | 266 | MITTEL | Deprecation | `Math.random().toString(36).substr(2, 9)` - `substr` deprecated | Ersetzen durch `.substring(2, 11)` |
| 9 | `client/src/pages/Kontakt.tsx` | 102 | MITTEL | UX-Bug | Button "E-Mail schreiben" öffnet LunaChat statt E-Mail-Funktion | Button-Label/Action korrigieren |
| 10 | `client/src/components/SEO.tsx` | 19 | HOCH | Broken Reference | `og-image.jpg` nicht in `public/` vorhanden | OG-Image erstellen und in `public/` ablegen |
| 11 | `server/routers.ts` | 108-187 | HOCH | Sicherheit | `sendAnalysisPDF` ist `publicProcedure` | Auf `protectedProcedure` umstellen oder Rate-Limiting hinzufügen |
| 12 | `client/src/main.tsx` | 14-15 | HOCH | DSGVO | GA-Initialisierung basiert nur auf localStorage (manipulierbar) | Zusätzliche Validierung einbauen |
| 13 | `drizzle.config.ts` | 3-6 | HOCH | Sicherheits-Info | `DATABASE_URL` als Error-Text - Risiko in Produktions-Logs | Error-Message generischer formulieren |

---

## Detailbeschreibungen der kritischen Fehler

### Fehler #2 - GA4 ID hardcoded (KRITISCH)

**Problem:** Die Google Analytics Measurement-ID ist direkt im Quellcode eingebettet. Bei einem öffentlichen Repository wäre diese sichtbar und könnte missbraucht werden.

**Aktueller Code:**
```typescript
// client/src/lib/analytics.ts
const GA_MEASUREMENT_ID = 'G-L30F3450BH';
```

**Fix:**
```typescript
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (!GA_MEASUREMENT_ID) {
  console.warn('GA Measurement ID nicht konfiguriert');
  return;
}
```

### Fehler #6 - OpenAI Key Fallback (KRITISCH)

**Problem:** Der TTS-Service fällt auf den allgemeinen Forge-API-Key zurück, wenn kein dedizierter OpenAI-Key vorhanden ist. Dies könnte zu unbeabsichtigten Kosten und Sicherheitsrisiken führen.

**Aktueller Code:**
```typescript
// server/_core/tts.ts
const apiKey = process.env.OPENAI_TTS_KEY || process.env.OPENAI_API_KEY || ENV.forgeApiKey;
```

**Fix:**
```typescript
const apiKey = process.env.OPENAI_TTS_KEY || process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('Kein dedizierter TTS-API-Key konfiguriert');
}
```

### Fehler #7 - Cookie-Consent Opt-in (KRITISCH/DSGVO)

**Problem:** Der Analytics-Schalter im Cookie-Einstellungs-Dialog ist standardmäßig auf `true` gesetzt. Dies verstößt gegen DSGVO/TTDSG, da Opt-in nicht vorselektiert sein darf.

**Aktueller Code:**
```typescript
// client/src/components/CookieConsent.tsx
const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
```

**Fix:**
```typescript
const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
```

---

## Prioritäten-Matrix

| Priorität | Anzahl | Aktion |
|---|---|---|
| KRITISCH (sofort) | 3 | Fehler #2, #6, #7 - Sofort beheben |
| HOCH (1-2 Wochen) | 5 | Fehler #5, #10, #11, #12, #13 |
| MITTEL (Sprint) | 3 | Fehler #1, #8, #9 |
| NIEDRIG (Backlog) | 2 | Fehler #3, #4 |

---

## Nächste Schritte

1. [ ] Kritische Fehler #2, #6, #7 sofort beheben
2. [ ] OG-Image erstellen und einbinden (#10)
3. [ ] sendAnalysisPDF absichern (#11)
4. [ ] voice-tts.ts entfernen oder korrigieren (#5)
5. [ ] HTML lang-Attribut korrigieren (#1)
