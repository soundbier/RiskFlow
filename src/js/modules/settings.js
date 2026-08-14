/**
 * Modul zur Verwaltung des Einstellungsmenüs
 */

// Importiere die synchronen Speicher-Funktionen aus storage.js
import { loadUISettings, saveUISettings, applyTheme, applyUIOptions, exportDatabase, importDatabase } from './storage.js';
import { Icons } from './ui/icons.js';
import * as storage from './storage.js';

let currentSuggestions = [];

export function initSettings() {
  // DOM Elemente referenzieren
  const modal = document.getElementById('settings-modal');
  const container = document.getElementById('settings-container');
  const openBtn = document.getElementById('open-settings-btn');
  const closeBtn = document.getElementById('close-settings-btn');
  const backBtn = document.getElementById('back-settings-btn');
  const cancelBtn = document.getElementById('cancel-settings-btn');
  const saveBtn = document.getElementById('save-settings-btn');
  
  const tabs = document.querySelectorAll('.settings-tab');
  const panels = document.querySelectorAll('.settings-panel');
  const titleEl = document.getElementById('settings-title');
  const defaultTitle = titleEl ? titleEl.innerHTML : 'Einstellungen';

  // Input-Elemente für die Einstellungen referenzieren
  const themeSelect = document.getElementById('theme-select');
  const compactCheck = document.getElementById('compact-view-check');
  const fontSizeRange = document.getElementById('font-size-range');
  const fontSizeLabel = document.getElementById('font-size-label');

  const profName = document.getElementById('prof-name');
  const profRole = document.getElementById('prof-role');
  const profCert = document.getElementById('prof-cert');

  const suggestType = document.getElementById('suggest-type-select');
  const suggestList = document.getElementById('suggestion-list-container');
  const refreshSuggest = document.getElementById('btn-refresh-suggestions');

  const exportBtn = document.getElementById('btn-export-db');
  const importTrigger = document.getElementById('btn-import-trigger');
  const importFile = document.getElementById('db-import-file');
  const factoryResetBtn = document.getElementById('btn-factory-reset');

  // Sicherheitscheck: Abbrechen, falls das Modal im DOM fehlt
  if (!modal) {
    console.error('Settings-Modal im DOM nicht gefunden.');
    return;
  }

  // --- Initiale Theme-Anwendung beim Start der App ---
  const initialSettings = loadUISettings();
  applyTheme(initialSettings.theme);
  applyUIOptions(initialSettings);

  // Initial visibility (wird nun rein über CSS .active gesteuert)
  // panels.forEach(p => { ... });

  // --- Werte in das UI laden ---
  const populateUI = () => {
    const currentSettings = loadUISettings();
    
    if (themeSelect) themeSelect.value = currentSettings.theme;
    if (compactCheck) compactCheck.checked = !!currentSettings.compactView;
    if (fontSizeRange) {
      fontSizeRange.value = currentSettings.fontSize || 100;
      if (fontSizeLabel) fontSizeLabel.textContent = fontSizeRange.value;
    }

    if (profName) profName.value = currentSettings.auditorProfile?.name || '';
    if (profRole) profRole.value = currentSettings.auditorProfile?.role || '';
    if (profCert) profCert.value = currentSettings.auditorProfile?.cert || '';
  };

  // Live Font Size Preview
  if (fontSizeRange) {
    fontSizeRange.addEventListener('input', () => {
      if (fontSizeLabel) fontSizeLabel.textContent = fontSizeRange.value;
    });
  }

  // --- Modal öffnen ---
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      populateUI(); // Lade aktuelle Werte in die Formularfelder, bevor das Modal sichtbar wird

      // Auf Mobilgeräten: Immer mit der Kategorieliste starten
      if (window.innerWidth <= 768) {
        if (container) container.classList.remove('panel-active');
        if (titleEl) titleEl.innerHTML = `${Icons.settings} Einstellungen`;
      }

      modal.showModal();
      document.body.style.overflow = 'hidden'; // Hintergrund-Scrollen verhindern
    });
  }

  // --- Modal schließen ---
  const closeModal = () => {
    modal.close();
    document.body.style.overflow = ''; // Scrollen wieder aktivieren

    // Reset mobile state
    if (container) container.classList.remove('panel-active');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // --- Zurück-Button (Mobile Drill-Down) ---
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (container) container.classList.remove('panel-active');
      if (titleEl) titleEl.innerText = 'Einstellungen';

      // Deactivate all panels when going back to menu on mobile
      panels.forEach(p => {
        p.classList.remove('active');
      });
    });
  }

  // Klick auf den Hintergrund (Backdrop) schließt das Modal ebenfalls
  modal.addEventListener('click', (event) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
                        rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
    if (!isInDialog) {
      closeModal();
    }
  });

  // --- Einstellungen Speichern ---
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      // 1. Werte aus den Inputs auslesen
      const newSettings = {
        theme: themeSelect ? themeSelect.value : 'system',
        compactView: compactCheck ? compactCheck.checked : false,
        fontSize: fontSizeRange ? parseInt(fontSizeRange.value) : 100,
        auditorProfile: {
          name: profName ? profName.value.trim() : '',
          role: profRole ? profRole.value.trim() : '',
          cert: profCert ? profCert.value.trim() : ''
        }
      };

      // 2. Werte über storage.js speichern
      saveUISettings(newSettings);

      // 3. Sofortige UI-Aktualisierung
      applyTheme(newSettings.theme);
      applyUIOptions(newSettings);

      // 4. Visuelles Feedback
      const originalHTML = saveBtn.innerHTML;
      saveBtn.innerHTML = `${Icons.check} Gespeichert!`;
      
      setTimeout(() => {
        saveBtn.innerHTML = originalHTML;
        closeModal();
      }, 800);
    });
  }

  // --- Vorschlags-Verwaltung ---
  const loadSuggestions = async () => {
    if (!suggestList) return;
    suggestList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 1rem;">Lade Daten...</p>';

    const type = suggestType.value;
    const allAssessments = await storage.getAllAssessments();

    const terms = [...new Set(allAssessments.map(a => a[type]).filter(Boolean))].sort();
    currentSuggestions = terms;

    if (terms.length === 0) {
      suggestList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Noch keine Einträge vorhanden.</p>';
      return;
    }

    suggestList.innerHTML = terms.map(term => `
      <div class="suggestion-item" style="display: flex; align-items: center; gap: 10px; padding: 8px; border-bottom: 1px solid var(--border);">
        <input type="text" class="form-control suggest-edit-input" value="${term}" style="flex: 1; font-size: 13px; padding: 4px 8px;">
        <button class="btn-icon btn-save-suggest" data-old="${term}" title="Umbenennen" style="color: var(--primary);">${Icons.check}</button>
        <button class="btn-icon btn-delete-suggest" data-term="${term}" title="Löschen" style="color: #ef4444;">${Icons.x}</button>
      </div>
    `).join('');

    // Event Listener für Buttons in der Liste
    suggestList.querySelectorAll('.btn-save-suggest').forEach(btn => {
      btn.addEventListener('click', async () => {
        const oldVal = btn.dataset.old;
        const newVal = btn.parentElement.querySelector('.suggest-edit-input').value.trim();
        if (newVal && newVal !== oldVal) {
          if (confirm(`Möchten Sie alle Vorkommen von "${oldVal}" in "${newVal}" umbenennen?`)) {
            await updateAllAssessmentsTerm(type, oldVal, newVal);
            loadSuggestions();
          }
        }
      });
    });

    suggestList.querySelectorAll('.btn-delete-suggest').forEach(btn => {
      btn.addEventListener('click', async () => {
        const term = btn.dataset.term;
        if (confirm(`Soll der Begriff "${term}" aus allen Beurteilungen entfernt werden? (Der Datensatz bleibt bestehen, nur das Feld wird geleert)`)) {
          await updateAllAssessmentsTerm(type, term, '');
          loadSuggestions();
        }
      });
    });
  };

  const updateAllAssessmentsTerm = async (type, oldVal, newVal) => {
    const all = await storage.getAllAssessments();
    const updates = all.filter(a => a[type] === oldVal).map(a => ({ ...a, [type]: newVal }));
    if (updates.length > 0) {
      await storage.saveMultipleAssessments(updates);
    }
  };

  if (refreshSuggest) refreshSuggest.addEventListener('click', loadSuggestions);
  if (suggestType) suggestType.addEventListener('change', loadSuggestions);

  // --- Daten & Backup ---
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const json = await exportDatabase();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RiskWerk_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (importTrigger) importTrigger.addEventListener('click', () => importFile.click());

  if (importFile) {
    importFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (confirm('Achtung: Der Import fügt Daten hinzu. Bestehende Betriebe mit gleichen IDs werden überschrieben. Fortfahren?')) {
            await importDatabase(data);
            alert('Daten erfolgreich importiert! Die Seite wird neu geladen.');
            window.location.reload();
          }
        } catch (err) {
          alert('Fehler beim Importieren: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  if (factoryResetBtn) {
    factoryResetBtn.addEventListener('click', () => {
      if (confirm('SIND SIE SICHER? Dies löscht alle Betriebe, Beurteilungen und Einstellungen unwiderruflich!')) {
        indexedDB.deleteDatabase('riskwerk-db');
        localStorage.clear();
        alert('Alle Daten wurden gelöscht. Die App wird neu gestartet.');
        window.location.reload();
      }
    });
  }

  // --- Tab Navigation Logik ---
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const clickedTab = e.currentTarget;
      const targetId = clickedTab.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);

      // Mobile Drill-Down Logik
      if (window.innerWidth <= 768) {
        if (container) container.classList.add('panel-active');
        if (titleEl) {
          const label = clickedTab.querySelector('.tab-label');
          titleEl.innerHTML = label ? label.innerHTML : 'Einstellungen';
        }
      }

      // 1. Allen Tabs die 'active' Klasse entziehen
      tabs.forEach(t => t.classList.remove('active'));
      
      // 2. Alle Panels deaktivieren
      panels.forEach(p => p.classList.remove('active'));

      // 3. Dem geklickten Tab die 'active' Klasse geben
      clickedTab.classList.add('active');

      // 4. Zugehöriges Panel aktivieren
      if (targetPanel) {
        targetPanel.classList.add('active');

        // Spezielle Logik beim Tab-Wechsel
        if (targetId === 'settings-suggestions') loadSuggestions();
      }
    });
  });
}
