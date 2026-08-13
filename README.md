# RiskFlow – Gefährdungsbeurteilungen & Arbeitsschutz (PWA)

RiskFlow ist eine moderne, vollständig offline-fähige Progressive Web App (PWA), die speziell für Fachkräfte für Arbeitssicherheit und Arbeitsschutz-Beauftragte entwickelt wurde. Sie ermöglicht die nahtlose, strukturierte und rechtssichere digitale Erfassung von Gefährdungsbeurteilungen direkt vor Ort – von der Identifikation über das STOP-Prinzip bis zur Risikomatrix.

## ✨ Hauptfunktionen

* **🏢 Multi-Betriebs-Management:** Verwaltung mehrerer Betriebe, Kunden oder Standorte in einer App. Isolierte Workspaces garantieren, dass Daten nicht vermischt werden.
* **📱 Native Mobile Experience:** Kompromisslos für das Smartphone optimiert. Mit Bottom-Tab-Bar, wischbaren Elementen, iOS-Zoom-Prävention und großen Touch-Targets für den Einsatz im Außendienst.
* **📶 100 % Offline-Fähig:** Alle Daten werden lokal in der asynchronen `IndexedDB` gespeichert. Die App funktioniert tief im Keller oder in Lagerhallen ohne Empfang reibungslos.
* **🛑 Integrierte Arbeitsschutz-Methodik:** 
  * Risikobewertung per dynamischer Nohl-Matrix (Vorher/Nachher).
  * Gefahrenminimierung nach dem STOP-Prinzip.
  * Interaktiver PSA-Auswahl-Assistent inkl. DGUV-Referenzen.
* **📋 Branchen-Templates:** Schneller Start durch vorab auswählbare Standard-Gefährdungen für verschiedene Branchen (Büro, Handwerk, Spielhalle, Schwimmbad etc.).
* **📊 Reporting & Export:** Direkter Export von betriebsspezifischen Daten als Excel-kompatible CSV-Datei (inkl. UTF-8 BOM) sowie eine optimierte A4-Druckansicht zur PDF-Generierung.

## 🛠 Technologie-Stack

RiskFlow verzichtet bewusst auf schwere Frameworks und setzt auf einen schlanken, performanten Stack:

* **Frontend:** HTML5, Vanilla JavaScript (ES6 Modules), CSS3 (CSS Variables, Flexbox/Grid)
* **Build-Tool:** [Vite](https://vitejs.dev/) für blitzschnelles lokales Entwickeln und optimierte Produktions-Builds.
* **PWA:** `vite-plugin-pwa` für die automatische Service-Worker-Generierung und das Manifest.
* **Datenbank:** `IndexedDB` (gewrappt mit der leichtgewichtigen Bibliothek `idb` für Promise-basierten Zugriff).
* **UI/Icons:** Sauberes, modulares CSS (7-1 Pattern Light) und hochauflösende, eingebettete SVG-Icons.

## 📂 Projektstruktur

Die Code-Basis ist strikt modular aufgebaut, um Skalierbarkeit und einfache Wartung zu gewährleisten:

```text
riskflow-pwa/
├── public/                 # Statische Assets (Icons, Screenshots)
├── src/
│   ├── css/                # Modulare CSS-Architektur
│   │   ├── base/           # Variablen, Resets, Icon-Klassen
│   │   ├── components/     # Buttons, Forms, Modals, Tables
│   │   ├── layout/         # Header, App-Container
│   │   ├── utilities/      # Print-Styles
│   │   ├── views/          # Ansichten (Betriebe-Dashboard, Workspace)
│   │   └── style.css       # Zentraler CSS-Hub (Bündelung via @import)
│   ├── js/
│   │   ├── app.js          # Routing, UI-Rendering, Icon-Dictionary
│   │   ├── logic.js        # Geschäftslogik, Event-Handling, Matrix
│   │   ├── storage.js      # IndexedDB-Verwaltung (Multi-Tenant, Migrationen)
│   │   ├── service-worker.js 
│   │   └── main.js         # App Entry-Point / Bootstrap
├── index.html              # PWA HTML-Gerüst
├── package.json            # Abhängigkeiten & Scripts
└── vite.config.js          # Vite & PWA Konfiguration
