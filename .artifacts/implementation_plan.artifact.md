# Optimierung der Einstellungen-Navigation für Mobilgeräte

Das aktuelle Einstellungsmenü nutzt auf Mobilgeräten horizontale Tabs, die seitlich gescrollt werden müssen. Dies erschwert die Navigation und Entdeckung der verschiedenen Einstellungsbereiche. Dieser Plan sieht vor, die Navigation auf ein "Drill-Down"-Modell umzustellen: Eine vertikale Liste von Kategorien, die beim Antippen die entsprechenden Einstellungen in einer Unteransicht öffnen.

## Proposed Changes

### [UI/UX]

#### [MODIFY] [app.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/app.js)
- Hinzufügen eines "Zurück"-Buttons im Header des Einstellungsmodals (nur auf Mobilgeräten sichtbar, wenn eine Kategorie ausgewählt wurde).
- Ergänzung der `Icons` um ein `arrowLeft` Icon.
- Hinzufügen eines Indikator-Icons (Chevron/Pfeil rechts) für die Menüpunkte in der mobilen Ansicht.

#### [MODIFY] [_settings.css](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/css/views/_settings.css)
- Umstellung der `.settings-menu` auf `flex-direction: column` für Mobilgeräte.
- Implementierung der Drill-Down Logik via CSS-Klassen:
    - Wenn eine Kategorie aktiv ist, wird die Seitenleiste ausgeblendet und der Inhalt vollflächig angezeigt.
    - Anzeige des Zurück-Buttons im Header.
- Optimierung der `.settings-tab` Styles für die vertikale Liste (breiter, mit Trennlinien).

#### [MODIFY] [settings.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/settings.js)
- Aktualisierung der Tab-Klick-Logik: Hinzufügen einer Klasse (z.B. `mobile-view-active`) zum Container, um den Drill-Down Effekt auszulösen.
- Implementierung des Event-Handlers für den neuen Zurück-Button, um zur Kategorieliste zurückzukehren.

## Verification Plan

### Manual Verification
- Öffnen der Einstellungen auf einem mobilen Gerät (oder im Emulator/DevTools Mobile View).
- Prüfen, ob die Kategorien vertikal untereinander gelistet sind.
- Antippen einer Kategorie:
    - Sidebar verschwindet.
    - Einstellungen der Kategorie erscheinen.
    - "Zurück"-Button erscheint oben links.
- Antippen des "Zurück"-Buttons:
    - Rückkehr zur Kategorieliste.
- Speichern und Abbrechen der Einstellungen auf Funktionalität prüfen.
