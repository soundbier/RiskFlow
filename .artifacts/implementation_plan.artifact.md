# Entfernung von Schnell-Tags und hardcodierten Vorlagen

Dieser Plan beschreibt die vollständige Entfernung der "Schnell-Tags für Kontext laden" im Wizard sowie aller hardcodierten Gefährdungsbeurteilungs-Vorlagen (Templates). Dies dient der Verschlankung der App und der Vorbereitung auf ein flexibleres System.

## User Review Required

> [!IMPORTANT]
> Durch diese Änderung werden alle vordefinierten "Basis-GB" Schaltflächen in der Tabellenansicht entfernt. Der Benutzer muss Gefährdungen von Grund auf neu erstellen oder (falls später implementiert) eigene Vorlagen nutzen.

> [!WARNING]
> Die Dropdown-Auswahl "Schnell-Tags für Kontext laden" im ersten Schritt des Wizards wird ersatzlos gestrichen.

## Proposed Changes

### Logic & Data Layer

#### [MODIFY] [storage.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/storage.js)
- Entfernen der Konstanten `defaultStandardTemplates` und `defaultTemplates`.
- Entfernen der Logik in `seedInitialSettings`, die `branchTemplates` in die Datenbank schreibt.
- Entfernen der Funktion `getBranchTemplates`.

#### [MODIFY] [logic.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/logic.js)
- Entfernen des Imports von `defaultStandardTemplates`.
- Entfernen der Variable `branchTemplates` und deren Initialisierung in `initWorkspace`.
- Löschen der Funktion `loadTemplate`.
- Entfernen des Klick-Handlers für `.tpl-btn` innerhalb von `setupEventDelegation`.

---

### UI Layer

#### [MODIFY] [app.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/app.js)
- Entfernen des HTML-Blocks für den `bereich-selector` (Schnell-Tags) im Wizard Schritt 1.
- Entfernen der `template-section` (Basis-GB laden) aus der `table-toolbar` in der Tabellenansicht.

---

### Styling

#### [MODIFY] [_tables.css](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/css/components/_tables.css)
- Entfernen der CSS-Regeln für `.template-section`, `.template-label` und `.template-buttons`.

#### [MODIFY] [_workspace.css](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/css/views/_workspace.css)
- Entfernen der CSS-Regeln für `.bereich-selector`.

## Verification Plan

### Manual Verification
- **Wizard:** Prüfen, ob das Dropdown "Schnell-Tags für Kontext laden" im ersten Schritt nicht mehr angezeigt wird.
- **Tabelle:** Prüfen, ob die Schaltflächen unter "Basis-GB laden" in der Tabellenansicht verschwunden sind.
- **Konsole:** Sicherstellen, dass beim Öffnen des Workspace keine Fehler wie `ReferenceError: branchTemplates is not defined` auftreten.
- **Speichern:** Verifizieren, dass das normale Speichern von Gefährdungen weiterhin einwandfrei funktioniert.
