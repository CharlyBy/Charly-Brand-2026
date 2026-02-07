# Projekt-Analyse Gesamtübersicht - charlybrand.de

> **Erstellt:** 2026-02-07
> **Projekt:** charlybrand.de - Heilpraktiker für Psychotherapie
> **Inhaber:** Karl-Heinz "Charly" Brand
> **Version:** 1.0

---

## Inhaltsverzeichnis der Analyse-Dokumente

| Dokument | Datei | Inhalt | Status |
|---|---|---|---|
| **Teil A** | `TEIL_A_FEHLERBERICHT.md` | Code-Review, 13 Fehler, Prioritäten-Matrix | ✅ Abgeschlossen |
| **Teil B** | `TEIL_B_DATENSCHUTZ_AUDIT.md` | DSGVO-Audit, Externe Dienste, Textvorschläge DSE | ✅ Abgeschlossen |
| **Teil C** | `TEIL_C_VERBESSERUNGSVORSCHLAEGE.md` | Performance, SEO, Accessibility, Architektur | ✅ Abgeschlossen |
| **Teil D** | `TEIL_D_LUNA_SPRACHFUNKTION.md` | Speech-to-Text, Text-to-Speech, Integration | ✅ Abgeschlossen |
| **Teil E** | `TEIL_E_HOSTING_EMPFEHLUNG.md` | Hosting-Vergleich, Empfehlung, Migrationsplan | ✅ Abgeschlossen |
| **Teil F** | `TEIL_F_ROADMAP.md` | Priorisierte Roadmap (5 Phasen, 40-60h) | ✅ Abgeschlossen |

---

## Projekt-Profil

```
Projekt:          charlybrand.de
Typ:              Professionelle Therapie-Website mit KI-Chat
Inhaber:          Karl-Heinz "Charly" Brand
Beruf:            Heilpraktiker für Psychotherapie
Spezialisierung:  Hypnosetherapie, Emotionscoaching
Standort:         82398 Polling (Bayern)
```

## Tech-Stack

```
Frontend:         React 19.1.1 + TypeScript 5.9.3
Build:            Vite 5.x + esbuild
Backend:          Express 4.21.2 + tRPC 11.6.0
Datenbank:        MySQL (Drizzle ORM 0.44.5)
KI:               OpenAI API (via Manus Forge)
Zahlungen:        Stripe 20.1.0
Styling:          Tailwind CSS 4.x
Hosting:          Manus (Node.js, Deutschland)
Routing:          Wouter 3.3.5
State:            React Query (TanStack) 5.90.2
```

## Features-Übersicht

| Feature | Status | Beschreibung |
|---|---|---|
| Luna KI-Chat | ✅ Live | Empathische KI-Assistentin für Erstgespräche |
| Enneagramm-Test | ✅ Live | Persönlichkeitstyp-Erkennung (intern, nicht sichtbar für Nutzer) |
| Persönlichkeitsanalyse | ✅ Live | PDF-Generierung und E-Mail-Versand |
| Premium-Abonnement | ✅ Live | Stripe-basiert, erweiterte Chat-Funktionen |
| Wissensartikel | ✅ Live | Admin-verwaltbar, PDF-Upload, RAG-Suche |
| Bewertungen | ✅ Live | Nutzer-Bewertungen mit Admin-Moderation |
| Admin-Dashboard | ✅ Live | Gespräche, Analysen, Wissen, Backup, Analytics |
| Sprachfunktion | 🔧 In Arbeit | STT + TTS für Luna-Chat (Code erstellt, Integration ausstehend) |
| Trance-Generator | 🚧 Geplant | Personalisierte Hypnose-Audios |
| Semantische Suche | ✅ Live | RAG-basierte Wissenssuche |

## Kritische Befunde (Top 5)

| # | Befund | Schwere | Teil |
|---|---|---|---|
| 1 | Cookie-Consent: Opt-in vorselektiert (DSGVO-Verstoß) | 🔴 KRITISCH | A, B |
| 2 | Google Fonts extern geladen (Abmahnrisiko) | 🔴 KRITISCH | C |
| 3 | Kein KI-Disclaimer im Luna-Chat | 🔴 KRITISCH | B |
| 4 | OpenAI TTS-Key Fallback-Leak | 🔴 KRITISCH | A |
| 5 | sendAnalysisPDF als publicProcedure | 🟠 HOCH | A |

## Empfohlene Sofortmaßnahmen

1. **Cookie-Consent fixen** - `useState(false)` statt `useState(true)` - 5 Minuten
2. **Google Fonts lokal hosten** - Fonts herunterladen, CSS anpassen - 30 Minuten
3. **KI-Disclaimer hinzufügen** - Text im Luna-Chat Header - 15 Minuten
4. **Datenschutzerklärung ergänzen** - OpenAI, Stripe, S3, Sprachfunktion - 1-2 Stunden
5. **Security-Header setzen** - helmet.js in Express - 30 Minuten

## Erstellte Code-Dateien

| Datei | Pfad | Beschreibung |
|---|---|---|
| `luna-voice.ts` | `client/src/lib/luna-voice.ts` | STT/TTS Kern-Modul (Web Speech API) |
| `VoiceConsentDialog.tsx` | `client/src/components/VoiceConsentDialog.tsx` | DSGVO-Einwilligungsdialog |
| `LunaVoiceControls.tsx` | `client/src/components/LunaVoiceControls.tsx` | UI-Steuerung (Mic + Speaker) |

## Hosting-Empfehlung

**Sofort:** Cloudflare CDN/WAF vor Manus einrichten (0€, 2h Aufwand)
**Langfristig:** all-inkl.com vServer evaluieren (15-20€/Mo)

---

## Versionierung

| Version | Datum | Änderungen |
|---|---|---|
| 1.0 | 2026-02-07 | Erstanalyse: Teil A-F komplett |

---

*Dieses Dokument dient als zentraler Einstiegspunkt für alle Analyse-Erkenntnisse.
Alle Teile sind als eigenständige Referenzdokumente im Ordner `/docs/` gespeichert.*
