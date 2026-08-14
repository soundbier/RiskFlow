# Implementation Plan - RiskFlow Feature Extensions

This plan outlines the implementation of four key features: Auditor Profile, Backup/Export, Suggestion Management, and Display Options.

## Proposed Changes

### Storage & Data Management
Enhance the storage module to handle new settings and data operations.

#### [storage.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/storage.js)
- Add functions `exportDatabase()` and `importDatabase(data)`.
- Export will collect all entries from `companies`, `assessments`, and `settings`.
- Import will validate and restore data.

---

### User Interface Extensions
Expand the settings modal and add new styles for display options.

#### [app.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/app.js)
- Update `renderSettingsModal()` to include new tabs:
    - **Profil**: For default auditor information.
    - **Vorschläge**: For managing datalist terms.
    - **Daten**: For backup and export/import.
- Update `renderSettingsModal()` content for the **Allgemein** tab to include Compact View and Font Size settings.

#### [settings.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/settings.js)
- Implement logic for loading and saving the new settings.
- Add event listeners for Export/Import buttons.
- Implement logic for the "Suggestions" tab: fetching unique terms, editing, and deleting them.

#### [style.css](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/css/style.css)
- Add base styles for `view-compact` class.
- Use a CSS variable for base font size.

---

### Core Logic Integration
Integrate the new features into the application workflow.

#### [logic.js](file:///C:/Users/Lukas/AndroidStudioProjects/RiskFlow/src/js/modules/logic.js)
- Update `openCompanyModal()` to pre-fill the "Geprüft durch" field from the auditor profile.
- Implement `cleanupSuggestions(type, oldValue, newValue)` to bulk-update assessments when a suggestion is renamed or deleted.

## Verification Plan

### Automated Tests
- I will verify the data integrity of export/import by comparing the database state before and after a round-trip.

### Manual Verification
1. **Auditor Profile**:
   - Save profile info in settings.
   - Create a new "Betrieb" and verify "Geprüft durch" is pre-filled.
2. **Backup & Export**:
   - Export data, verify the JSON content.
   - Delete a company, then import the JSON and verify the company is restored.
3. **Suggestion Management**:
   - Rename a typo in the settings (e.g., "Logisttik" -> "Logistik").
   - Verify all assessments and the datalist are updated.
4. **Display Options**:
   - Toggle Compact View and verify table layout changes.
   - Adjust Font Size and verify UI scale.
