# Analytics-Tracking Dokumentation

**Projekt:** charlybrand (Charly Brand - Heilpraktiker für Psychotherapie)  
**Datum:** 20. Januar 2026  
**Feature:** Umfassendes Analytics-Tracking für CTA-Buttons und Conversion-Messung

---

## 📊 Überblick

Vollständiges Analytics-Tracking wurde implementiert, um die Conversion-Rate und das Nutzerverhalten auf der Website zu messen. Alle wichtigen Call-to-Action-Buttons und User-Interaktionen werden jetzt getrackt.

---

## 🎯 Getrackte Events

### 1. **Persönlichkeitstest CTA-Clicks**

**Event:** `Conversion → Personality Test CTA Clicked`

Getrackte Positionen:
- **Hero** (`Position: hero`) - Hauptbutton im Hero-Bereich der /persoenlichkeitstest Seite
- **Footer** (`Position: footer`) - CTA am Ende der /persoenlichkeitstest Seite

**Code-Beispiel:**
```typescript
trackPersonalityTestCTA("hero");
```

**Verwendung:**
- `/persoenlichkeitstest` - 2 CTA-Buttons

---

### 2. **Luna Chat Öffnungen**

**Event:** `Engagement → Luna Chat Opened`

#### Generisches Tracking (alle Quellen):
```typescript
trackLunaChatOpened();
```

#### Quellen-spezifisches Tracking:
```typescript
trackLunaChatOpenedFrom("Source: Personality Test Hero");
```

**Getrackte Quellen:**
- `Source: Personality Test Hero` - Hero-Button auf /persoenlichkeitstest
- `Source: Personality Test Footer` - Footer-Button auf /persoenlichkeitstest
- `Source: Home Hero` - "Lerne Luna kennen" Sektion auf Homepage
- `Source: Home Befreiungsweg` - "Mit Luna starten" im Befreiungsweg-Bereich
- `Source: Home Footer CTA` - Footer-CTA auf Homepage
- `Chat Widget` - Direktes Öffnen über Chat-Widget (generisch)

**Verwendung:**
- `/` (Home) - 3 CTA-Buttons
- `/persoenlichkeitstest` - 2 CTA-Buttons
- LunaChat-Component - Automatisch beim Öffnen

---

### 3. **Termin-Buchungen**

**Event:** `Conversion → Appointment Button Clicked`

**Label:** `Lemniscus Booking`

**Code-Beispiel:**
```typescript
trackAppointmentClick();
```

**Verwendung:**
- Navigation (Header) - "Termin buchen" Button
- Homepage - "Termin buchen" Button im Hero
- Alle Seiten mit Lemniscus-Booking-Link

---

### 4. **Kontaktformular-Submissions**

**Event:** `Conversion → Contact Form Submitted`

**Label:** `Contact Form`

**Code-Beispiel:**
```typescript
trackContactFormSubmit();
```

**Verwendung:**
- `/kontakt` - Kontaktformular

---

### 5. **Premium-Conversions**

**Event:** `Conversion → Premium Checkout Started`  
**Event:** `Conversion → Premium Purchase Completed`

**Code-Beispiel:**
```typescript
trackPremiumCheckoutStarted();
trackPremiumPurchaseCompleted();
```

**Verwendung:**
- `/premium` - Checkout-Start
- `/premium/success` - Erfolgreiche Zahlung

---

### 6. **Admin-Logins**

**Event:** `Admin → Admin Login`

**Label:** `Admin Dashboard`

**Code-Beispiel:**
```typescript
trackAdminLogin();
```

**Verwendung:**
- Footer - "Charly" Link (versteckt)

---

## 📈 Analytics-Funnel

### Persönlichkeitstest-Funnel

```
1. Besucher landet auf /persoenlichkeitstest
   ↓
2. Klickt auf CTA-Button (trackPersonalityTestCTA)
   ↓
3. Luna-Chat öffnet sich (trackLunaChatOpenedFrom)
   ↓
4. Gespräch startet (trackLunaChatOpened)
   ↓
5. [Optional] Analyse wird per E-Mail versendet
   ↓
6. [Optional] Termin wird gebucht (trackAppointmentClick)
```

### Homepage-Funnel

```
1. Besucher landet auf /
   ↓
2. Scrollt zu "Lerne Luna kennen" oder "Befreiungsweg"
   ↓
3. Klickt auf Luna-CTA (trackLunaChatOpenedFrom)
   ↓
4. Luna-Chat öffnet sich (trackLunaChatOpened)
   ↓
5. [Optional] Termin wird gebucht (trackAppointmentClick)
```

---

## 🔧 Technische Implementierung

### Analytics-Library

**Datei:** `client/src/lib/analytics.ts`

**Basis-Funktionen:**
```typescript
// Initialisierung
export const initGA = () => {
  const measurementId = "G-L30F3450BH";
  ReactGA.initialize(measurementId);
};

// Seitenaufrufe
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

// Custom Events
export const trackEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({ category, action, label });
};
```

**Conversion-Tracking:**
```typescript
// Persönlichkeitstest
export const trackPersonalityTestCTA = (position: "hero" | "middle" | "footer" | "navigation") => {
  trackEvent("Conversion", "Personality Test CTA Clicked", `Position: ${position}`);
};

// Luna Chat
export const trackLunaChatOpened = () => {
  trackEvent("Engagement", "Luna Chat Opened", "Chat Widget");
};

export const trackLunaChatOpenedFrom = (source: string) => {
  trackEvent("Engagement", "Luna Chat Opened", `Source: ${source}`);
};

// Termine
export const trackAppointmentClick = () => {
  trackEvent("Conversion", "Appointment Button Clicked", "Lemniscus Booking");
};

// Kontakt
export const trackContactFormSubmit = () => {
  trackEvent("Conversion", "Contact Form Submitted", "Contact Form");
};

// Premium
export const trackPremiumCheckoutStarted = () => {
  trackEvent("Conversion", "Premium Checkout Started", "Premium Page");
};

export const trackPremiumPurchaseCompleted = () => {
  trackEvent("Conversion", "Premium Purchase Completed", "Success Page");
};

// Admin
export const trackAdminLogin = () => {
  trackEvent("Admin", "Admin Login", "Admin Dashboard");
};
```

---

## 📊 Google Analytics Dashboard

### Empfohlene Berichte

**1. Conversion-Übersicht:**
- Kategorie: `Conversion`
- Events: 
  - `Personality Test CTA Clicked`
  - `Appointment Button Clicked`
  - `Contact Form Submitted`
  - `Premium Checkout Started`
  - `Premium Purchase Completed`

**2. Engagement-Übersicht:**
- Kategorie: `Engagement`
- Events:
  - `Luna Chat Opened`

**3. CTA-Position-Analyse:**
- Event: `Personality Test CTA Clicked`
- Dimension: `Event Label` (Position: hero, middle, footer)
- Metrik: Anzahl der Clicks pro Position

**4. Luna-Quellen-Analyse:**
- Event: `Luna Chat Opened`
- Dimension: `Event Label` (Source: ...)
- Metrik: Anzahl der Chat-Öffnungen pro Quelle

---

## 🧪 Testing

### Browser Console Testing

1. **Öffne Browser Console** (F12)
2. **Navigiere zu einer Seite** (z.B. `/persoenlichkeitstest`)
3. **Klicke auf einen CTA-Button**
4. **Prüfe Console-Output:**

```
[GA4] Event: {
  category: "Conversion",
  action: "Personality Test CTA Clicked",
  label: "Position: hero"
}

[GA4] Event: {
  category: "Engagement",
  action: "Luna Chat Opened",
  label: "Source: Personality Test Hero"
}
```

### Google Analytics Real-Time Testing

1. **Öffne Google Analytics** → Real-Time → Events
2. **Navigiere zur Website**
3. **Klicke auf verschiedene CTAs**
4. **Prüfe, ob Events in Real-Time erscheinen**

---

## 📋 Event-Übersicht (Tabelle)

| Event-Name | Kategorie | Label | Seiten | Beschreibung |
|------------|-----------|-------|--------|--------------|
| **Personality Test CTA Clicked** | Conversion | Position: hero/footer | /persoenlichkeitstest | CTA-Button für Persönlichkeitstest |
| **Luna Chat Opened** | Engagement | Chat Widget | Alle Seiten | Generisches Chat-Öffnen |
| **Luna Chat Opened** | Engagement | Source: [Quelle] | /, /persoenlichkeitstest | Quellen-spezifisches Chat-Öffnen |
| **Appointment Button Clicked** | Conversion | Lemniscus Booking | Alle Seiten | Termin-Buchung über Lemniscus |
| **Contact Form Submitted** | Conversion | Contact Form | /kontakt | Kontaktformular-Submission |
| **Premium Checkout Started** | Conversion | Premium Page | /premium | Premium-Checkout gestartet |
| **Premium Purchase Completed** | Conversion | Success Page | /premium/success | Premium-Kauf abgeschlossen |
| **Admin Login** | Admin | Admin Dashboard | Footer | Admin-Login über Footer-Link |

---

## 🎯 Conversion-Rate-Berechnung

### Persönlichkeitstest-Conversion

```
Conversion Rate = (Luna Chat Opened from Personality Test) / (Page Views /persoenlichkeitstest) * 100%
```

**Beispiel:**
- 1000 Page Views auf `/persoenlichkeitstest`
- 250 Luna Chat Opened from "Personality Test Hero" oder "Personality Test Footer"
- **Conversion Rate: 25%**

### CTA-Position-Analyse

```
Hero Conversion = (Luna Chat Opened from "Personality Test Hero") / (Page Views /persoenlichkeitstest) * 100%
Footer Conversion = (Luna Chat Opened from "Personality Test Footer") / (Page Views /persoenlichkeitstest) * 100%
```

**Beispiel:**
- 1000 Page Views
- 180 Clicks auf Hero-CTA → **18% Conversion**
- 70 Clicks auf Footer-CTA → **7% Conversion**
- **Ergebnis:** Hero-CTA konvertiert 2.5x besser als Footer-CTA

---

## 🚀 Nächste Schritte

### Empfohlene Erweiterungen

1. **Scroll-Tracking:**
   - Messen, wie weit User auf `/persoenlichkeitstest` scrollen
   - Event: `Engagement → Page Scroll` mit Labels: 25%, 50%, 75%, 100%

2. **Time-on-Page-Tracking:**
   - Messen, wie lange User auf `/persoenlichkeitstest` bleiben
   - Event: `Engagement → Time on Page` mit Labels: <30s, 30-60s, 60-120s, >120s

3. **Luna-Conversation-Tracking:**
   - Messen, wie viele Nachrichten User mit Luna austauschen
   - Event: `Engagement → Luna Messages Sent` mit Count

4. **PDF-Download-Tracking:**
   - Messen, wie viele User ihre Analyse per E-Mail anfordern
   - Event: `Conversion → Analysis PDF Requested`

5. **Exit-Intent-Tracking:**
   - Messen, wann User die Seite verlassen (ohne Conversion)
   - Event: `Engagement → Exit Intent` mit Labels: Seite

---

## 📝 Best Practices

### Event-Naming

- **Kategorie:** Immer Großbuchstaben am Anfang (z.B. "Conversion", "Engagement")
- **Action:** Beschreibend und konsistent (z.B. "Button Clicked", "Form Submitted")
- **Label:** Zusätzliche Kontext-Informationen (z.B. "Position: hero", "Source: Home")

### Tracking-Code

- **Immer vor der Aktion tracken:**
  ```typescript
  onClick={() => {
    trackEvent(...); // Erst tracken
    doAction();      // Dann Aktion ausführen
  }}
  ```

- **Quellen-spezifisches Tracking bevorzugen:**
  ```typescript
  // ✅ Gut: Quellen-Information
  trackLunaChatOpenedFrom("Home Hero");
  
  // ❌ Schlecht: Keine Quellen-Information
  trackLunaChatOpened();
  ```

### Privacy & GDPR

- **Cookie-Consent:** User müssen Analytics-Cookies akzeptieren (bereits implementiert via CookieConsent-Component)
- **IP-Anonymisierung:** Automatisch durch Google Analytics 4
- **Datenschutzerklärung:** Muss Analytics-Nutzung erwähnen (bereits auf /datenschutz)

---

## 🔗 Ressourcen

- **Google Analytics 4:** https://analytics.google.com/
- **React-GA4 Dokumentation:** https://github.com/codler/react-ga4
- **Google Analytics Events:** https://developers.google.com/analytics/devguides/collection/ga4/events

---

**Status:** ✅ Vollständig implementiert und bereit für Production

**Letzte Aktualisierung:** 20. Januar 2026
