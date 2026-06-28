// Generates BACKLOG.md — a numbered backlog of 200 open feature ideas.
// Run with: node scripts/generate-backlog.js
// The list is intentionally exhaustive and forward-looking; items here are NOT
// yet implemented (implemented features live in FEATURES.md).

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sections = [
  ['Suche & Discovery', [
    'Barcode-/EAN-Scan per Handykamera zur Produktsuche',
    'Sprachsuche per Mikrofon (Speech-to-Text)',
    'Bildersuche: Produkt per Foto erkennen und vergleichen',
    'Gespeicherte Suchen mit Treffer-Benachrichtigung',
    'Facetten-Suche mit Live-Trefferzahl pro Filterwert',
    'Synonym- und Tippfehler-Wörterbuch für Fahrradbegriffe',
    'Suche mit logischen Operatoren (UND/ODER/NICHT)',
    'Filter-Chips über der Trefferliste (entfernbar)',
    'Trending-Suchen / beliebte Suchbegriffe der Woche',
    'Suchergebnis-Teilen per Link mit allen aktiven Filtern',
    'Zuletzt angesehene Produkte als eigene Leiste',
  ]],
  ['Preisvergleich & Preislogik', [
    'Preis pro Einheit (€/kg, €/Stück, €/Wh) berechnen und anzeigen',
    'Gebraucht- vs. Neupreis je Produkt gegenüberstellen',
    'Live-Währungsumrechnung für ausländische Shops',
    'Gesamtkosten inkl. Zoll/Einfuhr für Drittland-Shops',
    'Gutschein automatisch auf den Endpreis anrechnen',
    'Preis-Matching/Bestpreisgarantie-Hinweis je Händler',
    'Ratenzahlung/Finanzierungsrechner je Angebot',
    'Bundle-Preis (Rad + Zubehör) gegen Einzelkauf vergleichen',
    'Preisverteilung als Histogramm über alle Händler',
    'Cashback-/Bonus-Hinweise pro Händler',
    'Mengenrabatt-Staffeln bei Verschleißteilen anzeigen',
  ]],
  ['Deals & Aktionen', [
    'Saisonale Aktions-Hubs (Black Friday, Saisonschluss)',
    'Countdown-Timer für befristete Angebote',
    'Deal-Qualitäts-Score (Rabatttiefe x Preisverlauf)',
    'Community-Voting für Deals (heiß/kalt)',
    'Personalisierter Deal-Feed nach Interessen',
    'Deal-Kategorien-Seiten (nur E-Bikes, nur Zubehör …)',
    'Ablaufende Deals „läuft bald aus"-Sektion',
    'Restposten-/B-Ware-Markierung und Filter',
    'Preisfehler-Erkennung (auffällig niedrige Preise)',
    'Deal-Embed-Widget für externe Seiten',
    'Wöchentliche Deal-Zusammenfassung generieren',
  ]],
  ['Preisalarme & Benachrichtigungen', [
    'E-Mail-Versand für ausgelöste Preisalarme',
    'Web-Push-Benachrichtigungen (Service Worker)',
    'Prozentualer Alarm (z. B. „bei -20%")',
    'Prognose des nächsten erwarteten Preistiefs (ML)',
    'Alarm-Schnappschuss mit Preisverlauf im E-Mail',
    'Stündliche/​tägliche Auswertung der Alarme als Cronjob',
    'Bündel-Benachrichtigung (Digest statt Einzelmails)',
    'Alarm für eine ganze Kategorie/Marke statt Einzelprodukt',
    'Alarm-Pausieren und Ablaufdatum',
    'Telegram-/Messenger-Bot für Alarme',
    'Lagerbestand-Schwellen-Alarm (nur X Stück verfügbar)',
  ]],
  ['Filter, Sortierung & Navigation', [
    'Filter-Voreinstellungen speichern und benennen',
    'URL-basierte, teilbare Filterzustände mit Kurz-Link',
    'Mehrfachauswahl pro Filter (mehrere Marken gleichzeitig)',
    'Sortierung nach Preis-Einschätzung (bester Deal zuerst)',
    'Geometrie-Filter (Reach/Stack) für Rennräder',
    'Gewicht-Filter (z. B. Rad < 12 kg)',
    'Filter nach Lieferzeit/Express-Versand',
    'Filter nach Nachhaltigkeits-/Reparatur-Kriterien',
    'Breadcrumb-Navigation mit Kategorie-Hierarchie',
    'Endlos-Scroll als Alternative zur Pagination',
  ]],
  ['Produktdaten & Detailseite', [
    'Echte Bildergalerie mit mehreren Ansichten & Zoom',
    'Produkt-Matching: identische Artikel mehrerer Shops zusammenführen',
    'Größentabelle und Geometrie-Daten für Fahrräder',
    'Kompatibilitätsprüfung für Komponenten (z. B. Standards)',
    'Energie-/Nachhaltigkeitslabel je Produkt',
    'Produktdatenblatt als PDF-Export',
    '360°-Produktansicht',
    'Technische Datentabelle mit Vergleich zum Klassendurchschnitt',
    'Häufige Fragen je Produkt (Q&A)',
    'Verfügbarkeits-Historie (wie oft ausverkauft)',
    'Varianten-Auswahl (Größe/Farbe) mit eigenem Preis',
  ]],
  ['Händler, Datenquellen & Ingestion', [
    'Echte Händler-Anbindung per Produkt-Feed (CSV/XML)',
    'Regelkonformes Web-Scraping mit robots.txt-Beachtung',
    'Geplante automatische Preisaktualisierung (Scheduler)',
    'Feed-Monitoring mit Fehler-Alarmen bei Ausfällen',
    'Daten-Normalisierungs-Pipeline mit Mapping-Regeln',
    'Händler-Detailseite mit Bewertungen und Versandinfos',
    'Filter nach Versandland und Lieferregion',
    'Fake-Rabatt-Erkennung (UVP-Plausibilitätsprüfung)',
    'Nutzer können falsche Preise/Defekte Links melden',
    'Dublettenerkennung über EAN/MPN',
    'Verfügbarkeits-Crawler mit Caching und Rate-Limiting',
  ]],
  ['Nutzerkonto, Auth & Sicherheit', [
    'Login über Drittanbieter (Google, Apple) via OAuth',
    'E-Mail-Verifizierung bei Registrierung',
    'Passwort-zurücksetzen per E-Mail-Token',
    'Zwei-Faktor-Authentifizierung (TOTP)',
    'Sitzungsverwaltung: aktive Geräte anzeigen/abmelden',
    'Rate-Limiting und Brute-Force-Schutz beim Login',
    'CSRF-Schutz und sichere httpOnly-Cookies',
    'Rollen/Rechte (Nutzer, Redakteur, Admin)',
    'Account-Sperre und Wiederherstellung',
    'Audit-Log sicherheitsrelevanter Kontoaktionen',
    'Passwortstärke-Anzeige und Have-I-Been-Pwned-Check',
  ]],
  ['Personalisierung & Empfehlungen', [
    'Profil mit bevorzugten Marken und Kategorien',
    'Personalisierte Startseite nach Interessen',
    'Einstellbares Standardland/Region für Versand',
    'Empfehlungen „Kunden interessierten sich auch für"',
    'Budget-Profil mit passenden Vorschlägen',
    'Onboarding-Fragebogen für Einsteiger',
    'Merkmal-basierte Ähnlichkeits-Empfehlungen',
    'Wiedervorlage „Du hast dir das angesehen"',
    'A/B-getestete Empfehlungs-Algorithmen',
    'Saison-/wetterbasierte Vorschläge',
  ]],
  ['Community & nutzergenerierte Inhalte', [
    'Produktrezensionen mit Text, Sternen und Fotos',
    'Verifizierte-Kauf-Markierung bei Rezensionen',
    'Hilfreich-Abstimmung für Rezensionen',
    'Kommentare und Diskussion zu Deals',
    'Nutzer reichen eigene Deals ein (mit Moderation)',
    'Reputations-/Karma-System für aktive Nutzer',
    'Melde-Funktion für unpassende Inhalte',
    'Frage-und-Antwort-Bereich je Produkt',
    'Öffentliche Nutzerprofile mit Aktivität',
    'Bestenlisten der Top-Dealjäger',
    'Foren/Community-Bereich nach Themen',
  ]],
  ['Content, Ratgeber & SEO', [
    'Kaufratgeber-Artikel (Blog) mit CMS',
    'Größenrechner-Artikel mit interaktivem Tool',
    'Vergleichs-Landingpages („Beste E-Bikes unter 2000 €")',
    'Strukturierte Daten (schema.org Product/Offer)',
    'Automatische Sitemap und robots.txt',
    'Meta-Tags & Open-Graph pro Produktseite (SSR)',
    'Glossar mit Verlinkung aus Produkttexten',
    'Saisonale Themen-Specials redaktionell',
    'Newsletter-Archiv als durchsuchbare Seite',
    'Mehrsprachige Inhalte mit Übersetzungs-Workflow',
  ]],
  ['E-Bike-spezifisch', [
    'Reichweiten-Rechner nach Akku, Gewicht und Profil',
    'Motor-/Akku-Vergleichsmatrix',
    'Filter nach Motorposition (Mittel-/Nabenmotor)',
    'Kosten-pro-Kilometer-Schätzung für E-Bikes',
    'Förderungs-/Leasing-Hinweise (z. B. Dienstrad)',
    'Akku-Lebensdauer- und Garantie-Vergleich',
    'Kompatible Nachrüst-Akkus und Zubehör',
    'Gesetzliche Klassifizierung (Pedelec/S-Pedelec) erklären',
  ]],
  ['Kaufberatung & Passform', [
    'Rahmengrößen-Rechner nach Körpermaßen',
    'Geometrie-Vergleich zweier Räder visualisiert',
    'Einsatzzweck-Berater (Pendeln, Touren, Sport)',
    'Schritthöhen-Messanleitung mit Eingabe',
    'Reifen-/Schlauch-Größenfinder nach ETRTO',
    'Komponenten-Upgrade-Berater mit Budget',
    'Wartungs-Kostenschätzung über die Nutzungsdauer',
    'Checkliste „Worauf beim Kauf achten" je Kategorie',
  ]],
  ['Nachhaltigkeit & Gebrauchtmarkt', [
    'Gebrauchtmarkt-Integration mit Zustandsangaben',
    'CO₂-/Reparierbarkeits-Score je Produkt',
    'Refurbished-/Leasing-Rückläufer-Bereich',
    'Ersatzteil-Verfügbarkeit als Langlebigkeits-Indikator',
    'Recycling-/Rücknahme-Hinweise je Marke',
    'Lokale Händler/Werkstätten in der Nähe anzeigen',
    'Tausch-/Verschenk-Bereich der Community',
    'Hinweis auf reparaturfreundliche Standards',
  ]],
  ['Internationalisierung & Lokalisierung', [
    'Mehrsprachige UI (i18n-Framework, DE/EN zuerst)',
    'Länderspezifische Preise und Steuern',
    'Lokalisierte Zahlen-, Datums- und Währungsformate',
    'Rechts-nach-links-Unterstützung (RTL)',
    'Geo-IP-basierte Standardregion',
    'Länderspezifische Versand- und Rückgaberegeln',
  ]],
  ['Mobile, PWA & Apps', [
    'Progressive Web App mit Offline-Cache',
    'Installierbares Web-App-Manifest und Icons',
    'Push-Benachrichtigungen auf Mobilgeräten',
    'Native App (iOS/Android) mit geteiltem Backend',
    'Home-Screen-Widget mit Top-Deals',
    'Teilen über das native Share-Sheet',
    'Haptisches Feedback und Touch-Gesten',
    'Kamera-Integration für Barcode-Scan in der App',
  ]],
  ['Barrierefreiheit & UX', [
    'WCAG-2.2-AA-Audit und Behebung der Befunde',
    'Vollständige Tastatur-Navigation inkl. Fokus-Ringe',
    'Screenreader-Tests und ARIA-Verbesserungen',
    'Kontrast-/Schriftgrößen-Einstellungen',
    'Reduzierte-Bewegung-Modus respektieren',
    'Skip-Links und Landmark-Struktur',
    'Fehlermeldungen barrierefrei ankündigen (aria-live)',
    'Mehrere Theme-Varianten (Hochkontrast, Sepia)',
  ]],
  ['Performance & Infrastruktur', [
    'Server-Side-Rendering für schnelle Erstanzeige & SEO',
    'CDN-Anbindung und HTTP-Caching-Strategie',
    'Bild-Optimierung (WebP/AVIF, responsive srcset)',
    'Datenbank statt JSON-Datei (z. B. SQLite/Postgres)',
    'Volltext-Suchindex (z. B. invertierter Index)',
    'API-Pagination per Cursor für große Datenmengen',
    'Lasttests und Performance-Budget in CI',
    'Containerisierung (Docker) und Deploy-Pipeline',
  ]],
  ['Analytics, Monitoring & Business', [
    'Datenschutzkonforme Web-Analytics (ohne Cookies)',
    'Fehler-Tracking und Alerting (z. B. Sentry-kompatibel)',
    'Uptime-Monitoring und Health-Check-Endpunkt',
    'Klick-/Conversion-Tracking für Affiliate-Links',
    'Admin-Dashboard mit Kennzahlen (Deals, Klicks, Nutzer)',
    'A/B-Test-Framework mit Feature-Flags',
    'Preis-Trend-Report über alle Kategorien',
    'Funnel-Analyse von Suche bis Shop-Klick',
  ]],
  ['Admin, Moderation & Tooling', [
    'Admin-Oberfläche zur Produkt-/Händlerpflege',
    'Moderations-Queue für gemeldete Inhalte',
    'Manuelles Kuratieren von Top-Deals',
    'Bulk-Import/-Export von Katalogdaten',
    'Rollenbasierte Admin-Berechtigungen',
    'Redaktions-Workflow für Artikel (Entwurf/Review)',
    'Feature-Flag-Verwaltung im Admin',
  ]],
  ['API, Integrationen & Entwickler', [
    'Öffentliche, dokumentierte REST-API mit OpenAPI-Spec',
    'API-Schlüssel und Rate-Limiting für Drittnutzer',
    'GraphQL-Endpunkt als Alternative',
    'Webhooks für Preis-/Deal-Ereignisse',
    'Browser-Extension mit Preis-Overlay auf Shop-Seiten',
    'Affiliate-Netzwerk-Integrationen (Awin, etc.)',
    'Export der Preisdaten als offene Datensätze',
  ]],
  ['Datenschutz, Recht & Compliance', [
    'Cookie-/Consent-Banner mit granularen Optionen',
    'Datenschutzerklärung und Impressum als Seiten',
    'Einwilligungs-Verwaltung und Opt-out',
    'Daten-Aufbewahrungsfristen und Auto-Löschung',
    'Barrierefreiheitserklärung (BFSG)',
    'Preisangaben-Pflichten (Grundpreis, Versand) prüfen',
  ]],
];

let n = 0;
const lines = [];
lines.push('# Backlog – Alles ums Fahrrad: Günstiger-Preis-Finder');
lines.push('');
lines.push('200 offene Feature-Ideen zur späteren Umsetzung. Alle Punkte sind **noch nicht**');
lines.push('implementiert – bereits umgesetzte Features stehen in [`FEATURES.md`](FEATURES.md).');
lines.push('');
lines.push('Jeder Eintrag hat eine stabile ID (`B001`–`B200`) und eine Checkbox. Beim Abarbeiten');
lines.push('die Box ankreuzen (`[x]`) und das Feature nach `FEATURES.md` überführen.');
lines.push('');
lines.push('> Hinweis: Manche Punkte erweitern bereits vorhandene Funktionen (z. B. echte');
lines.push('> Bildergalerie statt Platzhalter) oder ersetzen Prototyp-Lösungen durch');
lines.push('> produktionsreife (echte Händler-Feeds, Datenbank, E-Mail-Versand).');
lines.push('');

for (const [title, items] of sections) {
  lines.push(`## ${title}`);
  lines.push('');
  for (const item of items) {
    n += 1;
    const id = 'B' + String(n).padStart(3, '0');
    lines.push(`- [ ] **${id}** – ${item}`);
  }
  lines.push('');
}

if (n !== 200) {
  console.error(`Erwartet 200 Einträge, erzeugt ${n}. Bitte Liste anpassen.`);
  process.exit(1);
}

lines.push('---');
lines.push('');
lines.push(`_${n} Einträge. Generiert mit \`node scripts/generate-backlog.js\`._`);
lines.push('');

writeFileSync(join(__dirname, '..', 'BACKLOG.md'), lines.join('\n'));
console.log(`Wrote BACKLOG.md with ${n} items.`);
