/**
 * RiskFlow & GB-Tool – Haupt-App Modul
 * Initialisiert die Benutzeroberfläche und das Routing
 */

import { Icons } from './ui/icons.js';
import { Button, IconButton, Badge, BetriebCard, EmptyState } from './ui/components.js';

let currentView = 'betriebe';
let onNavigateCallback = null;

export function setOnNavigateCallback(cb) {
  onNavigateCallback = cb;
}

export async function initializeApp() {
  renderLayout();
  handleRouting();
  window.addEventListener('popstate', handleRouting);
  
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function renderLayout() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="app-container">
      <header class="app-header">
        <div class="header-container">
          <div class="logo-area" id="brand-title" tabindex="0" role="button">
            <div class="logo-icon">${Icons.shield}</div>
            <div class="logo-text">
              <h1>RiskFlow</h1>
              <span class="header-subtitle">Arbeitsschutz einfach gemacht</span>
            </div>
          </div>

          <div class="header-actions no-print">
            <select id="company-quick-select" class="btn btn-secondary desktop-only" style="display:none; font-size: 12px; max-width: 200px;" title="Betrieb wechseln"></select>
            ${Button({ text: 'Export', icon: 'download', id: 'btn-export', variant: 'secondary', className: 'desktop-only', attr: 'style="display:none;"' })}
            ${Button({ text: 'Drucken', icon: 'printer', id: 'btn-print', variant: 'secondary', className: 'desktop-only', attr: 'style="display:none;"' })}
            ${Button({ text: 'Meine Betriebe', icon: 'building', id: 'btn-goto-betriebe', variant: 'primary', className: 'desktop-only' })}
            ${IconButton({ icon: 'settings', id: 'open-settings-btn', ariaLabel: 'Einstellungen' })}
          </div>
        </div>
      </header>
      
      <div id="company-info-bar" class="company-info-bar" style="display: none;">
        <div class="company-info-content">
          <div class="info-main">
            <span class="info-label">Betrieb</span>
            <span class="info-value" id="display-c-name">-</span>
          </div>
          <div class="info-details desktop-only">
            <div class="info-block"><span class="info-label">Standort</span><span class="info-value" id="display-c-location">-</span></div>
            <div class="info-block"><span class="info-label">Prüfer</span><span class="info-value" id="display-c-auditor">-</span></div>
          </div>
        </div>
        <div class="company-info-actions">
            ${IconButton({ icon: 'edit', id: 'btn-edit-company', className: 'btn-sm no-print', ariaLabel: 'Stammdaten bearbeiten' })}
            ${IconButton({ icon: 'x', id: 'btn-close-workspace', className: 'btn-sm no-print', ariaLabel: 'Schließen' })}
        </div>
      </div>

      <main id="main-content" class="workspace"></main>

      <nav class="mobile-navigation mobile-only no-print">
        <button class="nav-item active" id="nav-betriebe">
          ${Icons.building}
          <span>Betriebe</span>
        </button>
        <button class="nav-item" id="nav-plus">
          <div class="nav-plus-circle">${Icons.plus}</div>
        </button>
        <button class="nav-item" id="nav-settings">
          ${Icons.settings}
          <span>Optionen</span>
        </button>
      </nav>
    </div>

    ${renderPsaModal()}
    ${renderSettingsModal()}
    ${renderBetriebFormModal()}
  `;

  document.getElementById('brand-title').addEventListener('click', () => navigateTo('betriebe'));

  // Mobile Nav Handlers
  document.getElementById('nav-betriebe')?.addEventListener('click', () => navigateTo('betriebe'));
  document.getElementById('nav-plus')?.addEventListener('click', () => {
    // Falls wir auf der Betriebe-Seite sind, neuen Betrieb anlegen
    const btn = document.getElementById('btn-new-betrieb');
    if (btn) btn.click();
  });
  document.getElementById('nav-settings')?.addEventListener('click', () => document.getElementById('settings-modal').showModal());
}

function handleRouting() {
  const params = new URLSearchParams(window.location.search);
  const action = params.get('action');

  if (action === 'workspace') navigateTo('workspace', false);
  else navigateTo('betriebe', false);
}

export function navigateTo(view, pushState = true) {
  currentView = view;

  // Update mobile navigation visibility
  const globalNav = document.querySelector('.mobile-navigation');
  if (globalNav) {
    globalNav.style.display = view === 'betriebe' ? 'flex' : 'none';
  }

  if (pushState) {
    const params = new URLSearchParams(window.location.search);
    let url = view === 'betriebe' ? '/' : `/?action=${view}`;
    
    if (view === 'workspace' && params.has('companyId')) {
        url += `&companyId=${params.get('companyId')}`;
    }
    
    window.history.pushState({ view }, '', url);
  }

  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = ''; 

  if (view === 'workspace') {
    mainContent.innerHTML = renderWorkspace();
  } else {
    mainContent.innerHTML = renderBetriebeUebersicht();
  }

  if (onNavigateCallback) onNavigateCallback();
}

function renderBetriebeUebersicht() {
  return `
    <div id="betriebe-view" class="view-container">
      <div class="view-header">
        <div class="view-title-group">
          <h2>Meine Betriebe</h2>
          <p class="view-subtitle">Wählen Sie einen Betrieb aus, um dessen Gefährdungsbeurteilungen zu bearbeiten.</p>
        </div>
        ${Button({ text: 'Neuer Betrieb', icon: 'plus', id: 'btn-new-betrieb', variant: 'primary' })}
      </div>

      <div class="betriebe-grid" id="betriebe-grid">
        <!-- Platzhalter für Ladezustand oder JS-Inhalt -->
      </div>
    </div>
  `;
}

/**
 * Hilfsfunktion zum Rendern der Liste (wird von logic.js aufgerufen)
 */
export function updateBetriebeGrid(betriebe = []) {
  const grid = document.getElementById('betriebe-grid');
  if (!grid) return;

  if (betriebe.length === 0) {
    grid.innerHTML = EmptyState({
      title: 'Noch keine Betriebe',
      message: 'Legen Sie Ihren ersten Betrieb an, um Gefährdungsbeurteilungen zu dokumentieren.',
      actionText: 'Betrieb hinzufügen',
      actionId: 'btn-new-betrieb-empty'
    });
    return;
  }

  grid.innerHTML = betriebe.map(b => BetriebCard(b)).join('');
}

function renderWorkspace() {
  return `
    <div id="gb-workspace">
      <div class="tab-panel active" id="tab-panel-create" data-panel="create">
      <form id="gb-form" class="card no-print" style="padding: 0;">
        <div class="wizard-header">
            <div class="step-indicator active current" id="ind-1"><span>1</span> Identifikation</div>
            <div class="step-indicator" id="ind-2"><span>2</span> Risikobewertung</div>
            <div class="step-indicator" id="ind-3"><span>3</span> Maßnahmen & Fristen</div>
        </div>

        <div class="wizard-body">
            <div id="edit-mode-banner" class="edit-banner" style="display: none; align-items: center; justify-content: space-between;">
                <span style="display:flex; align-items:center; gap:8px;">${Icons.edit} Sie bearbeiten einen bestehenden Eintrag.</span>
                <button type="button" class="btn btn-secondary" id="btn-cancel-edit" style="padding: 4px 10px; font-size: 11px;">Abbrechen</button>
            </div>

            <!-- SCHRITT 1: Identifikation -->
            <div class="wizard-step active" id="step-1">
                <div class="bereich-selector">
                    <label for="bereich" style="color: var(--primary); margin: 0;">Schnell-Tags für Kontext laden:</label>
                    <select id="bereich">
                        <option value="allgemein">Allgemeiner Betrieb</option>
                        <option value="spielhalle">Spielhalle / Kasino</option>
                        <option value="fitnessstudio">Fitnessstudio</option>
                        <option value="schwimmbad">Schwimmbad / Therme</option>
                        <option value="buero">Büro / Verwaltung</option>
                        <option value="gebaeudereinigung">Gebäudereinigung</option>
                        <option value="itunternehmen">IT-Unternehmen</option>
                        <option value="einzelhandel">Einzelhandel</option>
                    </select>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="bereich-input">Bereich / Abteilung</label>
                        <input type="text" id="bereich-input" list="bereich-list" placeholder="z. B. Lager, Produktion, Filiale...">
                        <datalist id="bereich-list"></datalist>
                    </div>
                    <div class="form-group">
                        <label for="taetigkeit">Arbeitsplatz / Tätigkeit <span style="color:red;">*</span></label>
                        <input type="text" id="taetigkeit" list="taetigkeit-list" required placeholder="z. B. Bohrmaschine">
                        <datalist id="taetigkeit-list"></datalist>
                    </div>
                </div>
                <div class="form-group">
                    <label for="gefaehrdung">Gefährdungsfaktor <span style="color:red;">*</span></label>
                    <select id="gefaehrdung" required>
                        <option value="Mechanische Gefährdungen">1. Mechanische Gefährdungen</option>
                        <option value="Elektrische Gefährdungen">2. Elektrische Gefährdungen</option>
                        <option value="Gefahrstoffe">3. Gefahrstoffe</option>
                        <option value="Biologische Arbeitsstoffe">4. Biologische Arbeitsstoffe</option>
                        <option value="Brand und Explosionsgefährdungen">5. Brand und Explosionsgefährdungen</option>
                        <option value="Thermische Gefährdungen">6. Thermische Gefährdungen</option>
                        <option value="Gefährdung durch spezielle physikalische Einwirkungen">7. Gefährdung durch spezielle physikalische Einwirkungen</option>
                        <option value="Gefährdungen durch Arbeitsumgebungsbedingungen">8. Gefährdungen durch Arbeitsumgebungsbedingungen</option>
                        <option value="Physische Belastung/Arbeitsschwere">9. Physische Belastung/Arbeitsschwere</option>
                        <option value="Psychische Faktoren">10. Psychische Faktoren</option>
                        <option value="Sonstige Gefährdungen">11. Sonstige Gefährdungen</option>
                    </select>
                </div>
            </div>

            <!-- SCHRITT 2: Risiko & Matrix -->
            <div class="wizard-step" id="step-2">
                <div class="risk-assessment-layout">
                    <div class="risk-split">
                        <div class="risk-split-box">
                            <h4 style="display:flex; align-items:center; gap:8px; margin-bottom: 12px;">${Icons.alert} Risiko vor Maßnahmen</h4>
                            <div class="form-grid" style="gap: 10px;">
                                <div><label for="s-vor">Schwere (S)</label><select id="s-vor"><option value="1">1 (Leicht)</option><option value="2">2 (Schwer)</option><option value="3" selected>3 (Tod)</option></select></div>
                                <div><label for="w-vor">Wahrscheinlichkeit (W)</label><select id="w-vor"><option value="1">1 (Unwahr.)</option><option value="2" selected>2 (Möglich)</option><option value="3">3 (Wahr.)</option></select></div>
                            </div>
                        </div>
                        <div class="risk-split-box success">
                            <h4 style="display:flex; align-items:center; gap:8px; margin-bottom: 12px;">${Icons.check} Restrisiko nach Maßnahmen</h4>
                            <div class="form-grid" style="gap: 10px;">
                                <div><label for="s-nach">Schwere (S)</label><select id="s-nach"><option value="1">1 (Leicht)</option><option value="2">2 (Schwer)</option><option value="3">3 (Tod)</option></select></div>
                                <div><label for="w-nach">Wahrscheinlichkeit (W)</label><select id="w-nach"><option value="1" selected>1 (Unwahr.)</option><option value="2">2 (Möglich)</option><option value="3">3 (Wahr.)</option></select></div>
                            </div>
                        </div>
                    </div>
                    <div class="dual-matrix-container">
                        <div class="matrix-col">
                            <div class="matrix-title">Vorher</div>
                            <div class="matrix-grid">
                                <div class="matrix-cell c-yellow" id="vor-3-1">Mittel</div><div class="matrix-cell c-red" id="vor-3-2">Hoch</div><div class="matrix-cell c-red" id="vor-3-3">Hoch</div>
                                <div class="matrix-cell c-green" id="vor-2-1">Gering</div><div class="matrix-cell c-yellow" id="vor-2-2">Mittel</div><div class="matrix-cell c-red" id="vor-2-3">Hoch</div>
                                <div class="matrix-cell c-green" id="vor-1-1">Gering</div><div class="matrix-cell c-green" id="vor-1-2">Gering</div><div class="matrix-cell c-yellow" id="vor-1-3">Mittel</div>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; color: #cbd5e1;">${Icons.arrowRight}</div>
                        <div class="matrix-col">
                            <div class="matrix-title">Nachher</div>
                            <div class="matrix-grid">
                                <div class="matrix-cell c-yellow" id="nach-3-1">Mittel</div><div class="matrix-cell c-red" id="nach-3-2">Hoch</div><div class="matrix-cell c-red" id="nach-3-3">Hoch</div>
                                <div class="matrix-cell c-green" id="nach-2-1">Gering</div><div class="matrix-cell c-yellow" id="nach-2-2">Mittel</div><div class="matrix-cell c-red" id="nach-2-3">Hoch</div>
                                <div class="matrix-cell c-green" id="nach-1-1">Gering</div><div class="matrix-cell c-green" id="nach-1-2">Gering</div><div class="matrix-cell c-yellow" id="nach-1-3">Mittel</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SCHRITT 3: Maßnahmen & Fristen -->
            <div class="wizard-step" id="step-3">
                <div id="step3-context-banner" class="context-banner">
                    ${Icons.info}
                    <span>Aktueller Gefährdungsfaktor: <span id="step3-current-gefaehrdung" style="font-weight: 800;">-</span></span>
                </div>
                <div class="form-group">
                    <label>Persönliche Schutzausrüstung (PSA-Auswahl)</label>
                    <button type="button" class="btn btn-secondary" id="btn-open-psa" style="width: 100%; justify-content: space-between; background: #fff; border: 1px solid #cbd5e1; font-weight: 600;">
                        <span style="display:flex; align-items:center; gap:8px;">${Icons.shield} PSA-Assistent öffnen</span>
                        <span id="psa-badge-count" style="background: var(--primary); color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">0 gewählt</span>
                    </button>
                    <div id="step3-psa-preview" class="selected-psa-preview-box"></div>
                    <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="psa-still-required" checked style="width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer;">
                        <label for="psa-still-required" style="margin: 0; cursor: pointer; text-transform: none; font-weight: 600; font-size: 12px; color: var(--text-main);">PSA ist nach getroffenen (T/O-)Maßnahmen weiterhin erforderlich</label>
                    </div>
                </div>
                <div class="form-group" style="margin-top: 20px;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Schutzmaßnahmen nach STOP-Prinzip</span>
                    <div class="stop-input-container">
                        <div class="stop-row"><div class="stop-indicator s">S</div><div class="stop-field-wrapper"><div id="multi-s"></div><button type="button" class="btn-add-small" data-stop="s" data-placeholder="Substitution (Gefahr beseitigen)">${Icons.plus} Maßnahme ergänzen</button></div></div>
                        <div class="stop-row"><div class="stop-indicator t">T</div><div class="stop-field-wrapper"><div id="multi-t"></div><button type="button" class="btn-add-small" data-stop="t" data-placeholder="Technische Maßnahmen">${Icons.plus} Maßnahme ergänzen</button></div></div>
                        <div class="stop-row"><div class="stop-indicator o">O</div><div class="stop-field-wrapper"><div id="multi-o"></div><button type="button" class="btn-add-small" data-stop="o" data-placeholder="Organisatorische Maßnahmen">${Icons.plus} Maßnahme ergänzen</button></div></div>
                        <div class="stop-row" style="border: none; padding: 0;"><div class="stop-indicator p">P</div><div class="stop-field-wrapper"><div id="multi-p"></div><button type="button" class="btn-add-small" data-stop="p" data-placeholder="Persönliche Schutzmaßnahmen">${Icons.plus} Maßnahme ergänzen</button></div></div>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group"><label for="verantwortlich">Verantwortlich <span style="color:red;">*</span></label><input type="text" id="verantwortlich" required placeholder="Name / Abteilung"></div>
                    <div class="form-group">
                        <label for="frist-typ">Realisierung / Frist <span style="color:red;">*</span></label>
                        <div style="display: flex; gap: 10px;">
                            <select id="frist-typ" required style="flex: 1;">
                                <option value="datum">Spezifisches Datum</option>
                                <option value="Täglich">Täglich</option>
                                <option value="Wöchentlich">Wöchentlich</option>
                                <option value="Monatlich">Monatlich</option>
                                <option value="Quartalsweise">Quartalsweise</option>
                                <option value="Halbjährlich">Halbjährlich</option>
                                <option value="Jährlich">Jährlich</option>
                                <option value="Laufend">Laufend</option>
                            </select>
                            <input type="date" id="frist-datum" required style="flex: 1;">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="wizard-footer">
            <button type="button" id="btn-prev" class="btn btn-secondary" style="display: none;">Zurück</button>
            <div style="flex-grow: 1;"></div>
            <button type="button" id="btn-next" class="btn btn-primary">Weiter</button>
            <button type="submit" id="btn-submit" class="btn btn-primary" style="display: none; background-color: #10b981;">Speichern</button>
        </div>
      </form>
      </div>

      <div class="tab-panel" id="tab-panel-table" data-panel="table">
      <div id="table-anchor" class="table-toolbar no-print">
          <div class="toolbar-title">
            <h3 style="font-size: 16px; color: #1e293b; margin: 0;">Dokumentierte Risiken</h3>
            <div class="toolbar-actions mobile-only">
              <button id="btn-export-mobile" class="btn btn-outline btn-sm">${Icons.download} Export</button>
              <button id="btn-print-mobile" class="btn btn-outline btn-sm">${Icons.printer} Druck</button>
            </div>
          </div>
          <div class="template-section">
              <span class="template-label">Basis-GB laden:</span>
              <div class="template-buttons" id="template-btn-container">
                  <button class="btn btn-outline tpl-btn" data-tpl="spielhalle">${Icons.file} Spielhalle</button>
                  <button class="btn btn-outline tpl-btn" data-tpl="fitnessstudio">${Icons.file} Fitness</button>
                  <button class="btn btn-outline tpl-btn" data-tpl="schwimmbad">${Icons.file} Schwimmbad</button>
                  <button class="btn btn-outline tpl-btn" data-tpl="buero">${Icons.file} Büro</button>
                  <button class="btn btn-outline tpl-btn" data-tpl="gebaeudereinigung">${Icons.file} Reinigung</button>
                  <button class="btn btn-outline tpl-btn" data-tpl="itunternehmen">${Icons.file} IT</button>
                  <button class="btn btn-outline tpl-btn" data-tpl="einzelhandel">${Icons.file} Handel</button>
              </div>
          </div>
      </div>

      <div class="table-container">
          <table id="gb-table">
              <thead>
                  <tr>
                      <th style="width: 3%;" class="no-print"></th>
                      <th style="width: 15%;" class="sortable" data-sort="taetigkeit">Tätigkeit <span class="sort-icon">${Icons.chevronsUpDown}</span></th>
                      <th style="width: 13%;" class="sortable" data-sort="gefaehrdung">Gefahr <span class="sort-icon">${Icons.chevronsUpDown}</span></th>
                      <th style="width: 13%;" class="sortable" data-sort="risiko">Risiko <span class="sort-icon">${Icons.chevronsUpDown}</span></th>
                      <th style="width: 24%;">Maßnahmen (STOP)</th>
                      <th style="width: 15%;">PSA / Schutzausrüstung</th>
                      <th style="width: 10%;" class="sortable" data-sort="verantwortlich">Verantw. <span class="sort-icon">${Icons.chevronsUpDown}</span></th>
                      <th style="width: 7%;" class="sortable" data-sort="frist">Frist <span class="sort-icon">${Icons.chevronsUpDown}</span></th>
                      <th style="width: 2%;" class="no-print">Aktion</th>
                  </tr>
              </thead>
              <tbody></tbody>
          </table>
      </div>
      </div>
    </div>
  `;
}

function renderPsaModal() {
  return `
    <div id="psa-modal" class="modal-overlay">
      <div class="modal-container">
          <div class="modal-header">
              <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; display:flex; align-items:center; gap:8px;">${Icons.shield} PSA-Auswahl-Assistent</h3>
              <button type="button" id="btn-close-psa-top" class="btn-icon" style="background: transparent; font-size: 18px; cursor: pointer;">${Icons.x}</button>
          </div>
          <div class="modal-body" id="modal-psa-list"></div>
          <div class="modal-footer">
              <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);" id="modal-selected-counter">0 ausgewählt</span>
              <div style="display: flex; gap: 10px;">
                  <button type="button" class="btn btn-secondary" id="btn-close-psa-bottom">Abbrechen</button>
                  <button type="button" class="btn btn-primary" id="btn-apply-psa">Übernehmen</button>
              </div>
          </div>
      </div>
    </div>
  `;
}

function renderSettingsModal() {
  return `
    <dialog id="settings-modal" class="modal">
      <div class="modal-content settings-container" id="settings-container">
        <header class="settings-header">
          <div class="header-title-group">
            <div class="icon-circle">${Icons.settings}</div>
            <h2 id="settings-title">Einstellungen</h2>
          </div>
          <button id="close-settings-btn" class="btn-icon-close" aria-label="Schließen">
            ${Icons.x}
          </button>
        </header>

        <div class="settings-body">
          <nav class="settings-sidebar">
            <ul class="settings-menu">
              <li>
                <button class="settings-tab active" data-target="settings-general">
                  <span class="tab-icon">${Icons.settings}</span>
                  <span class="tab-label">Allgemein</span>
                  <span class="mobile-only">${Icons.chevronRight}</span>
                </button>
              </li>
              <li>
                <button class="settings-tab" data-target="settings-profile">
                  <span class="tab-icon">${Icons.user}</span>
                  <span class="tab-label">Profil</span>
                  <span class="mobile-only">${Icons.chevronRight}</span>
                </button>
              </li>
              <li>
                <button class="settings-tab" data-target="settings-data">
                  <span class="tab-icon">${Icons.save}</span>
                  <span class="tab-label">Daten & Backup</span>
                  <span class="mobile-only">${Icons.chevronRight}</span>
                </button>
              </li>
            </ul>
          </nav>

          <main class="settings-content">
            <!-- Tab: Allgemein -->
            <section id="settings-general" class="settings-panel active">
              <div class="panel-section">
                <h3 class="section-title">Erscheinungsbild</h3>
                <p class="section-desc">Passen Sie das Design der Anwendung an Ihre Vorlieben an.</p>

                <div class="settings-row">
                  <div class="setting-info">
                    <label for="theme-select">Farbschema</label>
                    <span>Wählen Sie zwischen hellem, dunklem oder System-Design.</span>
                  </div>
                  <select id="theme-select" class="form-control select-custom">
                    <option value="system">Systemstandard</option>
                    <option value="light">Helles Design</option>
                    <option value="dark">Dunkles Design</option>
                  </select>
                </div>

                <div class="settings-row">
                  <div class="setting-info">
                    <label for="compact-view-check">Kompakt-Modus</label>
                    <span>Reduziert Abstände in Tabellen für mehr Übersicht.</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" id="compact-view-check">
                    <span class="slider round"></span>
                  </label>
                </div>

                <div class="settings-row vertical">
                  <div class="setting-info">
                    <label>Schriftgröße (<span id="font-size-label">100</span>%)</label>
                  </div>
                  <div class="range-container">
                    <span class="range-min">80%</span>
                    <input type="range" id="font-size-range" min="80" max="150" step="5" value="100" class="range-custom">
                    <span class="range-max">150%</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="settings-profile" class="settings-panel">
              <div class="panel-section">
                <h3 class="section-title">Prüfer-Profil</h3>
                <p class="section-desc">Diese Daten werden automatisch in neue Berichte übernommen.</p>

                <div class="form-group">
                  <label for="prof-name">Vollständiger Name</label>
                  <input type="text" id="prof-name" class="form-control" placeholder="z.B. Max Mustermann">
                </div>

                <div class="form-group">
                  <label for="prof-role">Position / Fachkunde</label>
                  <input type="text" id="prof-role" class="form-control" placeholder="z.B. Fachkraft für Arbeitssicherheit">
                </div>

                <div class="form-group" style="display:none;">
                  <input type="text" id="prof-cert">
                </div>
              </div>
            </section>

            <section id="settings-data" class="settings-panel">
              <div class="panel-section">
                <h3 class="section-title">Datenverwaltung</h3>
                <p class="section-desc">Sichern Sie Ihre lokalen Daten oder stellen Sie diese wieder her.</p>

                <div class="data-action-cards">
                  <div class="action-card">
                    <div class="card-icon">${Icons.download}</div>
                    <div class="card-text">
                      <h4>Exportieren</h4>
                      <p>Alle Daten als JSON-Datei sichern.</p>
                    </div>
                    <button id="btn-export-db" class="btn btn-outline btn-sm">Backup erstellen</button>
                  </div>

                  <div class="action-card">
                    <div class="card-icon">${Icons.upload}</div>
                    <div class="card-text">
                      <h4>Importieren</h4>
                      <p>Daten aus einer Sicherung einlesen.</p>
                    </div>
                    <button id="btn-import-trigger" class="btn btn-outline btn-sm">Datei wählen</button>
                    <input type="file" id="db-import-file" style="display: none;" accept=".json">
                  </div>
                </div>

                <div class="danger-zone-box">
                  <div class="danger-header">
                    ${Icons.alert}
                    <h4>Gefahrenzone</h4>
                  </div>
                  <p>Durch das Zurücksetzen werden alle Betriebe, Beurteilungen und Einstellungen unwiderruflich gelöscht.</p>
                  <button id="btn-factory-reset" class="btn btn-danger-soft">App vollständig zurücksetzen</button>
                </div>
              </div>
            </section>

            <section id="settings-suggestions" class="settings-panel" style="display:none;">
                <select id="suggest-type-select"><option value="taetigkeit"></option></select>
                <div id="suggestion-list-container"></div>
                <button id="btn-refresh-suggestions"></button>
            </section>
          </main>
        </div>

        <footer class="settings-footer">
          <button id="save-settings-btn" class="btn btn-primary btn-save-all">
            ${Icons.check} Einstellungen speichern
          </button>
        </footer>
      </div>
    </dialog>
  `;
}

        <footer class="settings-footer">
          <button id="save-settings-btn" class="btn btn-primary" style="width: 100%;">Einstellungen speichern</button>
        </footer>
      </div>
    </dialog>
  `;
}

function renderBetriebFormModal() {
  return `
    <div id="betrieb-modal" class="modal-overlay">
      <div class="modal-container" style="width: 520px; max-width: 95vw;">
        <form id="betrieb-form">
          <div class="modal-header">
              <h3 id="betrieb-modal-title" style="font-size: 16px; font-weight: 700; color: #1e293b;">Neuer Betrieb</h3>
              <button type="button" id="btn-close-betrieb-top" class="btn-icon" style="background: transparent; font-size: 18px; cursor: pointer;">${Icons.x}</button>
          </div>
          <div class="modal-body">
              <div class="form-group">
                  <label for="betrieb-name">Name / Firma <span style="color:red;">*</span></label>
                  <input type="text" id="betrieb-name" required placeholder="z.B. Muster GmbH">
              </div>

              <div class="form-group" style="margin-top: 14px;">
                  <label for="betrieb-strasse">Straße & Hausnummer</label>
                  <input type="text" id="betrieb-strasse" placeholder="Musterstraße 123">
              </div>

              <div class="form-grid" style="margin-top: 14px; display: flex; gap: 10px;">
                  <div class="form-group" style="flex: 1;">
                      <label for="betrieb-plz">PLZ</label>
                      <input type="text" id="betrieb-plz" placeholder="12345">
                  </div>
                  <div class="form-group" style="flex: 2;">
                      <label for="betrieb-ort">Ort</label>
                      <input type="text" id="betrieb-ort" placeholder="Musterstadt">
                  </div>
              </div>

              <div class="form-group" style="margin-top: 14px;">
                  <label for="betrieb-kontakt">Ansprechpartner</label>
                  <input type="text" id="betrieb-kontakt" placeholder="Max Mustermann">
              </div>

              <div class="form-grid" style="margin-top: 14px; display: flex; gap: 10px;">
                  <div class="form-group" style="flex: 1;">
                      <label for="betrieb-telefon">Telefon</label>
                      <input type="tel" id="betrieb-telefon" placeholder="0123 456789">
                  </div>
                  <div class="form-group" style="flex: 1;">
                      <label for="betrieb-email">E-Mail</label>
                      <input type="email" id="betrieb-email" placeholder="max@beispiel.de">
                  </div>
              </div>

              <div class="form-group" style="margin-top: 14px;">
                  <label for="betrieb-auditor">Geprüft durch (Name)</label>
                  <input type="text" id="betrieb-auditor" placeholder="Name des Erstellers / SiFa">
              </div>
          </div>
          <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-close-betrieb-bottom">Abbrechen</button>
              <button type="submit" class="btn btn-primary">Betrieb speichern</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
