# Mobil-UI/UX Optimierungsplan für RiskFlow

Dieses Dokument beschreibt die geplanten Verbesserungen, um RiskFlow zu einer erstklassigen Mobile-First PWA zu machen, die sich wie eine native App anfühlt.

## User Review Required

> [!IMPORTANT]
> - Wir führen eine permanente **Bottom-Navigation** ein, die den Zugriff auf Kernfunktionen (Betriebe, Neue Inspektion, Einstellungen) erleichtert.
> - Das **Drill-Down-Prinzip** wird konsequent für Detailansichten umgesetzt, um die Orientierung auf kleinen Bildschirmen zu verbessern.

## Proposed Changes

### [UI Components]

#### [MODIFY] [components.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/ui/components.js)
- Ergänzung der `Switch` und `RangeSlider` Komponenten.
- Neue Komponente `BottomNavigation` für die Hauptnavigation.
- Neue Komponente `DrillDownPanel` für Seiteneinschübe/Detailansichten.
- Refactoring der `Button`-Komponente für bessere Haptik-Konsistenz.

### [Styling & Design]

#### [MODIFY] [layout/_header.css](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/css/layout/_header.css)
- Optimierung des Headers für mehr "Premium-Gefühl" (bessere Abstände, konsistenter Glassmorphism).
- Fixierung der Abstände für die Bottom-Navigation.

#### [MODIFY] [components/_modals.css](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/css/components/_modals.css) (Falls vorhanden, sonst neu)
- Implementierung von Animationen für das Drill-Down-Panel (Slide-In von rechts).

### [App Logic]

#### [MODIFY] [main.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/main.js) (oder logic.js)
- Initialisierung der Bottom-Navigation.
- Implementierung der Panel-Logik für Einstellungen und andere Detailansichten.

## Verification Plan

### Automated Tests
- Prüfung der Barrierefreiheit (aria-labels).
- Sicherstellung der `escapeHtml` Nutzung in neuen Komponenten.

### Manual Verification
- Test der "Haptik" (Active-States) auf einem mobilen Emulator oder Gerät.
- Prüfung der "Safe-Area-Insets" auf Geräten mit Notch (iOS/Android).
- Validierung des "Look & Feel" gegen die Indigo-Designvorgaben.
