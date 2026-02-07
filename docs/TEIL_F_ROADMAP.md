# Teil F - Priorisierte Roadmap

> **Projekt:** charlybrand.de
> **Analysedatum:** 2026-02-07
> **Status:** Abgeschlossen - Roadmap erstellt

---

## Gesamtübersicht

```
Phase 1 ──▶ Phase 2 ──▶ Phase 3 ──▶ Phase 4 ──▶ Phase 5
DSGVO &      Sicherheit   Luna Voice   Performance  Hosting &
Datenschutz  & Backend     Funktion     & SEO        Zukunft
(SOFORT)     (1-2 Wo.)    (2-3 Wo.)    (4-6 Wo.)    (3-6 Mo.)
```

---

## Phase 1: Datenschutz & DSGVO-Konformität (SOFORT - Woche 1)

**Priorität: 🔴 KRITISCH**
**Begründung:** Rechtliche Risiken, Abmahnungsgefahr, DSGVO-Bußgelder

| # | Aufgabe | Datei(en) | Aufwand | Status |
|---|---|---|---|---|
| 1.1 | Cookie-Consent: `analyticsEnabled` auf `false` setzen | `CookieConsent.tsx` | 5 Min | ✅ 07.02.2026 |
| 1.2 | Google Fonts lokal hosten | `index.html`, `public/fonts/`, `index.css` | 30 Min | ✅ 07.02.2026 |
| 1.3 | KI-Disclaimer im Luna-Chat Header | `LunaChat.tsx` | 15 Min | ✅ 07.02.2026 |
| 1.4 | Einwilligungs-Checkbox im Kontaktformular + UX-Bug-Fix | `Kontakt.tsx` | 20 Min | ✅ 07.02.2026 |
| 1.5 | GA4 Measurement-ID in Env-Variable | `analytics.ts`, `.env.example` | 15 Min | ✅ 07.02.2026 |
| 1.6 | Datenschutzerklärung ergänzen (KI-Chat, Stripe, S3, Voice) | `Datenschutz.tsx` | 1-2 Std | ✅ 07.02.2026 |
| 1.7 | HTML lang="de" setzen | `index.html` | 2 Min | ✅ 07.02.2026 |
| 1.8 | GA4 vs Umami klären: Umami consent-abhängig laden | `index.html` | 30 Min | ✅ 07.02.2026 |
| 1.9 | Cookie-Widerruf-Button im Footer ergänzen | `Footer.tsx` | 30 Min | ✅ 07.02.2026 |

**Geschätzter Gesamtaufwand:** 4-6 Stunden

---

## Phase 2: Sicherheit & Backend-Härtung (Woche 2-3)

**Priorität: 🟠 HOCH**
**Begründung:** Schutz sensibler Gesundheitsdaten, Missbrauchsprävention

| # | Aufgabe | Datei(en) | Aufwand | Status |
|---|---|---|---|---|
| 2.1 | Security-Header (CSP, HSTS, X-Frame-Options) | `server/_core/index.ts` | 30 Min | ⬜ |
| 2.2 | Rate-Limiting für Luna-Chat & Kontaktformular | `server/_core/index.ts` | 45 Min | ⬜ |
| 2.3 | `sendAnalysisPDF` absichern (protectedProcedure) | `server/routers.ts` | 20 Min | ⬜ |
| 2.4 | OpenAI TTS-Key: Fallback auf forgeApiKey entfernen | `server/_core/tts.ts` | 10 Min | ⬜ |
| 2.5 | `voice-tts.ts` entfernen (nicht genutzt, fehlerhaft) | `client/src/lib/voice-tts.ts` | 5 Min | ⬜ |
| 2.6 | Audiodateien nach Transkription aus S3 löschen | `server/routers.ts` | 30 Min | ⬜ |
| 2.7 | Chat-Verlauf Löschfrist implementieren (90 Tage) | `server/storage.ts`, neuer Cron | 1-2 Std | ⬜ |
| 2.8 | `drizzle.config.ts` Error-Message generischer | `drizzle.config.ts` | 5 Min | ⬜ |
| 2.9 | DATABASE_URL nicht in Error-Logs leaken | `drizzle.config.ts` | 5 Min | ⬜ |
| 2.10 | `.manus/db/` Debug-Daten in .gitignore | `.gitignore` | 2 Min | ⬜ |

**Geschätzter Gesamtaufwand:** 5-8 Stunden

---

## Phase 3: Luna V2 Sprachfunktion (Woche 3-4)

**Priorität: 🟡 MITTEL-HOCH**
**Begründung:** Feature-Erweiterung, Barrierefreiheit, Nutzererlebnis

| # | Aufgabe | Datei(en) | Aufwand | Status |
|---|---|---|---|---|
| 3.1 | `luna-voice.ts` finalisieren und testen | `client/src/lib/luna-voice.ts` | ✅ Erstellt | ⬜ Integration |
| 3.2 | `VoiceConsentDialog.tsx` finalisieren | `client/src/components/VoiceConsentDialog.tsx` | ✅ Erstellt | ⬜ Integration |
| 3.3 | `LunaVoiceControls.tsx` finalisieren | `client/src/components/LunaVoiceControls.tsx` | ✅ Erstellt | ⬜ Integration |
| 3.4 | Integration in `LunaChat.tsx` | `LunaChat.tsx` | 1-2 Std | ⬜ |
| 3.5 | Alte Voice-Buttons aus LunaChat entfernen | `LunaChat.tsx` | 15 Min | ⬜ |
| 3.6 | Datenschutzerklärung: Abschnitt Sprachfunktion | `Datenschutz.tsx` | 30 Min | ⬜ |
| 3.7 | Browser-Kompatibilität testen (Chrome, Safari, Firefox, Edge) | Manuell | 2-3 Std | ⬜ |
| 3.8 | Mobile-Test (iOS Safari, Chrome Android) | Manuell | 1-2 Std | ⬜ |
| 3.9 | Accessibility-Test (Screenreader, Tastatur) | Manuell | 1 Std | ⬜ |

**Geschätzter Gesamtaufwand:** 8-12 Stunden (Code ✅, Integration + Tests ausstehend)

---

## Phase 4: Performance & SEO (Woche 5-8)

**Priorität: 🟢 MITTEL**
**Begründung:** Besseres Ranking, schnellere Ladezeiten, Nutzererlebnis

| # | Aufgabe | Datei(en) | Aufwand | Status |
|---|---|---|---|---|
| 4.1 | OG-Image erstellen (1200x630px) | `public/og-image.jpg` | 30 Min | ⬜ |
| 4.2 | Lazy Loading für Admin-/Knowledge-Seiten | `App.tsx` | 1 Std | ⬜ |
| 4.3 | Bilder zu WebP konvertieren | `public/images/` | 1 Std | ⬜ |
| 4.4 | Bildgrößen-Attribute hinzufügen (CLS) | Diverse Komponenten | 1 Std | ⬜ |
| 4.5 | Sitemap.xml dynamisch generieren | `server/sitemap.ts` | 30 Min | ⬜ |
| 4.6 | ARIA-Labels konsistent implementieren | Diverse Komponenten | 2 Std | ⬜ |
| 4.7 | Focus-Management im Luna-Chat | `LunaChat.tsx` | 1 Std | ⬜ |
| 4.8 | Lighthouse-Audit durchführen und optimieren | Manuell | 2-3 Std | ⬜ |
| 4.9 | `onKeyPress` durch `onKeyDown` ersetzen | `LunaChat.tsx` | 5 Min | ⬜ |
| 4.10 | `substr` durch `substring` ersetzen | `server/routers.ts` | 5 Min | ⬜ |

**Geschätzter Gesamtaufwand:** 10-15 Stunden

---

## Phase 5: Hosting & Zukunftsplanung (3-6 Monate)

**Priorität: 🔵 NIEDRIG (Strategisch)**
**Begründung:** Langfristige Stabilität, Unabhängigkeit, Performance

| # | Aufgabe | Aufwand | Status |
|---|---|---|---|
| 5.1 | Cloudflare als CDN/WAF vor Manus einrichten | 2 Std | ⬜ |
| 5.2 | DNS-TTL senken (Vorbereitung) | 10 Min | ⬜ |
| 5.3 | Cloudflare Page Rules & Caching konfigurieren | 1 Std | ⬜ |
| 5.4 | all-inkl.com vServer evaluieren | 2-3 Std | ⬜ |
| 5.5 | Testumgebung auf all-inkl aufsetzen (optional) | 1-2 Tage | ⬜ |
| 5.6 | Migrationsplan finalisieren (bei Bedarf) | 4 Std | ⬜ |
| 5.7 | Monitoring-Lösung einrichten (UptimeRobot o.ä.) | 30 Min | ⬜ |
| 5.8 | Automatisierte Backups einrichten | 1 Std | ⬜ |

**Geschätzter Gesamtaufwand:** 2-5 Tage (verteilt über 3-6 Monate)

---

## Zusammenfassung

| Phase | Zeitraum | Aufwand | Priorität | Kernthema |
|---|---|---|---|---|
| **Phase 1** | Sofort (Woche 1) | 4-6 Std | 🔴 KRITISCH | DSGVO & Datenschutz |
| **Phase 2** | Woche 2-3 | 5-8 Std | 🟠 HOCH | Sicherheit & Backend |
| **Phase 3** | Woche 3-4 | 8-12 Std | 🟡 MITTEL-HOCH | Luna Sprachfunktion |
| **Phase 4** | Woche 5-8 | 10-15 Std | 🟢 MITTEL | Performance & SEO |
| **Phase 5** | 3-6 Monate | 2-5 Tage | 🔵 STRATEGISCH | Hosting & Zukunft |

**Gesamtaufwand geschätzt: ~40-60 Arbeitsstunden über 6 Monate**

---

## Quick-Win-Liste (Top 10 mit maximalem Impact)

| # | Aufgabe | Aufwand | Impact |
|---|---|---|---|
| 1 | Cookie-Consent Opt-in fixen | 5 Min | DSGVO-konform |
| 2 | HTML lang="de" | 2 Min | SEO-Verbesserung |
| 3 | Google Fonts lokal | 30 Min | DSGVO + Performance |
| 4 | KI-Disclaimer | 15 Min | Rechtssicherheit |
| 5 | GA4 ID in Env-Variable | 15 Min | Sicherheit |
| 6 | OG-Image erstellen | 30 Min | Social Sharing |
| 7 | Security-Header | 30 Min | Angriffsfläche reduzieren |
| 8 | Rate-Limiting | 45 Min | Missbrauchsschutz |
| 9 | Kontaktformular Checkbox | 20 Min | DSGVO-konform |
| 10 | Cloudflare CDN einrichten | 2 Std | Performance + Sicherheit |
