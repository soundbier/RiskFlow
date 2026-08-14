/**
 * RiskFlow UI Components
 * Wiederverwendbare UI-Elemente für ein konsistentes Design
 */

import { Icons } from './icons.js';

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
export function Badge({ text, variant = 'primary', id = '' }) {
  return `<span id="${id}" class="badge badge-${variant}">${text}</span>`;
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
          <h3 class="card-title">${betrieb.name}</h3>
          <span class="card-subtitle">${betrieb.ort || 'Kein Standort hinterlegt'}</span>
        </div>
        <div class="card-actions">
           ${IconButton({ icon: 'edit', id: `edit-${betrieb.id}`, className: 'btn-edit-betrieb', ariaLabel: 'Bearbeiten' })}
        </div>
      </div>
      <div class="card-body">
        <div class="card-info-row">
          <span class="info-label">${Icons.user} Prüfer:</span>
          <span class="info-value">${betrieb.auditor || 'Nicht zugewiesen'}</span>
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
