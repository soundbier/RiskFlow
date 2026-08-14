/**
 * RiskWerk – Allgemeine Hilfsfunktionen
 */

/**
 * Escaped einen Wert für die sichere Verwendung in innerHTML
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Steuert die Sichtbarkeit eines Elements über die .hidden Klasse
 */
export function setVisible(elementOrId, isVisible) {
  const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!el) return;

  if (isVisible) {
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}
