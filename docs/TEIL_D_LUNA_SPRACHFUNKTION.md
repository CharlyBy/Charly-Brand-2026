# Teil D - Luna V2 Sprachfunktion (Speech-to-Text + Text-to-Speech)

> **Projekt:** charlybrand.de - Luna KI-Chat
> **Analysedatum:** 2026-02-07
> **Status:** Implementierung erstellt, Integration ausstehend

---

## 1. Architektur-Übersicht

### Design-Prinzipien
- **Datenschutz first:** Lokale Browserverarbeitung bevorzugt (Web Speech API)
- **Kein Server-Transfer:** Audio verlässt den Browser nicht
- **DSGVO-Einwilligung:** Dialog vor erstmaliger Mikrofon-Nutzung
- **Graceful Degradation:** Fallback bei fehlender API-Unterstützung
- **Barrierefreiheit:** ARIA-Labels, Tastatursteuerung, mobile Optimierung

### Datenfluss-Diagramm

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (lokal)                        │
│                                                           │
│  ┌──────────────┐    ┌──────────────┐                    │
│  │  Mikrofon     │    │  Lautsprecher │                   │
│  └──────┬───────┘    └──────▲───────┘                    │
│         │                    │                            │
│  ┌──────▼───────┐    ┌──────┴───────┐                    │
│  │ Web Speech   │    │ Speech       │                    │
│  │ Recognition  │    │ Synthesis    │                    │
│  │ (STT)        │    │ (TTS)        │                    │
│  └──────┬───────┘    └──────▲───────┘                    │
│         │                    │                            │
│  ┌──────▼────────────────────┴───────┐                   │
│  │         Luna Chat Component        │                   │
│  │    (Text-Input + Voice Controls)   │                   │
│  └────────────────────────────────────┘                   │
│                                                           │
│  ⚠️ Hinweis: Bei Chrome wird Audio an Google-Server       │
│     gesendet (Web Speech API). Hierauf wird im            │
│     Einwilligungsdialog hingewiesen.                      │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Erstellte Dateien

### 2.1 `client/src/lib/luna-voice.ts`
**Zweck:** Kern-Modul für Speech-to-Text und Text-to-Speech
**Funktionen:**
- `isSTTSupported()` - Prüft Browser-Unterstützung für Spracheingabe
- `isTTSSupported()` - Prüft Browser-Unterstützung für Sprachausgabe
- `startListening(callbacks)` - Startet Spracherkennung (de-DE)
- `stopListening()` - Stoppt Spracherkennung
- `speak(text, options)` - Spricht Text aus (deutsche Frauenstimme bevorzugt)
- `stopSpeaking()` - Stoppt aktuelle Sprachausgabe
- `isSpeaking()` - Status-Abfrage
- `getVoiceConsentStatus()` - DSGVO-Einwilligungsstatus aus localStorage
- `setVoiceConsentStatus(granted)` - Einwilligung speichern/widerrufen

**Technische Details:**
- Sprache: `de-DE` (Deutsch)
- Continuous-Modus: `true` (lauscht weiter nach Pausen)
- Interim Results: `true` (zeigt Zwischenergebnisse)
- TTS Rate: `0.95`, Pitch: `1.0`
- Bevorzugte Stimme: Deutsche Frauenstimme (Google, Microsoft, Apple)

### 2.2 `client/src/components/VoiceConsentDialog.tsx`
**Zweck:** DSGVO-konformer Einwilligungsdialog vor erstmaliger Sprachnutzung
**Inhalt:**
- Erklärung der Sprachfunktion
- Hinweis auf Browser-Datenverarbeitung (Chrome/Google)
- "Akzeptieren" und "Ablehnen" Buttons
- Checkbox "Nicht erneut fragen"
- Link zur Datenschutzerklärung
- Speicherung in localStorage (`luna-voice-consent`)

### 2.3 `client/src/components/LunaVoiceControls.tsx`
**Zweck:** UI-Komponente mit Mikrofon- und Lautsprecher-Steuerung
**Features:**
- Mikrofon-Button mit Wellenanzeige bei aktiver Erkennung
- Lautsprecher-Button mit Lautstärkeregelung (Slider)
- Visual Indicators: Pulsierender Ring bei Aufnahme, Wellenform bei Wiedergabe
- Automatisches Sprechen neuer Luna-Nachrichten (wenn TTS aktiv)
- Fehlerbehandlung: Berechtigung verweigert, kein Mikrofon, API nicht unterstützt
- Mobile-optimiert: Touch-Targets, responsive Layout
- ARIA-Labels für Barrierefreiheit

**Props:**
```typescript
interface LunaVoiceControlsProps {
  onTranscript: (text: string) => void;  // Erkannter Text
  isLoading?: boolean;                    // Luna denkt gerade
  isInputFocused?: boolean;              // Input hat Focus
  lastLunaMessage?: string;               // Letzte Luna-Nachricht
  hasNewLunaMessage?: boolean;            // Neue Nachricht empfangen
  onTTSStateChange?: (speaking: boolean) => void;
}
```

---

## 3. Integration in LunaChat.tsx

### Schritt-für-Schritt Anleitung

#### Schritt 1: Imports hinzufügen
```typescript
// In LunaChat.tsx - oben bei den Imports
import LunaVoiceControls from "@/components/LunaVoiceControls";
```

#### Schritt 2: State-Variablen ergänzen
```typescript
// Im LunaChat-Funktionskörper
const [hasNewLunaMessage, setHasNewLunaMessage] = useState(false);
const [isTTSSpeaking, setIsTTSSpeaking] = useState(false);
```

#### Schritt 3: Nach Luna-Antwort Signal setzen
```typescript
// In der chat.mutateAsync Callback, nach dem Hinzufügen der Luna-Nachricht
setHasNewLunaMessage(true);
setTimeout(() => setHasNewLunaMessage(false), 100);
```

#### Schritt 4: VoiceControls im UI platzieren
```tsx
{/* Im Input-Bereich, VOR dem Input-Feld */}
<LunaVoiceControls
  onTranscript={(text) => {
    setInputValue(prev => prev ? `${prev} ${text}` : text);
  }}
  isLoading={chat.isPending}
  lastLunaMessage={messages[messages.length - 1]?.sender === 'luna' 
    ? messages[messages.length - 1].text 
    : undefined}
  hasNewLunaMessage={hasNewLunaMessage}
  onTTSStateChange={setIsTTSSpeaking}
/>
```

#### Schritt 5: Alte Voice-Buttons entfernen
Die auskommentierten/bestehenden Mikrofon- und TTS-Buttons aus LunaChat.tsx entfernen (ca. Zeilen 536-561).

---

## 4. Browser-Kompatibilität

| Browser | STT (Web Speech API) | TTS (SpeechSynthesis) |
|---|---|---|
| Chrome (Desktop) | ✅ Vollständig | ✅ Vollständig |
| Chrome (Android) | ✅ Vollständig | ✅ Vollständig |
| Safari (macOS) | ✅ Vollständig | ✅ Vollständig |
| Safari (iOS) | ⚠️ Teilweise (WebKit) | ✅ Vollständig |
| Firefox | ❌ Nicht unterstützt | ✅ Vollständig |
| Edge | ✅ Vollständig (Chromium) | ✅ Vollständig |

**Fallback bei fehlendem STT:** Mikrofon-Button wird ausgeblendet, Hinweis-Toast angezeigt.
**Fallback bei fehlendem TTS:** Lautsprecher-Button wird ausgeblendet.

---

## 5. DSGVO-Konformität

| Aspekt | Maßnahme |
|---|---|
| Einwilligung | Dialog vor erstmaliger Nutzung (Art. 6(1)(a) DSGVO) |
| Transparenz | Erklärung im Dialog, was passiert |
| Widerruf | Jederzeit durch Deaktivierung möglich |
| Datenminimierung | Lokale Verarbeitung, kein Server-Transfer |
| Browser-Hinweis | Chrome sendet Audio an Google - wird erklärt |
| Speicherung | Einwilligungsstatus in localStorage |
| Datenschutzerklärung | Neuer Abschnitt empfohlen (siehe Teil B, 8.2) |

---

## 6. Offene Punkte / Zukünftige Erweiterungen

| # | Thema | Priorität | Beschreibung |
|---|---|---|---|
| 1 | Integration in LunaChat.tsx | HOCH | Anleitung oben befolgen |
| 2 | E2E-Test | MITTEL | Sprachfunktion testen (manuell + automatisiert) |
| 3 | iOS Safari | MITTEL | WebKit-STT testen und ggf. Workarounds |
| 4 | Sprachauswahl | NIEDRIG | Weitere Sprachen neben de-DE |
| 5 | Noise Cancellation | NIEDRIG | Optional für laute Umgebungen |
| 6 | Wake Word | NIEDRIG | "Hey Luna" als Aktivierungswort |
| 7 | EU-TTS-Fallback | NIEDRIG | EU-basierter TTS-Dienst als Alternative |
