/**
 * RiskFlow & GB-Tool – Haupt-App Modul
 * Initialisiert die Benutzeroberfläche und das Routing
 */

let currentView = 'setup'; // Startet standardmäßig im Setup, Logik folgt später

export async function initializeApp() {
  renderLayout();
  handleRouting();
  window.addEventListener('popstate', handleRouting);
  
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

/**
 * Baut das statische Grundgerüst (Header, Main-Container, globale Modals).
 */
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
          <button id="btn-settings" class="btn btn-secondary">⚙️ Einstellungen</button>
          <button id="btn-export" class="btn btn-secondary" style="display:none;">Excel Export</button>
          <button id="btn-print" class="btn btn-secondary" style="display:none;">PDF Drucken</button>
          <button id="btn-clear" class="btn btn-danger-outline" style="display:none;">Alle Löschen</button>
        </div>
      </div>
      
      <!-- Aktive Betriebsdaten-Leiste (wird eingeblendet, wenn Daten vorhanden sind) -->
      <div id="company-info-bar" class="company-info-bar">
        <div class="company-details-grid">
            <div class="info-block"><span class="info-label">Betrieb / Firma</span><span class="info-value" id="display-c-name">-</span></div>
            <div class="info-block"><span class="info-label">Standort / Filiale</span><span class="info-value" id="display-c-location">-</span></div>
            <div class="info-block"><span class="info-label">Geprüft durch</span><span class="info-value" id="display-c-auditor">-</span></div>
            <div class="info-block"><span class="info-label">Erstellungsdatum</span><span class="info-value" id="display-c-date">-</span></div>
            <div class="info-block"><span class="info-label">Nächste Überarbeitung</span><span class="info-value" id="display-c-next-review">-</span></div>
        </div>
        <button id="btn-edit-company" class="btn btn-outline no-print" style="font-size: 11px; padding: 6px 12px; margin-left: 15px;">Stammdaten bearbeiten</button>
      </div>

      <!-- Hier werden die dynamischen Views (Setup oder Workspace) gerendert -->
      <main id="main-content"></main>
    </div>

    <!-- GLOBALE MODALS (werden in Schritt 4 mit Event-Listenern versehen) -->
    ${renderPsaModal()}
    ${renderSettingsModal()}
  `;

  document.getElementById('brand-title').addEventListener('click', () => navigateTo('workspace'));
}

/**
 * PWA Routing
 */
function handleRouting() {
  const params = new URLSearchParams(window.location.search);
  const action = params.get('action');

  if (action === 'workspace') navigateTo('workspace', false);
  else if (action === 'setup') navigateTo('setup', false);
  else navigateTo('workspace', false); // Standard-Route
}

function navigateTo(view, pushState = true) {
  currentView = view;
  
  if (pushState) {
    const url = view === 'workspace' ? '/' : `/?action=${view}`;
    window.history.pushState({ view }, '', url);
  }

  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = ''; 

  if (view === 'setup') {
    mainContent.innerHTML = renderCompanySetup();
  } else if (view === 'workspace') {
    mainContent.innerHTML = renderWorkspace();
  }
}

// ==========================================
// VIEWS (HTML Templates)
// ==========================================

function renderCompanySetup() {
  return `
    <div id="company-setup-card" class="card company-setup no-print">
      <h2>
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        Betriebsanlage & Stammdaten
      </h2>
      <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 24px;">Bitte erfassen Sie zunächst die Kerndaten des Betriebs oder der Filiale, für die diese Gefährdungsbeurteilung durchgeführt wird.</p>
      
      <form id="company-form">
        <div class="form-grid">
            <div class="form-group"><label for="c-name">Firmenname / Betrieb <span style="color:red;">*</span></label><input type="text" id="c-name" required placeholder="z.B. Muster GmbH"></div>
            <div class="form-group"><label for="c-location">Standort / Filiale / Abteilung <span style="color:red;">*</span></label><input type="text" id="c-location" required placeholder="z.B. Zentrale Berlin"></div>
            <div class="form-group"><label for="c-auditor">Geprüft durch (Name)</label><input type="text" id="c-auditor" placeholder="Name des Erstellers"></div>
            <div class="form-group" style="display: flex; gap: 10px;">
                <div style="flex: 1;"><label for="c-date">Erstellungsdatum</label><input type="date" id="c-date"></div>
                <div style="flex: 1;"><label for="c-next-review">Nächste Überarbeitung</label><input type="date" id="c-next-review"></div>
            </div>
        </div>
        <button type="submit" class="btn btn-primary" style="margin-top: 10px; font-size: 14px; padding: 12px 24px;">Betrieb speichern & Dashboard öffnen →</button>
      </form>
    </div>
  `;
}

function renderWorkspace() {
  return `
    <div id="gb-workspace">
      <!-- TAB-PANEL: ERSTELLUNG -->
      <div class="tab-panel active" id="tab-panel-create" data-panel="create">
      <!-- WIZARD FORM -->
      <form id="gb-form" class="card no-print" style="padding: 0;">
        <div class="wizard-header">
            <div class="step-indicator active current" id="ind-1"><span>1</span> Identifikation</div>
            <div class="step-indicator" id="ind-2"><span>2</span> Risikobewertung</div>
            <div class="step-indicator" id="ind-3"><span>3</span> Maßnahmen & Fristen</div>
        </div>

        <div class="wizard-body">
            <!-- EDITING BANNER -->
            <div id="edit-mode-banner" class="edit-banner">
                <span>✏️ Sie bearbeiten einen bestehenden Eintrag.</span>
                <button type="button" class="btn btn-secondary" id="btn-cancel-edit" style="padding: 4px 10px; font-size: 11px;">Bearbeitung abbrechen</button>
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
                        <label for="taetigkeit">Arbeitsplatz / Tätigkeit <span style="color:red;">*</span></label>
                        <input type="text" id="taetigkeit" list="taetigkeit-list" required placeholder="Tippen oder auswählen... z. B. Bohrmaschine">
                        <datalist id="taetigkeit-list"></datalist>
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
            </div>

            <!-- SCHRITT 2: Risiko & Matrix -->
            <div class="wizard-step" id="step-2">
                <div class="risk-assessment-layout">
                    <div class="risk-split">
                        <div class="risk-split-box">
                            <h4>🚨 Risiko VOR Maßnahmen</h4>
                            <div class="form-grid" style="gap: 10px;">
                                <div><label for="s-vor">Schwere (S)</label><select id="s-vor"><option value="1">1 (Leicht)</option><option value="2">2 (Schwer)</option><option value="3" selected>3 (Tod)</option></select></div>
                                <div><label for="w-vor">Wahrscheinlichkeit (W)</label><select id="w-vor"><option value="1">1 (Unwahr.)</option><option value="2" selected>2 (Möglich)</option><option value="3">3 (Wahr.)</option></select></div>
                            </div>
                        </div>
                        <div class="risk-split-box success">
                            <h4>✅ Restrisiko NACH Maßnahmen</h4>
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
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Aktueller Gefährdungsfaktor: <span id="step3-current-gefaehrdung" style="font-weight: 800;">-</span></span>
                </div>
                <div class="form-group">
                    <label>Persönliche Schutzausrüstung (PSA-Auswahl)</label>
                    <button type="button" class="btn btn-secondary" id="btn-open-psa" style="width: 100%; justify-content: space-between; background: #fff; border: 1px solid #cbd5e1; font-weight: 600;">
                        <span>🛡️ PSA-Assistent öffnen</span>
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
                        <!-- S, T, O, P Containers (werden via JS befüllt) -->
                        <div class="stop-row"><div class="stop-indicator s">S</div><div class="stop-field-wrapper"><div id="multi-s"></div><button type="button" class="btn-add-small" data-stop="s" data-placeholder="Substitution (Gefahr beseitigen)">+ Maßnahme ergänzen</button></div></div>
                        <div class="stop-row"><div class="stop-indicator t">T</div><div class="stop-field-wrapper"><div id="multi-t"></div><button type="button" class="btn-add-small" data-stop="t" data-placeholder="Technische Maßnahmen">+ Maßnahme ergänzen</button></div></div>
                        <div class="stop-row"><div class="stop-indicator o">O</div><div class="stop-field-wrapper"><div id="multi-o"></div><button type="button" class="btn-add-small" data-stop="o" data-placeholder="Organisatorische Maßnahmen">+ Maßnahme ergänzen</button></div></div>
                        <div class="stop-row" style="border: none; padding: 0;"><div class="stop-indicator p">P</div><div class="stop-field-wrapper"><div id="multi-p"></div><button type="button" class="btn-add-small" data-stop="p" data-placeholder="Persönliche Schutzmaßnahmen">+ Maßnahme ergänzen</button></div></div>
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
            <button type="button" id="btn-prev" class="btn btn-secondary" style="display: none;">← Zurück</button>
            <div style="flex-grow: 1;"></div>
            <button type="button" id="btn-next" class="btn btn-primary">Weiter →</button>
            <button type="submit" id="btn-submit" class="btn btn-primary" style="display: none; background-color: #10b981;">Gefährdung speichern ✓</button>
        </div>
      </form>
      </div>
      <!-- /TAB-PANEL: ERSTELLUNG -->

      <!-- TAB-PANEL: ÜBERSICHT -->
      <div class="tab-panel" id="tab-panel-table" data-panel="table">

      <!-- Table Section -->
      <div id="table-anchor" class="table-toolbar no-print" style="margin-top: 20px;">
          <h3 style="font-size: 16px; color: #1e293b;">Dokumentierte Risiken</h3>
          <div style="display:flex; flex-direction: column; align-items: flex-end; gap: 6px;">
              <span style="font-size: 12px; color: #64748b;">Basis-GB inkl. Standard-Risiken laden:</span>
              <div class="template-buttons" id="template-btn-container">
                  <button class="btn btn-outline tpl-btn" data-tpl="spielhalle">🎰 Spielhalle</button>
                  <button class="btn btn-outline tpl-btn" data-tpl="fitnessstudio">🏋️ Fitness</button>
                  <button class="btn btn-outline tpl-btn" data-tpl="schwimmbad">🏊 Schwimmbad</button>
                  <button class="btn btn-outline tpl-btn" data-tpl="buero">🏢 Büro</button>
                  <button class="btn btn-outline tpl-btn" data-tpl="gebaeudereinigung">🧹 Reinigung</button>
                  <button class="btn btn-outline tpl-btn" data-tpl="itunternehmen">💻 IT</button>
                  <button class="btn btn-outline tpl-btn" data-tpl="einzelhandel">🛒 Handel</button>
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
      <!-- /TAB-PANEL: ÜBERSICHT -->

      <!-- MOBILE-TABLEISTE (nur < 768px sichtbar, siehe style.css) -->
      <nav class="mobile-tabbar no-print" id="mobile-tabbar">
          <button type="button" class="mobile-tab active" data-tab="create">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>Erstellen</span>
          </button>
          <button type="button" class="mobile-tab" data-tab="table">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
              <span>Übersicht</span>
              <span class="mobile-tab-count" id="mobile-tab-count" style="display:none;"></span>
          </button>
          <button type="button" class="mobile-tab" data-tab="settings" id="mobile-tab-settings">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
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
              <h3 style="font-size: 16px; font-weight: 700; color: #1e293b;">🛡️ PSA-Auswahl-Assistent</h3>
              <button type="button" id="btn-close-psa-top" class="btn-icon" style="background: transparent; font-size: 18px; cursor: pointer;">✕</button>
          </div>
          <div class="modal-body" id="modal-psa-list"></div>
          <div class="modal-footer">
              <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);" id="modal-selected-counter">0 ausgewählt</span>
              <div style="display: flex; gap: 10px;">
                  <button type="button" class="btn btn-secondary" id="btn-close-psa-bottom">Abbrechen</button>
                  <button type="button" class="btn btn-primary" id="btn-apply-psa">Auswahl übernehmen ✓</button>
              </div>
          </div>
      </div>
    </div>
  `;
}

function renderSettingsModal() {
  return `
    <div id="settings-modal" class="modal-overlay">
      <div class="modal-container" style="width: 950px;">
          <div class="modal-header">
              <h3 style="font-size: 16px; font-weight: 700; color: #1e293b;">⚙️ Einstellungsmenü</h3>
              <button type="button" id="btn-close-settings-top" class="btn-icon" style="background: transparent; font-size: 18px; cursor: pointer;">✕</button>
          </div>
          <div class="modal-body">
              <div class="module-switcher">
                  <button type="button" class="module-tab active" id="st-tab-psa">🛡️ PSA-Katalog verwalten</button>
                  <button type="button" class="module-tab" id="st-tab-tpl">📋 Branchen-Templates verwalten</button>
                  <button type="button" class="module-tab" id="st-tab-backup">💾 Daten-Backup</button>
              </div>
              
              <div id="st-content-psa">
                  <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 15px;">Hier können Sie den PSA-Katalog anpassen, der im Assistenten verwendet wird.</p>
                  <div id="settings-psa-list"></div>
                  <button type="button" class="btn btn-outline" id="btn-add-psa-item" style="margin-top: 10px;">+ Neues PSA-Element hinzufügen</button>
              </div>

              <div id="st-content-tpl" style="display:none;">
                  <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 15px;">Wählen Sie eine Branche aus, um die Standard-Vorlagen zu bearbeiten:</p>
                  <div class="form-group">
                      <select id="settings-tpl-select" style="max-width: 300px; margin-bottom: 15px;">
                          <option value="spielhalle">Spielhalle</option>
                          <option value="fitnessstudio">Fitnessstudio</option>
                          <option value="schwimmbad">Schwimmbad</option>
                          <option value="buero">Büro</option>
                          <option value="gebaeudereinigung">Gebäudereinigung</option>
                          <option value="itunternehmen">IT-Unternehmen</option>
                          <option value="einzelhandel">Einzelhandel</option>
                      </select>
                  </div>
                  <div id="settings-tpl-list"></div>
                  <button type="button" class="btn btn-outline" id="btn-add-tpl-item" style="margin-top: 10px;">+ Neue Vorlagen-Zeile hinzufügen</button>
              </div>

              <div id="st-content-backup" style="display:none;">
                  <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 15px;">
                      Exportiert alle Betriebe, Gefährdungsbeurteilungen und dokumentierten Risiken als eine Datei –
                      geeignet als Sicherung oder zum Übertragen auf ein anderes Gerät.
                  </p>
                  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                      <button type="button" class="btn btn-primary" id="btn-export-all">⬇️ Alle Daten exportieren (.json)</button>
                      <label class="btn btn-outline" for="input-import-all" style="cursor:pointer; margin: 0;">⬆️ Backup importieren
                          <input type="file" id="input-import-all" accept="application/json" style="display:none;">
                      </label>
                  </div>
                  <p id="backup-status-msg" style="font-size: 12px; margin-top: 12px; font-weight: 600;"></p>
                  <p style="font-size: 11px; color: var(--text-muted); margin-top: 16px;">
                      ⚠️ Ein Import überschreibt <strong>alle</strong> aktuell gespeicherten Betriebe, Beurteilungen und Risiken auf diesem Gerät.
                  </p>
              </div>
          </div>
          <div class="modal-footer">
              <button type="button" class="btn btn-danger-outline" id="btn-reset-factory">Werkseinstellungen wiederherstellen</button>
              <div style="display: flex; gap: 10px;">
                  <button type="button" class="btn btn-secondary" id="btn-close-settings-bottom">Abbrechen</button>
                  <button type="button" class="btn btn-primary" id="btn-save-settings">Änderungen speichern ✓</button>
              </div>
          </div>
      </div>
    </div>
  `;
}
