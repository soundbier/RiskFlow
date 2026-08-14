# Desktop (PC) UI-Optimierung: "High-Speed-Workspace"

Dieses Update optimiert die RiskFlow-Haptik für große Bildschirme. Das Ziel ist es, die vertikale Streckung zu reduzieren und durch ein Side-by-Side-Layout ("Dual-Pane") die Datenerfassung und -kontrolle gleichzeitig zu ermöglichen.

## User Review Required

> [!IMPORTANT]
> Auf Bildschirmen breiter als 1280px werden das Formular (Wizard) und die Tabelle nebeneinander angezeigt. Die manuelle Tab-Umschaltung (Erstellen vs. Tabelle) entfällt auf Desktop-PCs, da beide Bereiche permanent sichtbar sind.

## Proposed Changes

### Layout & Struktur

#### [MODIFY] [app.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/app.js)
- Anpassung des HTML-Gerüsts im `renderWorkspace`: Umschließen von Wizard und Tabelle in einem neuen Container `.workspace-split-container`.
- Entfernen der `tab-panel` Klassen-Logik für Desktop, da beide Panels gleichzeitig aktiv sind.

#### [MODIFY] [_app-container.css](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/css/layout/_app-container.css)
- Hinzufügen einer `max-width: 1600px` für den Hauptcontainer auf Desktop.

---

### Styling (Desktop-Spezifisch)

#### [MODIFY] [_workspace.css](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/css/views/_workspace.css)
- Implementierung des `.workspace-split-container`:
    - `display: grid; grid-template-columns: 450px 1fr;` auf Bildschirmen > 1280px.
- Sticky-Verhalten für den Wizard: `position: sticky; top: 80px;` damit das Eingabefeld beim Scrollen der (langen) Tabelle sichtbar bleibt.
- Optimierung der Formular-Abstände für Desktop.

#### [MODIFY] [_tables.css](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/css/components/_tables.css)
- Festlegung einer `max-height` für die Tabelle auf Desktop mit `overflow-y: auto`.
- Verbessertes Hover-Feedback für Tabellenzeilen.

---

### Logik-Anpassungen

#### [MODIFY] [logic.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/logic.js)
- Anpassung der `switchMobileTab`-Funktion: Verhindern des Ausblendens von Panels auf Desktop.
- Automatisches Neuladen der Tabelle nach jedem Speichern ohne Tab-Wechsel (da sie bereits sichtbar ist).

## Verification Plan

### Manual Verification
- **Responsivität:** Prüfen, ob das Layout bei 1280px sauber von Stacked auf Side-by-Side umschaltet.
- **Scroll-Verhalten:** Sicherstellen, dass der Wizard links stehen bleibt, während man durch eine lange Tabelle rechts scrollt.
- **Interaktion:** Verifizieren, dass das Hinzufügen einer Gefährdung im Wizard sofort die Tabelle rechts aktualisiert.
- **Mobile Regression:** Sicherstellen, dass auf dem Smartphone weiterhin die Tab-Bar unten genutzt wird und das Layout wie gewohnt funktioniert.
