/**
 * RiskWerk & GB-Tool – Haupt-App Modul
 * Initialisiert die Benutzeroberfläche und das Routing
 */

import { Icons } from './ui/icons.js';
import {
  Button,
  IconButton,
  BetriebCard,
  EmptyState,
  WizardHeader,
  RiskMatrixColumn,
  StopInputGroup,
  ContextBanner,
  ActionCard,
  BottomNavigation,
  Switch,
  RangeSlider,
  DrillDownPanel
} from './ui/components.js';

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
      <!-- Audit-Proof Print Header -->
      <header class="print-header print-only">
        <div class="print-header-main">
          <div class="print-logo-placeholder">
            <span>LOGO</span>
          </div>
          <div class="print-title-group">
            <h1 class="print-main-title">Gefährdungsbeurteilung nach § 5 ArbSchG</h1>
            <p class="print-subtitle">Dokumentation der Gefährdungen und Maßnahmen</p>
          </div>
        </div>
        <div class="print-company-data">
          <div class="print-data-row">
            <div class="data-item"><strong>Betrieb:</strong> <span id="print-c-name">-</span></div>
            <div class="data-item"><strong>Standort:</strong> <span id="print-c-location">-</span></div>
          </div>
          <div class="print-data-row">
            <div class="data-item"><strong>Prüfer:</strong> <span id="print-c-auditor">-</span></div>
            <div class="data-item"><strong>Stand:</strong> <span id="print-c-date">-</span></div>
          </div>
        </div>
      </header>

      <header class="app-header no-print">
        <div class="header-container">
          <div class="logo-area" id="brand-title" tabindex="0" role="button">
            <div class="logo-icon">${Icons.shield}</div>
            <div class="logo-text">
              <h1>RiskWerk</h1>
              <span class="header-subtitle">Arbeitsschutz einfach gemacht</span>
            </div>
          </div>

          <div class="header-actions no-print">
            <select id="company-quick-select" class="btn btn-secondary desktop-only hidden" style="font-size: 12px; max-width: 200px;" title="Betrieb wechseln"></select>
            ${Button({ text: 'Export', icon: 'download', id: 'btn-export', variant: 'secondary', className: 'desktop-only hidden' })}
            ${Button({ text: 'Drucken', icon: 'printer', id: 'btn-print', variant: 'secondary', className: 'desktop-only hidden' })}
            ${Button({ text: 'Meine Betriebe', icon: 'building', id: 'btn-goto-betriebe', variant: 'primary', className: 'desktop-only' })}
            ${IconButton({ icon: 'settings', id: 'open-settings-btn', ariaLabel: 'Einstellungen' })}
          </div>
        </div>
      </header>
      
      <div id="company-info-bar" class="company-info-bar hidden">
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

      <!-- Audit-Proof Print Footer -->
      <footer class="print-footer print-only">
        <div class="print-footer-container">
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-label">Ort / Datum</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-label">Unterschrift Prüfer</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-label">Unterschrift Geschäftsführung</div>
          </div>
        </div>
        <div class="print-page-numbering"></div>
      </footer>

      <div id="bulk-action-container"></div>

      <div id="bottom-nav-container" class="mobile-only no-print"></div>
    </div>

    ${renderPsaModal()}
    ${renderSettingsModal()}
    ${renderBetriebFormModal()}
  `;

  updateBottomNavigation();

  document.getElementById('brand-title').addEventListener('click', () => navigateTo('betriebe'));
}

function handleRouting() {
  const params = new URLSearchParams(window.location.search);
  const action = params.get('action');

  if (action === 'workspace') navigateTo('workspace', false);
  else navigateTo('betriebe', false);
}

export function updateBottomNavigation(activeId = null, badgeCount = 0) {
  const container = document.getElementById('bottom-nav-container');
  if (!container) return;

  const isWorkspace = currentView === 'workspace';
  let items = [];

  if (isWorkspace) {
    items = [
      { id: 'nav-betriebe', label: 'Betriebe', icon: 'building' },
      { id: 'nav-workspace-table', label: 'Liste', icon: 'clipboard', badgeCount: badgeCount },
      { id: 'nav-workspace-create', label: 'Neu', icon: 'plus' },
      { id: 'nav-settings', label: 'Optionen', icon: 'settings' }
    ];
  } else {
    items = [
      { id: 'nav-betriebe', label: 'Betriebe', icon: 'building' },
      { id: 'nav-plus', label: 'Betrieb', icon: 'plus' },
      { id: 'nav-settings', label: 'Optionen', icon: 'settings' }
    ];
  }

  container.innerHTML = BottomNavigation({
    items,
    activeId: activeId || (isWorkspace ? 'nav-workspace-table' : 'nav-betriebe')
  });
}

export function navigateTo(view, pushState = true) {
  currentView = view;

  updateBottomNavigation();

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
        ${Button({ text: 'Neuer Betrieb', icon: 'plus', id: 'btn-new-betrieb', variant: 'primary', className: 'desktop-only' })}
      </div>

      <div class="betriebe-grid" id="betriebe-grid"></div>
    </div>
  `;
}

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
    <div id="gb-workspace" class="workspace-split-container">
      <div class="tab-panel active" id="tab-panel-create" data-panel="create">
      <form id="gb-form" class="card no-print" style="padding: 0;">
        ${WizardHeader(['Identifikation', 'Risikobewertung', 'Maßnahmen & Fristen'])}

        <div class="wizard-body">
            ${ContextBanner({
              text: 'Sie bearbeiten einen bestehenden Eintrag.',
              icon: 'edit',
              id: 'edit-mode-banner',
              className: 'edit-banner hidden'
            })}

            <!-- SCHRITT 1: Identifikation -->
            <div class="wizard-step active" id="step-1">
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
                            ${RangeSlider({ id: 's-vor', label: 'Schwere (S)', min: 1, max: 3, value: 3 })}
                            ${RangeSlider({ id: 'w-vor', label: 'Wahrscheinlichkeit (W)', min: 1, max: 3, value: 2 })}
                        </div>
                        <div class="risk-split-box success">
                            <h4 style="display:flex; align-items:center; gap:8px; margin-bottom: 12px;">${Icons.check} Restrisiko nach Maßnahmen</h4>
                            ${RangeSlider({ id: 's-nach', label: 'Schwere (S)', min: 1, max: 3, value: 1 })}
                            ${RangeSlider({ id: 'w-nach', label: 'Wahrscheinlichkeit (W)', min: 1, max: 3, value: 1 })}
                        </div>
                    </div>
                    <div class="dual-matrix-container">
                        ${RiskMatrixColumn({ title: 'Vorher', type: 'vor' })}
                        <div style="display:flex; align-items:center; color: #cbd5e1;">${Icons.arrowRight}</div>
                        ${RiskMatrixColumn({ title: 'Nachher', type: 'nach' })}
                    </div>
                </div>
            </div>

            <!-- SCHRITT 3: Maßnahmen & Fristen -->
            <div class="wizard-step" id="step-3">
                ${ContextBanner({
                  text: 'Aktueller Gefährdungsfaktor: <span id="step3-current-gefaehrdung" style="font-weight: 800;">-</span>',
                  id: 'step3-context-banner'
                })}
                <div class="form-group">
                    <label>Persönliche Schutzausrüstung (PSA-Auswahl)</label>
                    <button type="button" class="btn btn-secondary" id="btn-open-psa" style="width: 100%; justify-content: space-between; background: #fff; border: 1px solid #cbd5e1; font-weight: 600;">
                        <span style="display:flex; align-items:center; gap:8px;">${Icons.shield} PSA-Assistent öffnen</span>
                        <span id="psa-badge-count" style="background: var(--primary); color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">0 gewählt</span>
                    </button>
                    <div id="step3-psa-preview" class="selected-psa-preview-box"></div>
                    <div style="margin-top: 12px;">
                      ${Switch({
                        id: 'psa-still-required',
                        label: 'PSA ist nach getroffenen (T/O-)Maßnahmen weiterhin erforderlich',
                        checked: true
                      })}
                    </div>
                </div>
                <div class="form-group" style="margin-top: 20px;">
                    <span style="display: block; font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 12px;">Schutzmaßnahmen nach STOP-Prinzip</span>
                    <p style="font-size: 12px; color: var(--text-muted); margin: -6px 0 12px;">Verantwortliche(r) und Frist werden direkt je Maßnahme erfasst.</p>
                    <div class="stop-input-container">
                        ${StopInputGroup({ letter: 'S', label: 'Substitution', placeholder: 'Substitution (Gefahr beseitigen)' })}
                        ${StopInputGroup({ letter: 'T', label: 'Technisch', placeholder: 'Technische Maßnahmen' })}
                        ${StopInputGroup({ letter: 'O', label: 'Organisatorisch', placeholder: 'Organisatorische Maßnahmen' })}
                        ${StopInputGroup({ letter: 'P', label: 'Persönlich', placeholder: 'Persönliche Schutzmaßnahmen' })}
                    </div>
                </div>
            </div>
        </div>

        <div class="wizard-footer">
            <button type="button" id="btn-prev" class="btn btn-secondary hidden">Zurück</button>
            <div style="flex-grow: 1;"></div>
            <button type="button" id="btn-next" class="btn btn-primary">Weiter</button>
            <button type="submit" id="btn-submit" class="btn btn-primary hidden" style="background-color: #10b981;">Speichern</button>
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
    <div id="psa-modal" class="modal-overlay hidden">
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
            <button id="back-settings-btn" class="btn-icon-back mobile-only" aria-label="Zurück">
              ${Icons.arrowLeft}
            </button>
            <div class="icon-circle desktop-only">${Icons.settings}</div>
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
              </div>
            </section>

            <section id="settings-data" class="settings-panel">
              <div class="panel-section">
                <h3 class="section-title">Datenverwaltung</h3>
                <p class="section-desc">Sichern Sie Ihre lokalen Daten oder stellen Sie diese wieder her.</p>

                <div class="data-action-cards">
                  ${ActionCard({
                    title: 'Exportieren',
                    desc: 'Alle Daten als JSON-Datei sichern.',
                    icon: 'download',
                    actionText: 'Backup erstellen',
                    actionId: 'btn-export-db'
                  })}
                  ${ActionCard({
                    title: 'Importieren',
                    desc: 'Daten aus einer Sicherung einlesen.',
                    icon: 'upload',
                    actionText: 'Datei wählen',
                    actionId: 'btn-import-trigger'
                  })}
                  <input type="file" id="db-import-file" class="hidden" accept=".json">
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

function renderBetriebFormModal() {
  return `
    <div id="betrieb-modal" class="modal-overlay hidden">
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
