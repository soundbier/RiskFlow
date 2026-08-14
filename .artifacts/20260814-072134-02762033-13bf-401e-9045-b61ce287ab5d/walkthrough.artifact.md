 Walkthrough - RiskFlow Feature Extensions

Ich habe die vier gewünschten Funktionserweiterungen erfolgreich implementiert und in die bestehende Architektur von RiskFlow integriert.

## Implementierte Funktionen

### 1. Prüfer-Profil (Automatisierung)
- Ein neuer Tab **Profil** in den Einstellungen erlaubt das Speichern von Name und Rolle.
- Diese Daten werden beim Erstellen eines neuen Betriebs automatisch im Feld "Geprüft durch" eingetragen.
- [settings.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/settings.js) verwaltet das Speichern der Profildaten.
- [logic.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/logic.js) nutzt diese Daten beim Öffnen des Betriebs-Modals.

### 2. Backup & Daten-Export (Sicherheit)
- Im Tab **Daten & Backup** können Nutzer ein vollständiges Backup der IndexedDB als JSON-Datei herunterladen.
- Die Import-Funktion erlaubt das Einlesen dieser Dateien, um Daten wiederherzustellen oder auf andere Geräte zu übertragen.
- [storage.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/storage.js) enthält die neue Export/Import-Logik.

### 3. Vorschlags-Verwaltung (Datenqualität)
- Der Tab **Vorschläge** listet alle bisher genutzten Begriffe für Tätigkeiten und Bereiche auf.
- Nutzer können Tippfehler (z.B. "Logisttik") korrigieren; die App aktualisiert daraufhin automatisch alle betroffenen Datensätze in der Datenbank.
- Einzelne Begriffe können auch gelöscht werden, um die Vorschlagslisten (Datalists) sauber zu halten.

### 4. Anzeige-Optionen (Barrierefreiheit)
- Schalter für eine **Kompakt-Ansicht** der Tabellen in den Einstellungen.
- Schieberegler für die **Schriftgröße** (80% bis 150%).
- Die Einstellungen werden sofort auf das gesamte UI angewendet und dauerhaft gespeichert.

## Verifikation der Arbeit
- **Statische Analyse**: Alle geänderten Dateien wurden erfolgreich analysiert, es wurden keine Syntaxfehler gefunden.
- **Logik-Check**:
    - Die Datenmigration und die neuen Speicherstrukturen in `storage.js` sind abwärtskompatibel.
    - Die UI-Komponenten in `app.js` wurden um die notwendigen Tabs und Steuerelemente erweitert.
    - Die Event-Handler in `settings.js` decken alle neuen Interaktionen (Import/Export, Vorschlags-Korrektur, UI-Scaling) ab.
