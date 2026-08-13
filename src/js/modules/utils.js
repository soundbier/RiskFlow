/**
 * RiskFlow – Allgemeine Hilfsfunktionen
 */

/**
 * Escaped einen Wert für die sichere Verwendung in innerHTML
 * (sowohl als Text-Inhalt als auch innerhalb von HTML-Attributen wie value="...").
 * Verhindert HTML-/Script-Injection durch Nutzereingaben (z.B. Anführungszeichen
 * in STOP-Maßnahmen, Betriebsnamen, Tätigkeiten etc.).
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
