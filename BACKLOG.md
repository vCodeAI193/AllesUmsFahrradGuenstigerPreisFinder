# Backlog – Alles ums Fahrrad: Günstiger-Preis-Finder

200 offene Feature-Ideen zur späteren Umsetzung. Alle Punkte sind **noch nicht**
implementiert – bereits umgesetzte Features stehen in [`FEATURES.md`](FEATURES.md).

Jeder Eintrag hat eine stabile ID (`B001`–`B200`) und eine Checkbox. Beim Abarbeiten
die Box ankreuzen (`[x]`) und das Feature nach `FEATURES.md` überführen.

> Hinweis: Manche Punkte erweitern bereits vorhandene Funktionen (z. B. echte
> Bildergalerie statt Platzhalter) oder ersetzen Prototyp-Lösungen durch
> produktionsreife (echte Händler-Feeds, Datenbank, E-Mail-Versand).

## Suche & Discovery

- [ ] **B001** – Barcode-/EAN-Scan per Handykamera zur Produktsuche
- [ ] **B002** – Sprachsuche per Mikrofon (Speech-to-Text)
- [ ] **B003** – Bildersuche: Produkt per Foto erkennen und vergleichen
- [ ] **B004** – Gespeicherte Suchen mit Treffer-Benachrichtigung
- [ ] **B005** – Facetten-Suche mit Live-Trefferzahl pro Filterwert
- [ ] **B006** – Synonym- und Tippfehler-Wörterbuch für Fahrradbegriffe
- [ ] **B007** – Suche mit logischen Operatoren (UND/ODER/NICHT)
- [ ] **B008** – Filter-Chips über der Trefferliste (entfernbar)
- [ ] **B009** – Trending-Suchen / beliebte Suchbegriffe der Woche
- [ ] **B010** – Suchergebnis-Teilen per Link mit allen aktiven Filtern
- [x] **B011** – Zuletzt angesehene Produkte als eigene Leiste

## Preisvergleich & Preislogik

- [x] **B012** – Preis pro Einheit (€/kg, €/Stück, €/Wh) berechnen und anzeigen
- [ ] **B013** – Gebraucht- vs. Neupreis je Produkt gegenüberstellen
- [ ] **B014** – Live-Währungsumrechnung für ausländische Shops
- [ ] **B015** – Gesamtkosten inkl. Zoll/Einfuhr für Drittland-Shops
- [ ] **B016** – Gutschein automatisch auf den Endpreis anrechnen
- [ ] **B017** – Preis-Matching/Bestpreisgarantie-Hinweis je Händler
- [ ] **B018** – Ratenzahlung/Finanzierungsrechner je Angebot
- [ ] **B019** – Bundle-Preis (Rad + Zubehör) gegen Einzelkauf vergleichen
- [ ] **B020** – Preisverteilung als Histogramm über alle Händler
- [ ] **B021** – Cashback-/Bonus-Hinweise pro Händler
- [ ] **B022** – Mengenrabatt-Staffeln bei Verschleißteilen anzeigen

## Deals & Aktionen

- [ ] **B023** – Saisonale Aktions-Hubs (Black Friday, Saisonschluss)
- [ ] **B024** – Countdown-Timer für befristete Angebote
- [ ] **B025** – Deal-Qualitäts-Score (Rabatttiefe x Preisverlauf)
- [ ] **B026** – Community-Voting für Deals (heiß/kalt)
- [ ] **B027** – Personalisierter Deal-Feed nach Interessen
- [ ] **B028** – Deal-Kategorien-Seiten (nur E-Bikes, nur Zubehör …)
- [ ] **B029** – Ablaufende Deals „läuft bald aus"-Sektion
- [ ] **B030** – Restposten-/B-Ware-Markierung und Filter
- [ ] **B031** – Preisfehler-Erkennung (auffällig niedrige Preise)
- [ ] **B032** – Deal-Embed-Widget für externe Seiten
- [ ] **B033** – Wöchentliche Deal-Zusammenfassung generieren

## Preisalarme & Benachrichtigungen

- [ ] **B034** – E-Mail-Versand für ausgelöste Preisalarme
- [ ] **B035** – Web-Push-Benachrichtigungen (Service Worker)
- [ ] **B036** – Prozentualer Alarm (z. B. „bei -20%")
- [ ] **B037** – Prognose des nächsten erwarteten Preistiefs (ML)
- [ ] **B038** – Alarm-Schnappschuss mit Preisverlauf im E-Mail
- [ ] **B039** – Stündliche/​tägliche Auswertung der Alarme als Cronjob
- [ ] **B040** – Bündel-Benachrichtigung (Digest statt Einzelmails)
- [ ] **B041** – Alarm für eine ganze Kategorie/Marke statt Einzelprodukt
- [ ] **B042** – Alarm-Pausieren und Ablaufdatum
- [ ] **B043** – Telegram-/Messenger-Bot für Alarme
- [ ] **B044** – Lagerbestand-Schwellen-Alarm (nur X Stück verfügbar)

## Filter, Sortierung & Navigation

- [ ] **B045** – Filter-Voreinstellungen speichern und benennen
- [ ] **B046** – URL-basierte, teilbare Filterzustände mit Kurz-Link
- [ ] **B047** – Mehrfachauswahl pro Filter (mehrere Marken gleichzeitig)
- [ ] **B048** – Sortierung nach Preis-Einschätzung (bester Deal zuerst)
- [ ] **B049** – Geometrie-Filter (Reach/Stack) für Rennräder
- [ ] **B050** – Gewicht-Filter (z. B. Rad < 12 kg)
- [ ] **B051** – Filter nach Lieferzeit/Express-Versand
- [ ] **B052** – Filter nach Nachhaltigkeits-/Reparatur-Kriterien
- [ ] **B053** – Breadcrumb-Navigation mit Kategorie-Hierarchie
- [ ] **B054** – Endlos-Scroll als Alternative zur Pagination

## Produktdaten & Detailseite

- [ ] **B055** – Echte Bildergalerie mit mehreren Ansichten & Zoom
- [ ] **B056** – Produkt-Matching: identische Artikel mehrerer Shops zusammenführen
- [ ] **B057** – Größentabelle und Geometrie-Daten für Fahrräder
- [ ] **B058** – Kompatibilitätsprüfung für Komponenten (z. B. Standards)
- [ ] **B059** – Energie-/Nachhaltigkeitslabel je Produkt
- [ ] **B060** – Produktdatenblatt als PDF-Export
- [ ] **B061** – 360°-Produktansicht
- [ ] **B062** – Technische Datentabelle mit Vergleich zum Klassendurchschnitt
- [ ] **B063** – Häufige Fragen je Produkt (Q&A)
- [ ] **B064** – Verfügbarkeits-Historie (wie oft ausverkauft)
- [ ] **B065** – Varianten-Auswahl (Größe/Farbe) mit eigenem Preis

## Händler, Datenquellen & Ingestion

- [ ] **B066** – Echte Händler-Anbindung per Produkt-Feed (CSV/XML)
- [ ] **B067** – Regelkonformes Web-Scraping mit robots.txt-Beachtung
- [ ] **B068** – Geplante automatische Preisaktualisierung (Scheduler)
- [ ] **B069** – Feed-Monitoring mit Fehler-Alarmen bei Ausfällen
- [ ] **B070** – Daten-Normalisierungs-Pipeline mit Mapping-Regeln
- [ ] **B071** – Händler-Detailseite mit Bewertungen und Versandinfos
- [ ] **B072** – Filter nach Versandland und Lieferregion
- [ ] **B073** – Fake-Rabatt-Erkennung (UVP-Plausibilitätsprüfung)
- [ ] **B074** – Nutzer können falsche Preise/Defekte Links melden
- [ ] **B075** – Dublettenerkennung über EAN/MPN
- [ ] **B076** – Verfügbarkeits-Crawler mit Caching und Rate-Limiting

## Nutzerkonto, Auth & Sicherheit

- [ ] **B077** – Login über Drittanbieter (Google, Apple) via OAuth
- [ ] **B078** – E-Mail-Verifizierung bei Registrierung
- [ ] **B079** – Passwort-zurücksetzen per E-Mail-Token
- [ ] **B080** – Zwei-Faktor-Authentifizierung (TOTP)
- [ ] **B081** – Sitzungsverwaltung: aktive Geräte anzeigen/abmelden
- [ ] **B082** – Rate-Limiting und Brute-Force-Schutz beim Login
- [ ] **B083** – CSRF-Schutz und sichere httpOnly-Cookies
- [ ] **B084** – Rollen/Rechte (Nutzer, Redakteur, Admin)
- [ ] **B085** – Account-Sperre und Wiederherstellung
- [ ] **B086** – Audit-Log sicherheitsrelevanter Kontoaktionen
- [ ] **B087** – Passwortstärke-Anzeige und Have-I-Been-Pwned-Check

## Personalisierung & Empfehlungen

- [x] **B088** – Profil mit bevorzugten Marken und Kategorien
- [x] **B089** – Personalisierte Startseite nach Interessen
- [ ] **B090** – Einstellbares Standardland/Region für Versand
- [ ] **B091** – Empfehlungen „Kunden interessierten sich auch für"
- [ ] **B092** – Budget-Profil mit passenden Vorschlägen
- [ ] **B093** – Onboarding-Fragebogen für Einsteiger
- [ ] **B094** – Merkmal-basierte Ähnlichkeits-Empfehlungen
- [ ] **B095** – Wiedervorlage „Du hast dir das angesehen"
- [ ] **B096** – A/B-getestete Empfehlungs-Algorithmen
- [ ] **B097** – Saison-/wetterbasierte Vorschläge

## Community & nutzergenerierte Inhalte

- [ ] **B098** – Produktrezensionen mit Text, Sternen und Fotos
- [ ] **B099** – Verifizierte-Kauf-Markierung bei Rezensionen
- [ ] **B100** – Hilfreich-Abstimmung für Rezensionen
- [ ] **B101** – Kommentare und Diskussion zu Deals
- [ ] **B102** – Nutzer reichen eigene Deals ein (mit Moderation)
- [ ] **B103** – Reputations-/Karma-System für aktive Nutzer
- [ ] **B104** – Melde-Funktion für unpassende Inhalte
- [ ] **B105** – Frage-und-Antwort-Bereich je Produkt
- [ ] **B106** – Öffentliche Nutzerprofile mit Aktivität
- [ ] **B107** – Bestenlisten der Top-Dealjäger
- [ ] **B108** – Foren/Community-Bereich nach Themen

## Content, Ratgeber & SEO

- [ ] **B109** – Kaufratgeber-Artikel (Blog) mit CMS
- [ ] **B110** – Größenrechner-Artikel mit interaktivem Tool
- [ ] **B111** – Vergleichs-Landingpages („Beste E-Bikes unter 2000 €")
- [ ] **B112** – Strukturierte Daten (schema.org Product/Offer)
- [ ] **B113** – Automatische Sitemap und robots.txt
- [ ] **B114** – Meta-Tags & Open-Graph pro Produktseite (SSR)
- [ ] **B115** – Glossar mit Verlinkung aus Produkttexten
- [ ] **B116** – Saisonale Themen-Specials redaktionell
- [ ] **B117** – Newsletter-Archiv als durchsuchbare Seite
- [ ] **B118** – Mehrsprachige Inhalte mit Übersetzungs-Workflow

## E-Bike-spezifisch

- [ ] **B119** – Reichweiten-Rechner nach Akku, Gewicht und Profil
- [ ] **B120** – Motor-/Akku-Vergleichsmatrix
- [ ] **B121** – Filter nach Motorposition (Mittel-/Nabenmotor)
- [ ] **B122** – Kosten-pro-Kilometer-Schätzung für E-Bikes
- [ ] **B123** – Förderungs-/Leasing-Hinweise (z. B. Dienstrad)
- [ ] **B124** – Akku-Lebensdauer- und Garantie-Vergleich
- [ ] **B125** – Kompatible Nachrüst-Akkus und Zubehör
- [ ] **B126** – Gesetzliche Klassifizierung (Pedelec/S-Pedelec) erklären

## Kaufberatung & Passform

- [ ] **B127** – Rahmengrößen-Rechner nach Körpermaßen
- [ ] **B128** – Geometrie-Vergleich zweier Räder visualisiert
- [ ] **B129** – Einsatzzweck-Berater (Pendeln, Touren, Sport)
- [ ] **B130** – Schritthöhen-Messanleitung mit Eingabe
- [ ] **B131** – Reifen-/Schlauch-Größenfinder nach ETRTO
- [ ] **B132** – Komponenten-Upgrade-Berater mit Budget
- [ ] **B133** – Wartungs-Kostenschätzung über die Nutzungsdauer
- [ ] **B134** – Checkliste „Worauf beim Kauf achten" je Kategorie

## Nachhaltigkeit & Gebrauchtmarkt

- [ ] **B135** – Gebrauchtmarkt-Integration mit Zustandsangaben
- [ ] **B136** – CO₂-/Reparierbarkeits-Score je Produkt
- [ ] **B137** – Refurbished-/Leasing-Rückläufer-Bereich
- [ ] **B138** – Ersatzteil-Verfügbarkeit als Langlebigkeits-Indikator
- [ ] **B139** – Recycling-/Rücknahme-Hinweise je Marke
- [ ] **B140** – Lokale Händler/Werkstätten in der Nähe anzeigen
- [ ] **B141** – Tausch-/Verschenk-Bereich der Community
- [ ] **B142** – Hinweis auf reparaturfreundliche Standards

## Internationalisierung & Lokalisierung

- [ ] **B143** – Mehrsprachige UI (i18n-Framework, DE/EN zuerst)
- [ ] **B144** – Länderspezifische Preise und Steuern
- [ ] **B145** – Lokalisierte Zahlen-, Datums- und Währungsformate
- [ ] **B146** – Rechts-nach-links-Unterstützung (RTL)
- [ ] **B147** – Geo-IP-basierte Standardregion
- [ ] **B148** – Länderspezifische Versand- und Rückgaberegeln

## Mobile, PWA & Apps

- [x] **B149** – Progressive Web App mit Offline-Cache
- [x] **B150** – Installierbares Web-App-Manifest und Icons
- [ ] **B151** – Push-Benachrichtigungen auf Mobilgeräten
- [ ] **B152** – Native App (iOS/Android) mit geteiltem Backend
- [ ] **B153** – Home-Screen-Widget mit Top-Deals
- [ ] **B154** – Teilen über das native Share-Sheet
- [ ] **B155** – Haptisches Feedback und Touch-Gesten
- [ ] **B156** – Kamera-Integration für Barcode-Scan in der App

## Barrierefreiheit & UX

- [ ] **B157** – WCAG-2.2-AA-Audit und Behebung der Befunde
- [ ] **B158** – Vollständige Tastatur-Navigation inkl. Fokus-Ringe
- [ ] **B159** – Screenreader-Tests und ARIA-Verbesserungen
- [ ] **B160** – Kontrast-/Schriftgrößen-Einstellungen
- [ ] **B161** – Reduzierte-Bewegung-Modus respektieren
- [ ] **B162** – Skip-Links und Landmark-Struktur
- [ ] **B163** – Fehlermeldungen barrierefrei ankündigen (aria-live)
- [ ] **B164** – Mehrere Theme-Varianten (Hochkontrast, Sepia)

## Performance & Infrastruktur

- [ ] **B165** – Server-Side-Rendering für schnelle Erstanzeige & SEO
- [ ] **B166** – CDN-Anbindung und HTTP-Caching-Strategie
- [ ] **B167** – Bild-Optimierung (WebP/AVIF, responsive srcset)
- [ ] **B168** – Datenbank statt JSON-Datei (z. B. SQLite/Postgres)
- [ ] **B169** – Volltext-Suchindex (z. B. invertierter Index)
- [ ] **B170** – API-Pagination per Cursor für große Datenmengen
- [ ] **B171** – Lasttests und Performance-Budget in CI
- [ ] **B172** – Containerisierung (Docker) und Deploy-Pipeline

## Analytics, Monitoring & Business

- [ ] **B173** – Datenschutzkonforme Web-Analytics (ohne Cookies)
- [ ] **B174** – Fehler-Tracking und Alerting (z. B. Sentry-kompatibel)
- [ ] **B175** – Uptime-Monitoring und Health-Check-Endpunkt
- [ ] **B176** – Klick-/Conversion-Tracking für Affiliate-Links
- [ ] **B177** – Admin-Dashboard mit Kennzahlen (Deals, Klicks, Nutzer)
- [ ] **B178** – A/B-Test-Framework mit Feature-Flags
- [ ] **B179** – Preis-Trend-Report über alle Kategorien
- [ ] **B180** – Funnel-Analyse von Suche bis Shop-Klick

## Admin, Moderation & Tooling

- [ ] **B181** – Admin-Oberfläche zur Produkt-/Händlerpflege
- [ ] **B182** – Moderations-Queue für gemeldete Inhalte
- [ ] **B183** – Manuelles Kuratieren von Top-Deals
- [ ] **B184** – Bulk-Import/-Export von Katalogdaten
- [ ] **B185** – Rollenbasierte Admin-Berechtigungen
- [ ] **B186** – Redaktions-Workflow für Artikel (Entwurf/Review)
- [ ] **B187** – Feature-Flag-Verwaltung im Admin

## API, Integrationen & Entwickler

- [ ] **B188** – Öffentliche, dokumentierte REST-API mit OpenAPI-Spec
- [ ] **B189** – API-Schlüssel und Rate-Limiting für Drittnutzer
- [ ] **B190** – GraphQL-Endpunkt als Alternative
- [ ] **B191** – Webhooks für Preis-/Deal-Ereignisse
- [ ] **B192** – Browser-Extension mit Preis-Overlay auf Shop-Seiten
- [ ] **B193** – Affiliate-Netzwerk-Integrationen (Awin, etc.)
- [ ] **B194** – Export der Preisdaten als offene Datensätze

## Datenschutz, Recht & Compliance

- [ ] **B195** – Cookie-/Consent-Banner mit granularen Optionen
- [ ] **B196** – Datenschutzerklärung und Impressum als Seiten
- [ ] **B197** – Einwilligungs-Verwaltung und Opt-out
- [ ] **B198** – Daten-Aufbewahrungsfristen und Auto-Löschung
- [ ] **B199** – Barrierefreiheitserklärung (BFSG)
- [ ] **B200** – Preisangaben-Pflichten (Grundpreis, Versand) prüfen

---

_200 Einträge. Generiert mit `node scripts/generate-backlog.js`._
