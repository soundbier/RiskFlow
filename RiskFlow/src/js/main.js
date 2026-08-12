/**
 * RiskFlow – Main Entry Point
 * Progressive Web App für Gefährdungsbeurteilungen
 */

import { initializeApp } from './modules/app.js';
import { initializeStorage } from './modules/storage.js';
import { registerServiceWorker } from './modules/service-worker.js';

async function bootstrapApp() {
  try {
    console.log('🚀 RiskFlow wird initialisiert...');
    
    await initializeStorage();
    console.log('✅ Storage initialisiert');
    
    await registerServiceWorker();
    console.log('✅ Service Worker registriert');
    
    await initializeApp();
    console.log('✅ RiskFlow lädt erfolgreich');
    
  } catch (error) {
    console.error('❌ Fehler beim Starten von RiskFlow:', error);
    document.getElementById('app').innerHTML = `
      <div class="error-container">
        <h1>Fehler beim Laden</h1>
        <p>${error.message}</p>
      </div>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}