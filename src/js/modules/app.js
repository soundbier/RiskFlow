/**
 * RiskFlow & GB-Tool – Haupt-App Modul
 * Initialisiert die Benutzeroberfläche und das Routing
 */

// Zentrales SVG-Dictionary für sauberen HTML-Code
export const Icons = {
  building: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="12" y1="14" x2="12.01" y2="14"></line><line x1="12" y1="10" x2="12.01" y2="10"></line><line x1="8" y1="18" x2="8.01" y2="18"></line><line x1="8" y1="14" x2="8.01" y2="14"></line><line x1="8" y1="10" x2="8.01" y2="10"></line><line x1="16" y1="18" x2="16.01" y2="18"></line><line x1="16" y1="14" x2="16.01" y2="14"></line><line x1="16" y1="10" x2="16.01" y2="10"></line></svg>`,
  settings: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  download: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
  upload: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
  printer: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`,
  x: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  edit: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  alert: `<svg class="icon text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  check: `<svg class="icon text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  shield: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  folder: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  clipboard: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
  save: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`,
  plus: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  file: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`
};

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
      <div class="header">
        <div class="logo-area" id="brand-title" tabindex="0" role="button" style="cursor: pointer;">
          <h1>RiskFlow</h1>
          <span>RiskFlow – Arbeitsschutz einfach gemacht</span>
        </div>
        <div class="header-actions no-print">
          <select id="company-quick-select" class="btn btn-secondary" style="display:none; font-size: 12px; max-width: 220px; text-overflow: ellipsis;" title="Betrieb wechseln"></select>
          <button id="btn-goto-betriebe" class="btn btn-primary">${Icons.building} Meine Betriebe</button>
          <button id="btn-export" class="btn btn-secondary" style="display:none;">${Icons.download} Excel Export</button>
          <button id="btn-print" class="btn btn-secondary" style="display:none;">${Icons.printer} PDF Drucken</button>
          <button id="open-settings-btn" class="btn btn-secondary">${Icons.settings} Einstellungen</button>
        </div>
      </div>
      
      <div id="company-info-bar" class="company-info-bar" style="display: none;">
        <div class="company-details-grid" style="flex-grow: 1;">
            <div class="info-block"><span class="info-label">Betrieb / Firma</span><span class="info-value" id="display-c-name">-</span></div>
            <div class="info-block"><span class="info-label">Standort / Anschrift</span><span class="info-value" id="display-c-location">-</span></div>
            <div class="info-block"><span class="info-label">Geprüft durch</span><span class="info-value" id="display-c-auditor">-</span></div>
            <div class="info-block"><span class="info-label">Angelegt am</span><span class="info-value" id="display-c-date">-</span></div>
        </div>
        <div style="display: flex; gap: 8px; margin-left: 20px;">
            <button id="btn-edit-company" class="btn btn-outline no-print" style="font-size: 11px; padding: 6px 12px;">Stammdaten bearbeiten</button>
            <button id="btn-close-workspace" class="btn btn-secondary no-print" style="font-size: 11px; padding: 6px 12px;">${Icons.x} Schließen</button>
        </div>
      </div>

      <main id="main-content"></main>
    </div>

    ${renderPsaModal()}
    ${renderSettingsModal()}
    ${renderBetriebFormModal()}
  `;

  document.getElementById('brand-title').addEventListener('click', () => navigateTo('betriebe'));
}

function handleRouting() {
  const params = new URLSearchParams(window.location.search);
  const action = params.get('action');

  if (action === 'workspace') navigateTo('workspace', false);
  else navigateTo('betriebe', false);
}

export function navigateTo(view, pushState = true) {
  currentView = view;
  
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
                        <div style="display:flex; align-items:center; font-size: 24px; color: #cbd5e1; font-weight: bold;">➔</div>
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
      <div id="table-anchor" class="table-toolbar no-print" style="margin-top: 20px;">
          <h3 style="font-size: 16px; color: #1e293b;">Dokumentierte Risiken</h3>
          <div style="display:flex; flex-direction: column; align-items: flex-end; gap: 6px;">
              <span style="font-size: 12px; color: #64748b;">Basis-GB inkl. Standard-Risiken laden:</span>
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
                      <th style="width: 15%;" class="sortable" data-sort="taetigkeit">Tätigkeit <span class="sort-icon">↕</span></th>
                      <th style="width: 13%;" class="sortable" data-sort="gefaehrdung">Gefahr <span class="sort-icon">↕</span></th>
                      <th style="width: 13%;" class="sortable" data-sort="risiko">Risiko <span class="sort-icon">↕</span></th>
                      <th style="width: 24%;">Maßnahmen (STOP)</th>
                      <th style="width: 15%;">PSA / Schutzausrüstung</th>
                      <th style="width: 10%;" class="sortable" data-sort="verantwortlich">Verantw. <span class="sort-icon">↕</span></th>
                      <th style="width: 7%;" class="sortable" data-sort="frist">Frist <span class="sort-icon">↕</span></th>
                      <th style="width: 2%;" class="no-print">Aktion</th>
                  </tr>
              </thead>
              <tbody></tbody>
          </table>
      </div>
      </div>

      <!-- MOBILE-TABLEISTE -->
      <nav class="mobile-tabbar no-print" id="mobile-tabbar">
          <button type="button" class="mobile-tab active" data-tab="create">
              ${Icons.plus}
              <span>Erstellen</span>
          </button>
          <button type="button" class="mobile-tab" data-tab="table">
              ${Icons.file}
              <span>Übersicht</span>
              <span class="mobile-tab-count" id="mobile-tab-count" style="display:none;"></span>
          </button>
          <button type="button" class="mobile-tab" data-tab="settings" id="mobile-tab-settings">
              ${Icons.settings}
              <span>Einstellungen</span>
          </button>
      </nav>
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
      <div class="modal-content settings-container">
        
        <!-- Header -->
        <header class="settings-header">
          <h2 style="display: flex; align-items: center; gap: 8px;">${Icons.settings} Einstellungen</h2>
          <button id="close-settings-btn" class="btn-icon" aria-label="Schließen" style="background: transparent; border: none; cursor: pointer;">
            ${Icons.x}
          </button>
        </header>

        <!-- Body -->
        <div class="settings-body">
          
          <!-- Sidebar Navigation -->
          <nav class="settings-sidebar">
            <ul class="settings-menu">
              <li><button class="settings-tab active" data-target="settings-general">Allgemein</button></li>
              <li><button class="settings-tab" data-target="settings-profile">Profil</button></li>
              <li><button class="settings-tab" data-target="settings-suggestions">Vorschläge</button></li>
              <li><button class="settings-tab" data-target="settings-structure">Betrieb & Abteilungen</button></li>
              <li><button class="settings-tab" data-target="settings-data">Daten & Backup</button></li>
            </ul>
          </nav>

          <!-- Main Content -->
          <main class="settings-content">
            
            <!-- Tab: Allgemein -->
            <section id="settings-general" class="settings-panel active">
              <h3>Erscheinungsbild</h3>
              <p class="settings-description">Passen Sie die Darstellung der App an Ihre Arbeitsumgebung an.</p>

              <div class="form-group">
                <label for="theme-select">Farbschema</label>
                <select id="theme-select" class="form-control">
                  <option value="system">Systemstandard</option>
                  <option value="light">Helles Design</option>
                  <option value="dark">Dunkles Design (OLED-freundlich)</option>
                </select>
              </div>

              <div class="form-group">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                  <input type="checkbox" id="compact-view-check" style="width: 18px; height: 18px; cursor: pointer;">
                  <span>Kompakt-Ansicht (Tabellen verkleinern)</span>
                </label>
              </div>

              <div class="form-group">
                <label for="font-size-range">Schriftgröße (<span id="font-size-label">100</span>%)</label>
                <input type="range" id="font-size-range" min="80" max="150" step="5" value="100" style="width: 100%; cursor: pointer;">
              </div>
            </section>

            <!-- Tab: Profil -->
            <section id="settings-profile" class="settings-panel">
              <h3>Standard-Prüfer</h3>
              <p class="settings-description">Hinterlegen Sie hier Ihre Daten, um sie beim Erstellen neuer Betriebe automatisch einzufügen.</p>

              <div class="form-group">
                <label for="prof-name">Name des Prüfers</label>
                <input type="text" id="prof-name" class="form-control" placeholder="z.B. Max Mustermann">
              </div>
              <div class="form-group">
                <label for="prof-role">Position / Fachkunde</label>
                <input type="text" id="prof-role" class="form-control" placeholder="z.B. Fachkraft für Arbeitssicherheit">
              </div>
              <div class="form-group">
                <label for="prof-cert">Zertifikats- / ID-Nummer</label>
                <input type="text" id="prof-cert" class="form-control" placeholder="Optional">
              </div>
            </section>

            <!-- Tab: Vorschläge -->
            <section id="settings-suggestions" class="settings-panel">
              <h3>Vorschlags-Verwaltung</h3>
              <p class="settings-description">Korrigieren oder löschen Sie Begriffe, die in Ihren Vorschlagslisten (Datalists) erscheinen.</p>

              <div class="suggestion-manager">
                <div style="margin-bottom: 1rem; display: flex; gap: 10px;">
                  <select id="suggest-type-select" class="form-control" style="flex: 1;">
                    <option value="taetigkeit">Tätigkeiten / Arbeitsplätze</option>
                    <option value="bereich">Bereiche / Abteilungen</option>
                  </select>
                  <button id="btn-refresh-suggestions" class="btn btn-secondary" title="Liste aktualisieren">${Icons.check}</button>
                </div>

                <div id="suggestion-list-container" class="suggestion-list">
                  <!-- Dynamisch befüllt -->
                  <p style="text-align: center; color: var(--text-muted); padding: 2rem;">Lade Vorschläge...</p>
                </div>
              </div>
            </section>

            <!-- Tab: Betriebsstruktur -->
            <section id="settings-structure" class="settings-panel">
              <h3>Betriebsstruktur</h3>
              <p class="settings-description">Verwalten Sie hier die übergeordneten Standorte und Abteilungen für Ihre Berichte.</p>
              <div class="form-group">
                <label>Schnellzugriff auf Betriebe</label>
                <p style="font-size: 13px; color: var(--text-muted);">Nutzen Sie das Dashboard, um neue Betriebe anzulegen oder bestehende zu bearbeiten.</p>
              </div>
              <button class="btn btn-secondary" onclick="window.location.href='/'">Zum Dashboard</button>
            </section>

            <!-- Tab: Daten & Backup -->
            <section id="settings-data" class="settings-panel">
              <h3>Datenverwaltung</h3>
              <p class="settings-description">Sichern Sie Ihre Daten oder übertragen Sie sie auf ein anderes Gerät. Die Speicherung erfolgt aktuell rein lokal in Ihrem Browser.</p>

              <div class="data-actions-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <div class="card" style="padding: 1.25rem; border: 1px solid var(--border);">
                  <h4 style="margin-top: 0;">${Icons.download} Export</h4>
                  <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 1rem;">Lädt alle Betriebe und Beurteilungen als JSON-Datei herunter.</p>
                  <button id="btn-export-db" class="btn btn-primary" style="width: 100%;">Backup erstellen</button>
                </div>

                <div class="card" style="padding: 1.25rem; border: 1px solid var(--border);">
                  <h4 style="margin-top: 0;">${Icons.upload} Import</h4>
                  <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 1rem;">Wiederherstellung aus einer zuvor exportierten Datei.</p>
                  <button id="btn-import-trigger" class="btn btn-outline" style="width: 100%;">Datei einlesen</button>
                  <input type="file" id="db-import-file" style="display: none;" accept=".json">
                </div>
              </div>

              <div style="margin-top: 2rem; padding: 1rem; background: #fff1f2; border-radius: 8px; border: 1px solid #fecaca;">
                <h4 style="margin-top: 0; color: #b91c1c; display: flex; align-items: center; gap: 8px;">${Icons.alert} Gefahrenzone</h4>
                <p style="font-size: 12px; color: #7f1d1d; margin-bottom: 1rem;">Hiermit werden alle lokalen Daten (inkl. aller Betriebe) unwiderruflich gelöscht.</p>
                <button id="btn-factory-reset" class="btn btn-outline" style="color: #b91c1c; border-color: #fca5a5;">App zurücksetzen</button>
              </div>
            </section>

          </main>
        </div>

        <!-- Footer -->
        <footer class="settings-footer">
          <button id="cancel-settings-btn" class="btn btn-secondary">Abbrechen</button>
          <button id="save-settings-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px;">
            ${Icons.save} Speichern
          </button>
        </footer>

      </div>
    </dialog>
  `;
}

function renderBetriebeUebersicht() {
  return `
    <div id="betriebe-view" class="no-print">
      <div class="betriebe-header">
        <div>
          <h2>Meine Betriebe</h2>
          <p class="betriebe-subtitle">Wählen Sie einen Betrieb aus, um dessen Gefährdungsbeurteilungen zu bearbeiten.</p>
        </div>
        <button type="button" class="btn btn-primary" id="btn-new-betrieb">${Icons.plus} Neuer Betrieb</button>
      </div>
      <div class="betriebe-grid" id="betriebe-grid">
        <!-- wird per JS befüllt -->
      </div>
    </div>
  `;
}

function renderBetriebFormModal() {
  return `
    <div id="betrieb-modal" class="modal-overlay">
      <div class="modal-container" style="width: 480px;">
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
                  <label for="betrieb-anschrift">Standort / Anschrift</label>
                  <input type="text" id="betrieb-anschrift" placeholder="Straße, PLZ Ort">
              </div>
              <div class="form-group" style="margin-top: 14px;">
                  <label for="betrieb-auditor">Geprüft durch (Name)</label>
                  <input type="text" id="betrieb-auditor" placeholder="Name des Erstellers / SiFa">
              </div>
          </div>
          <div class="modal-footer">
              <div></div>
              <div style="display: flex; gap: 10px;">
                  <button type="button" class="btn btn-secondary" id="btn-close-betrieb-bottom">Abbrechen</button>
                  <button type="submit" class="btn btn-primary">Speichern</button>
              </div>
          </div>
        </form>
      </div>
    </div>
  `;
}
