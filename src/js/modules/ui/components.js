/**
 * RiskFlow UI Components
 * Wiederverwendbare UI-Elemente für ein konsistentes Design
 */

import { Icons } from './icons.js';
import { escapeHtml } from '../utils.js';

/**
 * Erstellt einen Button
 */
export function Button({ text, icon, variant = 'primary', className = '', id = '', attr = '' }) {
  const iconHtml = icon && Icons[icon] ? Icons[icon] : '';
  return `
    <button id="${id}" class="btn btn-${variant} ${className}" ${attr}>
      ${iconHtml} ${text}
    </button>
  `;
}

/**
 * Erstellt einen Icon-Button (ohne Text)
 */
export function IconButton({ icon, variant = 'icon', className = '', id = '', ariaLabel = '', attr = '' }) {
  const iconHtml = Icons[icon] || '';
  return `
    <button id="${id}" class="btn-${variant} ${className}" aria-label="${ariaLabel}" title="${ariaLabel}" ${attr}>
      ${iconHtml}
    </button>
  `;
}

/**
 * Erstellt ein Badge (Zähler oder Status)
 */
export function Badge({ text, variant = 'primary', id = '', className = '' }) {
  return `<span id="${id}" class="badge badge-${variant} ${className}">${text}</span>`;
}

/**
 * Erstellt eine Card für die Betriebsübersicht
 */
export function BetriebCard(betrieb) {
  return `
    <div class="card betrieb-card" data-id="${betrieb.id}">
      <div class="card-header">
        <div class="card-icon">${Icons.building}</div>
        <div class="card-title-group">
          <h3 class="card-title">${escapeHtml(betrieb.name)}</h3>
          <span class="card-subtitle">${escapeHtml(betrieb.ort) || 'Kein Standort hinterlegt'}</span>
        </div>
        <div class="card-actions">
           ${IconButton({ icon: 'edit', id: `edit-${betrieb.id}`, className: 'btn-edit-betrieb', ariaLabel: 'Bearbeiten' })}
           ${IconButton({ icon: 'x', id: `delete-${betrieb.id}`, className: 'btn-delete-betrieb', ariaLabel: 'Löschen' })}
        </div>
      </div>
      <div class="card-body">
        <div class="card-info-row">
          <span class="info-label">${Icons.user} Prüfer:</span>
          <span class="info-value">${escapeHtml(betrieb.auditor) || 'Nicht zugewiesen'}</span>
        </div>
        <div class="card-info-row">
          <span class="info-label">${Icons.clipboard} Beurteilungen:</span>
          <span class="info-value">${betrieb.count || 0} Einträge</span>
        </div>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary btn-block btn-open-betrieb" data-id="${betrieb.id}">
          Öffnen ${Icons.arrowRight}
        </button>
      </div>
    </div>
  `;
}

/**
 * Erstellt einen Empty-State (Platzhalter wenn keine Daten da sind)
 */
export function EmptyState({ title, message, icon = 'folder', actionText, actionId }) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${Icons[icon]}</div>
      <h3 class="empty-state-title">${title}</h3>
      <p class="empty-state-message">${message}</p>
      ${actionText ? Button({ text: actionText, id: actionId, icon: 'plus', variant: 'primary' }) : ''}
    </div>
  `;
}

/**
 * Wizard Header mit Schritten
 */
export function WizardHeader(steps) {
  return `
    <div class="wizard-header">
      ${steps.map((step, index) => `
        <div class="step-indicator ${index === 0 ? 'active current' : ''}" id="ind-${index + 1}">
          <span>${index + 1}</span> ${step}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Risikomatrix (Einzelspalte Vorher/Nachher)
 */
export function RiskMatrixColumn({ title, type }) {
  return `
    <div class="matrix-col">
      <div class="matrix-title">${title}</div>
      <div class="matrix-grid">
        <div class="matrix-cell c-yellow" id="${type}-3-1">Mittel</div>
        <div class="matrix-cell c-red" id="${type}-3-2">Hoch</div>
        <div class="matrix-cell c-red" id="${type}-3-3">Hoch</div>
        <div class="matrix-cell c-green" id="${type}-2-1">Gering</div>
        <div class="matrix-cell c-yellow" id="${type}-2-2">Mittel</div>
        <div class="matrix-cell c-red" id="${type}-2-3">Hoch</div>
        <div class="matrix-cell c-green" id="${type}-1-1">Gering</div>
        <div class="matrix-cell c-green" id="${type}-1-2">Gering</div>
        <div class="matrix-cell c-yellow" id="${type}-1-3">Mittel</div>
      </div>
    </div>
  `;
}

/**
 * STOP-Maßnahmen Eingabeblock
 */
export function StopInputGroup({ letter, label, placeholder }) {
  return `
    <div class="stop-row">
      <div class="stop-indicator ${letter.toLowerCase()}">${letter}</div>
      <div class="stop-field-wrapper">
        <div id="multi-${letter.toLowerCase()}"></div>
        <button type="button" class="btn-add-small" data-stop="${letter.toLowerCase()}" data-placeholder="${escapeHtml(placeholder)}">
          ${Icons.plus} Maßnahme ergänzen
        </button>
      </div>
    </div>
  `;
}

/**
 * Einzelne STOP-Eingabezeile
 */
export function StopInputRow({ letter, index, placeholder, value = '' }) {
  return `
    <div class="input-row">
        <span class="row-num">${index}.</span>
        <input type="text" class="stop-val" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value)}">
        <button type="button" class="btn-remove" data-letter="${letter}">${Icons.x}</button>
    </div>
  `;
}

/**
 * Banner für Kontext-Infos (z.B. Edit-Mode oder Gefährdung)
 */
export function ContextBanner({ text, icon = 'info', className = '', id = '' }) {
  return `
    <div id="${id}" class="context-banner ${className}">
      ${Icons[icon] || ''}
      <span>${text}</span>
    </div>
  `;
}

/**
 * Action Card für Daten-Aktionen
 */
export function ActionCard({ title, desc, icon, actionText, actionId }) {
  return `
    <div class="action-card">
      <div class="card-icon">${Icons[icon] || ''}</div>
      <div class="card-text">
        <h4>${title}</h4>
        <p>${desc}</p>
      </div>
      <button id="${actionId}" class="btn btn-outline btn-sm">${actionText}</button>
    </div>
  `;
}
