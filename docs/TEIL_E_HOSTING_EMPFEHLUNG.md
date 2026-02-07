# Teil E - Hosting-Analyse & Empfehlung

> **Projekt:** charlybrand.de
> **Analysedatum:** 2026-02-07
> **Aktueller Hoster:** Manus (Deutschland, Node.js-basiert)
> **Status:** Abgeschlossen

---

## 1. Anforderungsprofil

### Technische Anforderungen
- **Runtime:** Node.js (Express + tRPC + Vite SSR)
- **Datenbank:** MySQL (Drizzle ORM)
- **APIs:** OpenAI, Stripe, AWS S3
- **Build:** Vite + esbuild + TypeScript
- **Besonderheit:** Server-Side-Rendering, WebSocket-ähnliche Chat-Funktionalität
- **Speicher:** Mindestens 1 GB RAM, 10 GB Disk

### Regulatorische Anforderungen (DSGVO)
- **Gesundheitsdaten:** Art. 9 DSGVO - besonderer Schutz
- **Serverstandort:** Bevorzugt Deutschland/EU
- **AVV:** Auftragsverarbeitungsvertrag erforderlich
- **Verschlüsselung:** TLS/SSL obligatorisch
- **Backup:** Regelmäßige Sicherungen

---

## 2. Hosting-Vergleichstabelle

| Kriterium | Manus (aktuell) | Strato | all-inkl.com | Cloudflare Pages/Workers |
|---|---|---|---|---|
| **Performance** | ⭐⭐⭐⭐ Gut | ⭐⭐⭐ Mittel | ⭐⭐⭐ Mittel | ⭐⭐⭐⭐⭐ Exzellent (Edge) |
| **SSL/TLS** | ✅ Inkl. | ✅ Inkl. | ✅ Inkl. (Let's Encrypt) | ✅ Inkl. (Universal SSL) |
| **Stack-Kompatibilität** | ✅ Node.js nativ | ⚠️ Nur vServer | ⚠️ Nur vServer (ab Privat Plus) | ❌ **Nicht kompatibel** |
| **MySQL** | ✅ Extern/Managed | ✅ Inkl. (Shared) | ✅ Inkl. (Managed) | ❌ Nur D1 (SQLite) |
| **Node.js** | ✅ Nativ | ⚠️ Nur vServer | ⚠️ Nur vServer | ⚠️ Workers Runtime (eingeschränkt) |
| **Express/tRPC** | ✅ Voll | ✅ vServer | ✅ vServer | ❌ Nicht möglich |
| **Skalierbarkeit** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Preis/Monat** | ~15-30€ (geschätzt) | ab 4€ (vServer V10) | ab 9,95€ (Privat Plus) | ab 0€ (Free Tier) |
| **DSGVO-Konformität** | ✅ DE-Server | ✅ DE-Server | ✅ DE-Server | ⚠️ Global, EU-Config möglich |
| **EU-Standort** | ✅ Deutschland | ✅ Deutschland | ✅ Deutschland | ⚠️ Edge (global verteilt) |
| **AVV verfügbar** | ✅ | ✅ | ✅ | ✅ (Enterprise nötig für vollen Umfang) |
| **Verwaltung** | ⚠️ Manus-spezifisch | ✅ Plesk/CLI | ✅ KAS (eigene Oberfläche) | ✅ Dashboard + Wrangler CLI |
| **E-Mail-Hosting** | ❌ Nicht inkl. | ✅ Inkl. | ✅ Inkl. (unlimitiert) | ❌ Nicht inkl. |
| **Support** | ⚠️ Begrenzt | ✅ 24/7 Telefon | ✅ Telefon + E-Mail | ⚠️ Community + Enterprise |
| **API-Backend** | ✅ Voll | ✅ vServer | ✅ vServer | ⚠️ Workers (10ms CPU-Limit) |
| **Gesundheitsdaten** | ✅ Geeignet | ✅ Geeignet (vServer) | ✅ Geeignet (vServer) | ⚠️ Bedingt (kein DE-only) |
| **DDoS-Schutz** | ⚠️ Basis | ⚠️ Basis | ⚠️ Basis | ✅ Enterprise-Grade |
| **Backup** | ⚠️ Manuell | ✅ Automatisch | ✅ Automatisch | ⚠️ Deployment-basiert |
| **CDN** | ❌ Nicht inkl. | ❌ Nicht inkl. | ❌ Nicht inkl. | ✅ Globales CDN |

---

## 3. Detailbewertung

### 3.1 Manus (Aktuell)

**Vorteile:**
- Node.js nativ unterstützt
- Deutschland-Standort
- Projekt bereits deployed und funktionsfähig
- Keine Migration nötig

**Nachteile:**
- Manus-spezifisches Deployment (nicht Standard)
- Kein E-Mail-Hosting
- Begrenzte Dokumentation/Community
- Abhängigkeit von einem Anbieter
- Kein CDN/Edge-Caching

**Bewertung:** ⭐⭐⭐½ (7/10) - Funktional, aber vendor lock-in

### 3.2 Strato (vServer)

**Vorteile:**
- Etablierter deutscher Anbieter
- Günstige vServer ab 4€/Monat
- Volle Kontrolle (Root-Zugang)
- E-Mail inklusive
- DSGVO-konform, DE-Standort

**Nachteile:**
- Selbst-Administration nötig (Updates, Sicherheit)
- Node.js manuell einrichten
- Kein Managed MySQL (auf vServer selbst betreiben)
- Skalierung = höheren Tarif buchen

**Bewertung:** ⭐⭐⭐ (6/10) - Günstig, aber Admin-Aufwand

### 3.3 all-inkl.com (Privat Plus / vServer)

**Vorteile:**
- Deutscher Anbieter, Rechenzentrum in Sachsen
- Exzellenter Support (persönlich, kompetent)
- E-Mail-Hosting unlimitiert
- Managed MySQL inklusive
- Einfache Verwaltung über KAS
- AVV direkt im Kundencenter
- Sehr gutes Preis-Leistungs-Verhältnis

**Nachteile:**
- Shared Hosting: kein Node.js (nur PHP)
- Node.js nur auf vServer möglich (ab ~14,95€/Monat)
- Weniger bekannt international
- Skalierung begrenzt

**Bewertung:** ⭐⭐⭐⭐ (8/10) - Beste Kombination für DE-Hosting

### 3.4 Cloudflare Pages/Workers

**Vorteile:**
- Globales Edge-Netzwerk (300+ Standorte)
- Extrem schnelle Ladezeiten
- Enterprise-DDoS-Schutz inklusive
- Großzügiges Free Tier
- Moderne Developer Experience

**Nachteile:**
- **NICHT KOMPATIBEL mit aktuellem Stack** (Express/tRPC/MySQL)
- Kein Node.js, nur Workers Runtime
- D1 statt MySQL (SQLite-basiert)
- 10ms CPU-Limit (Free) / 30ms (Paid)
- Kein E-Mail-Hosting
- DSGVO: globale Datenverteilung problematisch
- Komplett-Rewrite nötig

**Bewertung:** ⭐⭐ (4/10) für dieses Projekt - Nicht ohne Rewrite möglich

---

## 4. Empfehlung

### 🏆 Empfohlene Lösung: Hybrides Setup

#### Variante A: Manus beibehalten + Cloudflare als CDN/WAF (EMPFOHLEN)

**Warum:** Geringster Aufwand, maximaler Nutzen, kein Risiko.

```
Nutzer → Cloudflare (CDN/WAF/DDoS) → Manus Server (Node.js/MySQL)
```

**Vorteile:**
- Kein Code-Änderungen nötig
- Sofort bessere Performance (CDN-Caching für statische Assets)
- Enterprise-DDoS-Schutz
- WAF (Web Application Firewall)
- SSL über Cloudflare
- Manus-Server wird entlastet

**Schritte:**
1. Cloudflare-Konto erstellen (Free Plan reicht)
2. Domain `charlybrand.de` auf Cloudflare Nameserver umstellen
3. DNS-Einträge bei Cloudflare konfigurieren (A-Record auf Manus-IP)
4. SSL-Modus: "Full (Strict)"
5. Page Rules für Caching konfigurieren
6. Firewall-Regeln für `/admin/` und `/api/` erstellen

**Kosten:** 0€ (Free Plan) oder 20$/Monat (Pro Plan mit WAF)
**Zeitaufwand:** 1-2 Stunden
**Risiko:** Minimal (DNS-Propagation 24-48h, aber Zero-Downtime möglich)

#### Variante B: Migration zu all-inkl.com vServer (LANGFRISTIG)

**Warum:** Wenn Unabhängigkeit von Manus gewünscht, bester DE-Anbieter.

**Migrationsplan:**

| Phase | Aktion | Dauer | Risiko |
|---|---|---|---|
| 1 | all-inkl vServer bestellen (14,95€/Mo) | 1 Tag | Keines |
| 2 | Server einrichten (Node.js, MySQL, nginx) | 1-2 Tage | Mittel |
| 3 | Codebase deployen und testen | 1 Tag | Mittel |
| 4 | MySQL-Daten migrieren (mysqldump/import) | 2-4 Stunden | Hoch |
| 5 | S3-Konfiguration beibehalten | 30 Min | Keines |
| 6 | DNS umstellen (TTL vorher auf 300s setzen) | 24-48h Propagation | Mittel |
| 7 | SSL-Zertifikat einrichten (Let's Encrypt) | 30 Min | Keines |
| 8 | Monitoring einrichten (pm2, uptimerobot) | 1 Stunde | Keines |

**DNS-Propagation & Downtime-Reduktion:**
```
1. TTL bei aktuellem DNS auf 300 Sekunden setzen (48h vorher)
2. Neuen Server komplett vorbereiten und testen
3. DNS-Einträge ändern (A-Record auf neue IP)
4. Alten Server 72h weiterlaufen lassen (für Cache-Restbestände)
5. SSL-Zertifikat automatisch generieren (Certbot)
6. Erwartete Downtime: 0-5 Minuten (bei korrekter Vorbereitung)
```

**Kosten:** ~14,95-19,95€/Monat
**Zeitaufwand:** 3-5 Tage
**Risiko:** Mittel (gute Planung minimiert)

---

## 5. Zusammenfassung

| Option | Aufwand | Kosten | Empfehlung |
|---|---|---|---|
| **A: Manus + Cloudflare CDN** | 2 Stunden | +0-20$/Mo | ✅ **Sofort umsetzen** |
| **B: all-inkl.com vServer** | 3-5 Tage | ~15-20€/Mo | 📋 Langfristiger Plan |
| Strato vServer | 3-5 Tage | ~4-10€/Mo | ⚠️ Mehr Admin-Aufwand |
| Cloudflare Pages (Rewrite) | 4-8 Wochen | ~0-20$/Mo | ❌ Nicht empfohlen (Rewrite nötig) |

### Klare Empfehlung:
**Variante A jetzt + Variante B evaluieren in 3-6 Monaten.**

Cloudflare vor Manus als Reverse-Proxy gibt sofort bessere Performance, Sicherheit und DDoS-Schutz - ohne jegliche Code-Änderungen.
