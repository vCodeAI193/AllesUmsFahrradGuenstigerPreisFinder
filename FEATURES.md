# Features – Alles ums Fahrrad: Günstiger-Preis-Finder

Diese Datei sammelt geplante und umgesetzte Funktionen des Projekts als Roadmap.
Die Features sind nach Themenbereichen gruppiert und durchnummeriert (1–100).

Status-Legende: ⬜ offen · 🔄 teilweise (Logik/API vorhanden, UI begrenzt) · ✅ umgesetzt

> **Stand 2026-06-27:** Ein lauffähiger Prototyp deckt Suche, Preisvergleich,
> Deals, Preisverlauf, Filter/Sortierung, Merkliste und Preisalarme ab
> (siehe [`README.md`](README.md)). Die Daten sind synthetisch; echte
> Händler-Anbindungen, Nutzerkonten und Benachrichtigungsversand stehen noch aus.

## 1. Suche & Auffinden

1. ✅ Volltextsuche über alle Produkte (Fahrräder, Teile, Zubehör)
2. ✅ Autovervollständigung / Suchvorschläge während der Eingabe
3. ✅ Korrektur von Tippfehlern ("Meinten Sie …?")
4. ✅ Suche nach Marke (z. B. Cube, Canyon, Shimano)
5. ✅ Suche nach Kategorie (City, MTB, Rennrad, E-Bike, Kinderrad)
6. ✅ Suche nach Modellname oder Artikelnummer (inkl. EAN)
7. ⬜ Barcode-/EAN-Suche per Foto
8. ⬜ Sprachsuche
9. ✅ Suchverlauf des Nutzers speichern
10. ⬜ Gespeicherte Suchen mit Benachrichtigung bei neuen Treffern

## 2. Preisvergleich

11. ✅ Preise mehrerer Händler pro Produkt gegenüberstellen
12. ✅ Günstigsten Preis hervorheben
13. ✅ Gesamtpreis inkl. Versandkosten berechnen
14. ✅ Verfügbarkeit pro Händler anzeigen (auf Lager / Lieferzeit)
15. ⬜ Preis pro Einheit (z. B. € pro Kette/Reifen) berechnen
16. ✅ Direktlink zum Angebot beim Händler
17. ✅ Mehrere Produkte nebeneinander vergleichen (inkl. teilbarem Link)
18. ⬜ Gebraucht- vs. Neupreis vergleichen
19. ⬜ Währungsumrechnung für ausländische Shops
20. ✅ Hinweis auf Versandkostenfreigrenze / Mindestbestellwert (Gutscheine)

## 3. Angebote & Deals

21. ✅ Aktuelle Deals und Rabattaktionen auf der Startseite
22. ✅ Rabatt in Prozent zum Normalpreis anzeigen
23. ✅ Sale-/Restposten-Bereich (Filter „Nur Angebote" + Deals-Seite)
24. ✅ Gutschein- und Rabattcodes pro Händler
25. ✅ "Deal des Tages" auf der Deals-Seite
26. ⬜ Saisonale Aktionen (Black Friday, Winterschlussverkauf)
27. ⬜ Bundle-Angebote (Rad + Zubehör)
28. ✅ Markierung "Tiefstpreis" bei historischem Tiefststand
29. ⬜ Ablaufdatum/Countdown bei befristeten Aktionen
30. ⬜ Community-Voting für die besten Deals (heiß/kalt)

## 4. Preisverlauf & Preisalarm

31. ✅ Preisverlauf als Diagramm pro Produkt
32. ✅ Anzeige von Höchst-, Tiefst- und Durchschnittspreis
33. ✅ Einschätzung "guter Preis / schlechter Preis"
34. ✅ Preisalarm bei Erreichen eines Wunschpreises
35. ⬜ Benachrichtigung bei jeder Preissenkung
36. ⬜ Benachrichtigung bei Wiederverfügbarkeit
37. ✅ Mehrere Preisalarme pro Nutzer verwalten
38. ⬜ Benachrichtigung per E-Mail
39. ⬜ Benachrichtigung per Push (App/Browser)
40. ⬜ Prognose des nächsten erwarteten Preistiefs

## 5. Filter & Sortierung

41. ✅ Filter nach Preisspanne
42. ✅ Filter nach Rahmengröße
43. ✅ Filter nach Laufradgröße (26", 27,5", 28", 29")
44. ✅ Filter nach Material (Alu, Carbon, Stahl)
45. ✅ Filter nach Gangzahl
46. ✅ Filter nach Bremsentyp (Scheibe/Felge)
47. ✅ Filter nach E-Bike-Motor
48. ✅ Filter nach Farbe
49. ✅ Filter nach Verfügbarkeit
50. ✅ Sortierung nach Preis, Rabatt, Beliebtheit, Neuheit, Bewertung, Name

## 6. Produktdaten & Detailseite

51. ✅ Detailseite mit allen technischen Spezifikationen
52. 🔄 Bildergalerie pro Produkt (aktuell ein generiertes Platzhalterbild)
53. ✅ Normalisierung/Anreicherung der Produktdaten (Preis-Statistik etc.)
54. ⬜ Zusammenführen identischer Produkte mehrerer Shops
55. ✅ Anzeige der Garantie-/Gewährleistungsinfos
56. ⬜ Größentabelle / Geometrie-Daten für Fahrräder
57. ⬜ Kompatibilitätshinweise bei Komponenten
58. ⬜ Anzeige von Energie-/Nachhaltigkeitsinfos
59. ⬜ Produktdatenblatt als PDF-Export
60. ✅ "Ähnliche Produkte"-Empfehlungen

## 7. Händler & Datenquellen

61. 🔄 Anbindung mehrerer Händler (simuliert über Angebots-Datenmodell)
62. ⬜ Web-Scraping für Shops ohne API (regelkonform)
63. ⬜ Regelmäßige automatische Preisaktualisierung
64. ✅ Übersicht aller angebundenen Händler (eigene Seite)
65. ✅ Händlerbewertung anzeigen
66. ✅ Filter nach Händlerland
67. 🔄 Affiliate-Link-Kennzeichnung (rel="nofollow", Affiliate-Flag)
68. ⬜ Erkennung und Markierung von Fake-Rabatten
69. ⬜ Monitoring fehlerhafter oder veralteter Feeds
70. ⬜ Manuelles Melden falscher Preise durch Nutzer

## 8. Nutzerkonto & Personalisierung

71. ⬜ Registrierung und Login (aktuell Demo-Nutzer)
72. ⬜ Login über Drittanbieter (Google, Apple)
73. ✅ Merkliste / Wunschliste
74. 🔄 Persönliches Dashboard (Merkliste + Preisalarme als Seiten)
75. ⬜ Personalisierte Empfehlungen
76. ⬜ Einstellbares Heimat-/Standardland für Versand
77. ⬜ Profil mit bevorzugten Marken und Kategorien
78. ⬜ Wunschlisten teilen
79. ✅ Datenexport und vollständige Account-Löschung (DSGVO)
80. ⬜ Einstellbare Benachrichtigungs-Präferenzen

## 9. Community & Bewertungen

81. 🔄 Produktbewertungen (Sterne + Anzahl, noch keine Einzelrezensionen)
82. 🔄 Aggregierte Bewertung pro Produkt
83. ⬜ Kommentare und Diskussion zu Deals
84. ⬜ Nutzer können eigene Deals einreichen
85. ⬜ Reputationssystem für aktive Nutzer
86. ⬜ Melde-Funktion für unpassende Inhalte
87. ⬜ Kauf-Ratgeber und Blog-Artikel
88. ✅ FAQ und Glossar (Fahrrad-Fachbegriffe)
89. ✅ Newsletter-Anmeldung für die besten Wochen-Deals
90. ✅ Social-Media-Sharing / Teilen von Angeboten

## 10. Technik, Qualität & Betrieb

91. ✅ Responsives Web-Frontend (Mobile-first)
92. ⬜ Progressive Web App / native App
93. ⬜ Mehrsprachigkeit (aktuell nur Deutsch)
94. 🔄 Barrierefreiheit (ARIA-Labels, semantisches HTML; noch nicht auditiert)
95. ✅ Dark Mode
96. ✅ Schnelle Ladezeiten (Lazy-Loading, Cache-Header für Assets)
97. ✅ JSON-/REST-API für externe Nutzung
98. ✅ Automatisierte Tests und CI/CD-Pipeline
99. 🔄 Request- & Fehler-Logging (Monitoring/Tracking offen)
100. ⬜ Datenschutzkonforme Statistik / Analytics
