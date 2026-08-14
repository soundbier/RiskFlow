# Emojis durch SVG-Icons ersetzen

Dieses Dokument beschreibt den Plan, alle verbleibenden Emojis in der Anwendung durch konsistente SVG-Icons aus dem `Icons`-Dictionary zu ersetzen.

## User Review Required

> [!NOTE]
> Die Icons für "Profil" (👤) und "Vorschläge" (💡) werden durch neue Lucide/Feather-basierte SVG-Icons ersetzt, um ein einheitliches Design zu gewährleisten.

## Proposed Changes

### [Component: UI Icons]

#### [MODIFY] [app.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/app.js)
- Erweiterung des `Icons`-Dictionarys um:
    - `info`: Informations-Icon (wird bereits im Code verwendet, fehlte aber im Dictionary).
    - `user`: Profil-Icon für die Einstellungen.
    - `bulb`: Glühbirnen-Icon für Vorschläge.
    - `arrowRight`: Pfeil nach rechts für die Risikomatrix.
    - `arrowUp`: Pfeil nach oben für die Sortierung.
    - `arrowDown`: Pfeil nach unten für die Sortierung.
    - `chevronsUpDown`: Kombiniertes Auf/Ab-Icon für die initiale Sortieranzeige.
- Ersetzen der Emojis/Sonderzeichen in den Templates:
    - `👤 Profil` -> `${Icons.user} Profil`
    - `💡 Vorschläge` -> `${Icons.bulb} Vorschläge`
    - `➔` -> `${Icons.arrowRight}` (in der Risikomatrix)

#### [MODIFY] [logic.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/logic.js)
- Aktualisierung der Funktion `updateSortIcons`, um die neuen SVG-Icons anstelle von Text-Pfeilen (`↑`, `↓`, `↕`) zu verwenden.

## Verification Plan

### Manuelle Verifizierung
- Öffnen der Einstellungen und Prüfen der Tabs "Profil" und "Vorschläge" auf die neuen Icons.
- Überprüfen der Risikomatrix im Workspace auf den neuen SVG-Pfeil.
- Überprüfen der Tabellensortierung auf die neuen SVG-Icons (Pfeile).
- Sicherstellen, dass das Info-Banner im Schritt 3 des Wizards nun ein Icon anzeigt (vorher wahrscheinlich leer/undefiniert).
