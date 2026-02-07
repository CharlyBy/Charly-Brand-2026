# Referenz: Projekt-Architektur & Schlüsselstellen

> **Projekt:** charlybrand.de
> **Erstellt:** 2026-02-07

---

## Verzeichnisstruktur (Kernbereiche)

```
charlybrand/
├── client/                        # Frontend (React 19)
│   ├── index.html                 # HTML-Einstieg (Vite)
│   ├── public/
│   │   ├── images/                # Statische Bilder
│   │   │   ├── charly.png         # Charly Portrait
│   │   │   ├── luna.jpeg          # Luna Avatar
│   │   │   ├── logo.png           # Logo
│   │   │   └── labyrinth.jpg      # Hero-Hintergrund
│   │   ├── robots.txt             # SEO
│   │   └── favicon.ico
│   └── src/
│       ├── App.tsx                # Router + Provider Setup
│       ├── main.tsx               # Entry: TRPC, QueryClient, GA-Init
│       ├── components/
│       │   ├── LunaChat.tsx       # 🗣️ Luna KI-Chat (Hauptkomponente)
│       │   ├── LunaVoiceControls.tsx  # 🎙️ NEU: Sprachsteuerung
│       │   ├── VoiceConsentDialog.tsx # 🔒 NEU: DSGVO-Consent
│       │   ├── CookieConsent.tsx  # Cookie-Banner
│       │   ├── Navigation.tsx     # Hauptnavigation
│       │   ├── Footer.tsx         # Footer
│       │   ├── SEO.tsx            # Meta-Tags & Structured Data
│       │   └── ui/                # Shadcn/Radix UI Komponenten
│       ├── lib/
│       │   ├── luna-voice.ts      # 🎙️ NEU: STT/TTS Engine
│       │   ├── tts-simple.ts      # Bestehendes OpenAI TTS (alt)
│       │   ├── voice-tts.ts       # ⚠️ Fehlerhaft, nicht genutzt
│       │   ├── voice-utils.ts     # Audio-Recording Utilities
│       │   ├── analytics.ts       # Google Analytics 4
│       │   ├── consent.ts         # Cookie-Consent Helpers
│       │   └── trpc.ts            # tRPC Client Setup
│       └── pages/
│           ├── Home.tsx           # Startseite
│           ├── Kontakt.tsx        # Kontaktformular
│           ├── Datenschutz.tsx    # Datenschutzerklärung
│           ├── Impressum.tsx      # Impressum
│           ├── Persoenlichkeitstest.tsx
│           └── admin/             # Admin-Bereich
│
├── server/                        # Backend (Express + tRPC)
│   ├── _core/
│   │   ├── index.ts               # Express Server Setup
│   │   ├── env.ts                 # Environment Variables
│   │   ├── trpc.ts                # tRPC Context & Auth
│   │   ├── tts.ts                 # OpenAI TTS Service
│   │   └── llm.ts                 # LLM Client (Manus Forge)
│   ├── routers.ts                 # 📌 Alle tRPC Routen (Hauptdatei!)
│   ├── storage.ts                 # AWS S3 Speicher
│   ├── luna-prompt.ts             # Luna System-Prompt (Basis)
│   ├── luna-prompt-rag.ts         # Luna + RAG-Kontext
│   ├── luna-prompt-review.ts      # Luna + Bewertungs-Kontext
│   ├── enneagram-*.ts             # Enneagramm-System
│   ├── rag-service.ts             # RAG/Embeddings
│   ├── pdf-generator*.ts          # PDF-Erstellung
│   ├── stripe-*.ts                # Stripe Integration
│   ├── text-to-speech.ts          # TTS Endpoint (Express)
│   ├── tts-endpoint.ts            # TTS tRPC Route
│   ├── transcribe.ts              # Whisper STT Service
│   └── upload.ts                  # Audio/File Upload
│
├── shared/                        # Geteilte Types & Konstanten
│   ├── types.ts                   # Haupt-Typen
│   ├── const.ts                   # Konstanten (URLs, Limits)
│   ├── enneagram-types.ts         # Enneagramm-Definitionen
│   └── _core/errors.ts            # Error-Typen
│
├── drizzle/                       # Datenbank
│   ├── schema.ts                  # MySQL Schema (Drizzle ORM)
│   ├── 0000_nosy_patriot.sql      # Migration 1
│   └── 0001_*.sql                 # Migration 2
│
├── docs/                          # 📋 NEU: Analyse-Dokumente
│   ├── PROJEKT_ANALYSE_UEBERSICHT.md
│   ├── TEIL_A_FEHLERBERICHT.md
│   ├── TEIL_B_DATENSCHUTZ_AUDIT.md
│   ├── TEIL_C_VERBESSERUNGSVORSCHLAEGE.md
│   ├── TEIL_D_LUNA_SPRACHFUNKTION.md
│   ├── TEIL_E_HOSTING_EMPFEHLUNG.md
│   ├── TEIL_F_ROADMAP.md
│   └── REFERENZ_ARCHITEKTUR.md
│
├── package.json                   # Dependencies & Scripts
├── vite.config.ts                 # Vite Build Config
├── tsconfig.json                  # TypeScript Config
├── drizzle.config.ts              # DB-Migrations Config
└── .gitignore                     # Git Ignore Rules
```

---

## Schlüssel-Routen (App.tsx)

| Route | Seite | Beschreibung |
|---|---|---|
| `/` | Home | Startseite mit Hero, Leistungen, CTA |
| `/ueber-charly` | UeberCharly | Über Charly Brand |
| `/befreiungsweg` | Befreiungsweg | 5-Stufen-Modell |
| `/leistungen` | Leistungen | Therapie-Angebote |
| `/psychotherapie` | Psychotherapie | Detailseite |
| `/coaching` | Coaching | Coaching-Angebote |
| `/dualseelen` | Dualseelen | Dual-/Zwillingsseelen |
| `/persoenlichkeitstest` | Persoenlichkeitstest | Enneagramm-basiert |
| `/wissen` | Wissen | Wissensartikel-Übersicht |
| `/wissen/:slug` | KnowledgeArticle | Einzelner Artikel |
| `/bewertung` | Bewertung | Bewertungen abgeben |
| `/faq` | FAQ | Häufige Fragen |
| `/kontakt` | Kontakt | Kontaktformular |
| `/impressum` | Impressum | Rechtliches |
| `/datenschutz` | Datenschutz | Datenschutzerklärung |
| `/premium` | Premium | Abo-Seite |
| `/admin/*` | Admin-Bereich | Dashboard, Bewertungen, Wissen, Backup, Analytics |

---

## API-Endpunkte (tRPC Router)

| Modul | Endpunkte | Auth | Beschreibung |
|---|---|---|---|
| `system` | getInfo | Public | System-Info |
| `auth` | me, logout | Protected | Authentifizierung |
| `luna` | chat, getConversations, getStats, getDetails, delete, sendAnalysisPDF, transcribeVoice | Mixed | Luna KI-Chat |
| `trance` | generate | Protected | Trance-Audio (geplant) |
| `contact` | submitForm | Public | Kontaktformular |
| `subscription` | checkout, status, cancel, portal | Mixed | Stripe Premium |
| `knowledge` | CRUD, uploadPDF | Mixed | Wissensartikel |
| `enneagram` | create, get, list | Mixed | Enneagramm-Analysen |
| `backup` | create, list, delete, restore | Admin | Daten-Backup |
| `rag` | process, get, delete, regenerate | Admin | RAG-Chunks |
| `analytics` | trackView, stats, top, trends, summary | Mixed | Web-Analytics |
| `search` | semantic, keyword, hybrid | Public | Wissenssuche |
| `reviews` | submit, list, stats, admin | Mixed | Bewertungen |

**Zusätzliche Express-Routen:**
| Route | Methode | Beschreibung |
|---|---|---|
| `/api/stripe/webhook` | POST | Stripe Webhooks (raw body!) |
| `/api/upload` | POST | Audio/Datei-Upload (Multer, 16MB) |
| `/api/tts` | POST | Text-to-Speech (OpenAI) |
| `/api/oauth/callback` | GET | OAuth Callback |
| `/sitemap.xml` | GET | Dynamische Sitemap |

---

## Environment Variables

| Variable | Dienst | Beschreibung |
|---|---|---|
| `VITE_APP_ID` | Manus | App-Identifikation |
| `JWT_SECRET` | Auth | Cookie/Token-Secret |
| `DATABASE_URL` | MySQL | Datenbank-Verbindung |
| `OAUTH_SERVER_URL` | Auth | OAuth-Server URL |
| `OWNER_OPEN_ID` | Auth | Admin-Identifikation |
| `BUILT_IN_FORGE_API_URL` | Manus Forge | KI-API Basis-URL |
| `BUILT_IN_FORGE_API_KEY` | Manus Forge | KI-API Schlüssel |
| `STRIPE_SECRET_KEY` | Stripe | Zahlungs-API |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe | Frontend-Schlüssel |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook-Verifizierung |
| `OPENAI_TTS_KEY` | OpenAI | TTS-dedizierter Key |
| `OPENAI_API_KEY` | OpenAI | Allgemeiner Key |
| `VITE_GA_MEASUREMENT_ID` | Google | Analytics (empfohlen) |
| `VITE_ANALYTICS_ENDPOINT` | Umami | Analytics Endpoint |
| `VITE_ANALYTICS_WEBSITE_ID` | Umami | Analytics Website-ID |

---

## Luna System-Prompt Kernpunkte

1. **Rolle:** Empathische digitale Assistentin für Erstgespräche
2. **Befreiungsweg:** 5 Ebenen (Wahrnehmung → Entfaltung)
3. **Enneagramm:** Intern 5-10 Fragen, NICHT für Nutzer sichtbar
4. **ICD-10 Triage:** Leicht/Mittel/Schwer/Suizid → Empfehlungen + Notfallnummern
5. **Analyse:** 1000-1500 Wörter (nur auf Website, nicht im Chat)
6. **Preise:** 29€ (Trance), 129€/Stunde (Sitzung), 15 Min Erstgespräch kostenlos
7. **Notfallnummern:** 0800 1110 111, 116 117, 112
8. **Regeln:** Keine Diagnosen, Datenschutz, keine Erwähnung von Enneagramm/ICD-10

---

*Dieses Dokument dient als schnelle Referenz für die Projektarchitektur.*
