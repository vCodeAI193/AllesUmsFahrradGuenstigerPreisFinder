# 🚲 Alles ums Fahrrad – Günstiger-Preis-Finder

> Alle günstigen Preise und Angebote rund ums Fahrrad an einem Ort finden.

Ein Preisvergleichs- und Deal-Finder rund ums Fahrrad: Produkte suchen, Preise
mehrerer Händler vergleichen, Preisverläufe ansehen, Deals entdecken, Produkte
auf eine Merkliste setzen und Preisalarme anlegen.

> **Hinweis:** Dies ist ein lauffähiger Prototyp mit **synthetischen
> Beispieldaten**. Preise, Händler und Verfügbarkeiten sind nicht real – die
> Datenstruktur entspricht aber dem, was eine echte Händler-Anbindung liefern
> würde. Siehe [`VISION.md`](VISION.md) für die Produktvision und
> [`FEATURES.md`](FEATURES.md) für die Roadmap und [`BACKLOG.md`](BACKLOG.md) für
200 weitere offene Feature-Ideen.

## Schnellstart

Voraussetzung: **Node.js ≥ 20** – **keine externen Abhängigkeiten** nötig.

```bash
npm run seed     # erzeugt data/products.json (einmalig / nach Änderungen)
npm start        # startet den Server auf http://localhost:3000
npm test         # führt die Testsuite aus (node --test)
```

Danach im Browser <http://localhost:3000> öffnen. Der Port lässt sich über die
Umgebungsvariable `PORT` ändern (`PORT=8080 npm start`).

## Architektur

Bewusst abhängigkeitsfrei und mit Node-Bordmitteln umgesetzt:

```
scripts/generate-seed.js   Deterministischer Generator für Beispieldaten
data/products.json         Generierter Produktkatalog (Quelle der Wahrheit)
src/price.js               Preis-Analytik (Statistik, "guter Preis", bestes Angebot)
src/data.js                Such-/Filter-/Sortier-/Facetten-Schicht
src/db.js                  Zentraler JSON-Datei-Store (data/store.json)
src/store.js               Merkliste, Preisalarme, Newsletter
src/auth.js                Nutzerkonten: Registrierung/Login (scrypt), Sessions
src/server.js              Zero-Dependency HTTP-Server: JSON-API + Static-Hosting
public/                    Frontend (HTML/CSS/Vanilla-JS-SPA, Hash-Routing)
public/sw.js               Service Worker (PWA: Offline-Cache, App-Shell)
public/manifest.webmanifest  Web-App-Manifest (installierbar)
test/                      Unit- & API-Integrationstests (node:test)
```

## API-Überblick

| Methode & Pfad | Beschreibung |
| --- | --- |
| `GET /api/meta` | Katalog-Metadaten (Anzahl, Händler, Gutscheine) |
| `GET /api/facets` | Filter-Facetten (Kategorien, Marken, Größen …) |
| `GET /api/products` | Suche/Filter/Sortierung/Pagination (Query-Parameter) |
| `GET /api/products/:id` | Produktdetail inkl. Angebote & Preisverlauf |
| `GET /api/products/:id/similar` | Ähnliche Produkte |
| `GET /api/deals` | Top-Deals nach Rabatt |
| `GET /api/suggest?q=` | Autovervollständigung |
| `GET/POST/DELETE /api/wishlist` | Merkliste verwalten |
| `GET/POST/DELETE /api/alerts` | Preisalarme verwalten (Typen: `target`, `drop`, `restock`) |
| `POST /api/auth/register` · `login` · `logout` | Konto erstellen / an- / abmelden |
| `GET/PATCH /api/auth/me` | Eigenes Profil lesen / Anzeigename ändern |
| `GET /api/export` · `DELETE /api/account` | DSGVO-Export / vollständige Löschung |

### Nutzerkonten

Echte Konten mit sicherem Passwort-Hashing (`node:crypto` scrypt + Salt) und
opaken Session-Tokens. Nach `register`/`login` gibt die API ein `token` zurück;
der Client sendet es als `Authorization: Bearer <token>`. Ohne Token funktioniert
die App im Gastmodus (Merkliste/Alarme nur lokal). Konten und Sessions liegen –
wie Merkliste/Alarme – in `data/store.json` (gitignored), zentral verwaltet über
`src/db.js`.

Wichtige Query-Parameter für `GET /api/products`: `q`, `category`, `type`,
`brand`, `material`, `wheelSize`, `color`, `minPrice`, `maxPrice`, `onSale`,
`inStock`, `sort` (`price_asc`, `price_desc`, `discount`, `rating`,
`popularity`, `newest`, `name`), `page`, `pageSize`.

## Tests & CI

`npm test` startet die Unit-Tests (Preis-Logik, Datenschicht) und einen
API-Integrationstest, der den Server hochfährt und die Endpunkte abfragt. Die
GitHub-Actions-Pipeline (`.github/workflows/ci.yml`) läuft auf Node 20 und 22,
prüft, dass die Seed-Daten aktuell sind, und führt die Tests aus.

## Lizenz

[MIT](LICENSE)
