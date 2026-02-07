# Teil B - Datenschutz-Audit (DSGVO-Konformität)

> **Projekt:** charlybrand.de
> **Analysedatum:** 2026-02-07
> **Kontext:** Heilpraktiker für Psychotherapie - besonderer Schutz sensibler Gesundheitsdaten (Art. 9 DSGVO)
> **Status:** Abgeschlossen

---

## Zusammenfassung

**Gesamtbewertung: 🟡 Teilweise konform - Handlungsbedarf in mehreren Bereichen**

Die Datenschutzerklärung ist vorhanden und grundsätzlich gut strukturiert, weist aber **Lücken bei externen Diensten** auf. Technische Maßnahmen zur Datensicherheit müssen verstärkt werden.

---

## 1. Datenschutzerklärung - Vollständigkeitscheck

### Vorhandene Abschnitte ✅
- [x] Verantwortlicher (Karl-Heinz Brand, vollständige Angaben)
- [x] Hosting (Manus, Deutschland, AVV gem. Art. 28 DSGVO)
- [x] Server-Log-Dateien (7 Tage Löschfrist)
- [x] Cookies & Einwilligungsmanagement
- [x] Luna KI-Chat (Grundlagen)
- [x] Google Analytics 4 (DPF-zertifiziert)
- [x] Google Maps & reCAPTCHA
- [x] Kontaktformular
- [x] Betroffenenrechte
- [x] Beschwerderecht (BayLDA)
- [x] Drittstaaten-Transfer

### Fehlende Abschnitte ❌
- [ ] **OpenAI API / KI-Datenverarbeitung** - Chatverläufe werden an OpenAI/Manus Forge übertragen
- [ ] **Text-to-Speech (TTS)** - OpenAI TTS-Dienst verarbeitet Text
- [ ] **Speech-to-Text (STT)** - Audio wird an Manus Forge/Whisper API gesendet
- [ ] **Stripe Zahlungsdienstleister** - Zahlungsdaten, Abonnements
- [ ] **AWS S3 Speicher** - Audiodateien, PDFs, Wissensartikel
- [ ] **Aufbewahrungsfristen** für Chat-Verläufe (derzeit unbegrenzt!)
- [ ] **Automatisierte Entscheidungsfindung** (Art. 22 DSGVO) - KI-basierte Persönlichkeitsanalyse
- [ ] **Sprachfunktion** (Web Speech API - Browser-Datenverarbeitung)
- [ ] **Umami Analytics** (in index.html eingebunden, aber nicht dokumentiert)

---

## 2. Cookie-Consent-Banner

### Befund: 🔴 DSGVO-Verstoß

| Aspekt | Status | Detail |
|---|---|---|
| Banner vorhanden | ✅ | Wird nach 1s Verzögerung angezeigt |
| Opt-in Schalter | ❌ **VERSTOSSTOSS** | `analyticsEnabled` default `true` - vorselektiert |
| Ablehnen-Option | ✅ | "Nur notwendige" Button vorhanden |
| Widerruf möglich | ⚠️ | Nur über localStorage, kein UI zum Widerrufen |
| Link zur Datenschutzerklärung | ✅ | Link zu `/datenschutz` vorhanden |
| Granulare Steuerung | ✅ | Einstellungen mit Toggle für Analyse-Cookies |
| GA-Aktivierung | ⚠️ | `location.reload()` nach Consent - aggressiv |

**Sofortmaßnahme:**
```typescript
// CookieConsent.tsx - Zeile 10
const [analyticsEnabled, setAnalyticsEnabled] = useState(false); // war: true
```

**Empfehlung:** Widerrufs-Link im Footer oder Cookie-Icon dauerhaft sichtbar.

---

## 3. Luna KI-Chat - Datenschutz

### Datenfluss-Analyse

```
Nutzer-Nachricht
  → Express/tRPC Server (Manus, DE)
    → MySQL Datenbank (persistente Speicherung)
    → OpenAI/Manus Forge API (LLM-Verarbeitung)
      → Antwort zurück an Nutzer
```

### Befunde

| Aspekt | Status | Detail |
|---|---|---|
| Chat-Speicherung | ⚠️ | Verläufe dauerhaft in MySQL - keine Löschfrist |
| Anonymes Chatten | ✅ | Möglich ohne Anmeldung |
| KI-Disclaimer | ❌ | Kein Hinweis dass Antworten KI-generiert sind |
| Therapeutische Grenzen | ⚠️ | Im System-Prompt, aber nicht im UI sichtbar |
| Notfallnummern | ✅ | Im System-Prompt bei Krisenerkennung |
| Persönlichkeitsanalyse | ⚠️ | Automatisierte Profilerstellung - Art. 22 DSGVO relevant |
| E-Mail-Erfassung | ✅ | Optional, für Analyse-PDF |
| Datenminimierung | ⚠️ | Alle Nachrichten inkl. Metadaten gespeichert |

**Empfehlungen:**
1. KI-Disclaimer im Chat-Header: *"Luna ist eine KI-gestützte Assistentin. Sie ersetzt keine therapeutische Behandlung."*
2. Automatische Löschung nach 90 Tagen (konfigurierbar)
3. Export/Lösch-Funktion für Nutzer (Betroffenenrechte)
4. Art. 22 DSGVO Hinweis bei Persönlichkeitsanalyse

---

## 4. Sprachfunktion (Voice) - Datenschutz

### Aktuelle Implementierung

| Komponente | Dienst | Datenfluss |
|---|---|---|
| Speech-to-Text | MediaRecorder → S3 Upload → Whisper API (Manus Forge) | Audio verlässt Browser und Server |
| Text-to-Speech | OpenAI TTS API (`shimmer` Voice) | Text wird an OpenAI gesendet |

### Datenschutz-Risiken

| Risiko | Schwere | Beschreibung |
|---|---|---|
| Audio auf S3 gespeichert | HOCH | Audiodateien verbleiben dauerhaft auf AWS S3 |
| Keine Einwilligung vor Mikrofon | KRITISCH | Kein DSGVO-Dialog vor Audioaufnahme |
| Whisper API Drittland | HOCH | Audio wird an Manus Forge/OpenAI übertragen |
| TTS ohne Opt-in | MITTEL | Text wird automatisch an OpenAI TTS gesendet |

### Empfohlene Lösung (in Teil D implementiert)

```
Neue Architektur:
  Speech-to-Text → Web Speech API (lokal im Browser, kein Server-Transfer)
  Text-to-Speech → Web SpeechSynthesis (lokal im Browser)
  → DSGVO-konform durch lokale Verarbeitung
  → Einwilligungsdialog vor erster Nutzung
```

---

## 5. Externe Dienste - AVV-Status

| Dienst | Zweck | AVV vorhanden? | DSGVO-Basis | Handlungsbedarf |
|---|---|---|---|---|
| Manus (Hosting) | Server & Hosting | ✅ Art. 28 | Art. 6(1)(f) | - |
| OpenAI / Manus Forge | KI-Chat, TTS, STT | ❌ Unklar | Art. 6(1)(a) | AVV prüfen/abschließen |
| Google Analytics 4 | Web-Analyse | ✅ DPF | Art. 6(1)(a) | OK, aber Opt-in fixen |
| Google Fonts | Schriftarten | ❌ | Art. 6(1)(f) | **Lokal hosten!** |
| Google Maps | Karten | ⚠️ | Art. 6(1)(a) | Consent-basiert OK |
| Google reCAPTCHA | Bot-Schutz | ⚠️ | Art. 6(1)(a) | Consent-basiert OK |
| Stripe | Zahlungen | ⚠️ Unklar | Art. 6(1)(b) | AVV prüfen, DSE ergänzen |
| AWS S3 | Datei-Speicher | ❌ Unklar | Art. 6(1)(f) | AVV prüfen, Region DE? |
| Umami Analytics | Web-Analyse | ❌ | Art. 6(1)(a) | DSE ergänzen oder entfernen |

---

## 6. Kontaktformular

| Aspekt | Status | Detail |
|---|---|---|
| Felder | ✅ | Name, E-Mail, Nachricht (minimal) |
| Einwilligungs-Checkbox | ❌ | Fehlt! |
| Speicherdauer-Hinweis | ❌ | Nicht im Formular angezeigt |
| Verschlüsselung | ✅ | HTTPS vorhanden |

**Fix:** Checkbox hinzufügen:
```
☐ Ich habe die Datenschutzerklärung gelesen und stimme der Verarbeitung 
  meiner Daten zur Bearbeitung meiner Anfrage zu. *
```

---

## 7. Sicherheits-Header

| Header | Status | Empfehlung |
|---|---|---|
| Content-Security-Policy (CSP) | ❌ Fehlt | Implementieren |
| Strict-Transport-Security (HSTS) | ❌ Fehlt | `max-age=31536000; includeSubDomains` |
| X-Frame-Options | ❌ Fehlt | `DENY` oder `SAMEORIGIN` |
| X-Content-Type-Options | ❌ Fehlt | `nosniff` |
| Referrer-Policy | ❌ Fehlt | `strict-origin-when-cross-origin` |
| Permissions-Policy | ❌ Fehlt | Mikrofon, Kamera, Geolocation einschränken |

---

## 8. Textvorschlag Datenschutzerklärung - Ergänzungen

### 8.1 KI-gestützter Chat (Luna)

```text
### KI-gestützter Chat-Assistent (Luna)

Auf unserer Website bieten wir einen KI-gestützten Chat-Assistenten namens „Luna" an. 
Luna dient der Erstberatung und Orientierung und ersetzt keine therapeutische Behandlung.

**Verarbeitete Daten:**
- Ihre Chat-Nachrichten und die Antworten des KI-Systems
- Zeitstempel der Nachrichten
- Freiwillige Angaben (z. B. Vorname, E-Mail-Adresse)
- Ggf. Ergebnisse einer Persönlichkeitseinschätzung

**Hinweis:** Die Kommunikation mit Luna basiert auf künstlicher Intelligenz. 
Die Antworten werden durch ein KI-Modell generiert und stellen keine therapeutische 
Beratung oder Diagnose dar.

**Datenverarbeitung:** Ihre Nachrichten werden zur Generierung der Antworten an einen 
KI-Dienst (API) übermittelt. Der Dienstanbieter verarbeitet die Daten gemäß einem 
Auftragsverarbeitungsvertrag (Art. 28 DSGVO).

**Speicherdauer:** Chat-Verläufe werden für maximal 90 Tage gespeichert und anschließend 
automatisch gelöscht. Sie können jederzeit die Löschung Ihrer Daten verlangen.

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) bzw. 
Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen).

**Anonyme Nutzung:** Sie können Luna anonym nutzen, ohne persönliche Daten anzugeben.
```

### 8.2 Sprachfunktion

```text
### Sprachfunktion (Spracheingabe und Sprachausgabe)

Unsere Website bietet optional eine Sprachfunktion für die Kommunikation mit Luna an.

**Spracheingabe (Speech-to-Text):**
Die Spracheingabe wird über die Web Speech API Ihres Browsers verarbeitet. 
Die Audiodaten werden ausschließlich lokal in Ihrem Browser verarbeitet und nicht 
an unsere Server übertragen. Je nach Browser kann der Anbieter (z. B. Google bei Chrome, 
Apple bei Safari) die Audiodaten zur Spracherkennung verarbeiten. Bitte beachten Sie 
die Datenschutzhinweise Ihres Browsers.

**Sprachausgabe (Text-to-Speech):**
Die Sprachausgabe erfolgt über die browser-interne SpeechSynthesis-Schnittstelle. 
Die Texte werden lokal auf Ihrem Gerät in Sprache umgewandelt. Es werden keine Daten 
an externe Server übertragen.

**Einwilligung:** Die Sprachfunktion wird erst nach Ihrer ausdrücklichen Einwilligung 
aktiviert (Art. 6 Abs. 1 lit. a DSGVO). Sie können die Einwilligung jederzeit widerrufen, 
indem Sie die Sprachfunktion deaktivieren.

**Mikrofon-Berechtigung:** Für die Spracheingabe ist der Zugriff auf Ihr Mikrofon 
erforderlich. Sie können diese Berechtigung jederzeit in Ihren Browsereinstellungen 
widerrufen.
```

### 8.3 Zahlungsdienstleister (Stripe)

```text
### Zahlungsdienstleister (Stripe)

Für die Abwicklung von Zahlungen nutzen wir den Dienst Stripe, Inc. 
(354 Oyster Point Blvd, South San Francisco, CA 94080, USA).

**Verarbeitete Daten:** E-Mail-Adresse, Zahlungsinformationen, IP-Adresse, 
Transaktionsdaten.

**Zweck:** Abwicklung von Premium-Abonnements und Zahlungen.

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).

**Drittlandtransfer:** Stripe ist unter dem EU-US Data Privacy Framework zertifiziert. 
Zusätzlich bestehen Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).

Weitere Informationen: https://stripe.com/de/privacy
```

### 8.4 Cloud-Speicher (AWS S3)

```text
### Cloud-Speicher (AWS S3)

Zur Speicherung von Dateien (z. B. PDF-Analysen, Wissensartikel) nutzen wir 
Amazon Web Services (AWS) S3.

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an 
sicherer Datenspeicherung).

**Drittlandtransfer:** AWS ist unter dem EU-US Data Privacy Framework zertifiziert. 
Der Speicherort ist nach Möglichkeit ein EU-Rechenzentrum (eu-central-1, Frankfurt).

Weitere Informationen: https://aws.amazon.com/de/privacy/
```

---

## 9. Sofortmaßnahmen-Checkliste

| # | Maßnahme | Priorität | Aufwand |
|---|---|---|---|
| 1 | Cookie-Consent Opt-in fixen (`useState(false)`) | KRITISCH | 5 Min |
| 2 | Google Fonts lokal hosten | KRITISCH | 30 Min |
| 3 | KI-Disclaimer im Luna-Chat | KRITISCH | 15 Min |
| 4 | Einwilligungs-Checkbox Kontaktformular | HOCH | 20 Min |
| 5 | Datenschutzerklärung ergänzen (Abschnitte oben) | HOCH | 1-2 Std |
| 6 | Sprachfunktion: Einwilligungsdialog | HOCH | Implementiert (Teil D) |
| 7 | Security-Header hinzufügen | HOCH | 30 Min |
| 8 | Chat-Löschfrist implementieren (90 Tage) | HOCH | 1 Std |
| 9 | Audio-Dateien nach Transkription löschen | HOCH | 30 Min |
| 10 | GA4 vs Umami klären (Doppel-Tracking) | MITTEL | 30 Min |
