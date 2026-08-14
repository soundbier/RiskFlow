# Plan zur Modernisierung (De-Slopping) von RiskFlow

Dieser Plan beschreibt das Refactoring der UI-Architektur und das visuelle Redesign der App, um weg von generischen AI-Templates hin zu einer hochwertigen Mobile-First PWA zu kommen.

## User Review Required

> [!IMPORTANT]
> Ich werde die HTML-Struktur in `app.js` aufbrechen. Dies erfordert eine Anpassung der Event-Listener in `logic.js`. Ich werde dies in einem Abwasch miterledigen, um die Funktionalität sicherzustellen.

## Proposed Changes

### 1. Architektur & Komponenten [NEU]
Wir lagern Icons und wiederverwendbare UI-Elemente aus, um die Logik vom HTML zu trennen.

#### [NEW] [icons.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/ui/icons.js)
- Zentrales Repository für alle SVGs.

#### [NEW] [components.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/ui/components.js)
- Funktionen zum Rendern von Buttons, Badges, Cards und Empty-States.

---

### 2. Design-System & Styling [MODIFY]
Wir führen ein konsistentes Ebenen-Modell (Elevations) und modernes Styling ein.

#### [MODIFY] [_variables.css](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/css/base/_variables.css)
- Erweiterung um `--shadow-raised`, `--shadow-overlay`.
- Definition einer strengen Spacing-Scale.

#### [MODIFY] [_header.css](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/css/layout/_header.css)
- Umstellung auf ein kompakteres, fixiertes Layout mit "Glassmorphism"-Effekt.

#### [MODIFY] [_app-container.css](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/css/layout/_app-container.css)
- Optimierung für PWA-Viewports und Safe-Areas.

---

### 3. Views & Layout [MODIFY]
Neugestaltung der "Meine Betriebe"-Ansicht basierend auf dem Screenshot.

#### [MODIFY] [app.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/app.js)
- Umstellung der `renderLayout`- und `renderBetriebeUebersicht`-Funktionen auf die neuen Komponenten.
- Implementierung eines "Widget-Style" Layouts für die Betriebe-Grid.

---

## Verification Plan

### Automated Tests
- Da es sich primär um UI/Architektur handelt: Manueller Build-Check via Vite.
- Prüfung der Browser-Konsole auf ReferenceErrors nach dem Refactoring.

### Manual Verification
- Test der Responsive-Ansicht (Mobile vs. Desktop).
- Verifizierung, dass alle Buttons (Einstellungen, Neuer Betrieb) weiterhin funktionieren (Event Delegation Check).
- Optischer Abgleich mit dem Ziel: Weniger Whitespace, bessere Hierarchie.
