/**
 * RiskFlow – Main Entry Point
 * Progressive Web App für Gefährdungsbeurteilungen
 */

import { initializeApp } from './modules/app.js';
import { initializeStorage } from './modules/storage.js';
import { initializeLogic } from './modules/logic.js';
import { registerServiceWorker } from './modules/service-worker.js';
import { initSettings } from './modules/settings.js';

async function bootstrapApp() {
  try {
    console.log('🚀 RiskFlow wird initialisiert...');
    
    // 1. IndexedDB initialisieren
    await initializeStorage();
    console.log('✅ Storage initialisiert');
    
    // 2. Service Worker für Offline-Fähigkeit registrieren
    await registerServiceWorker();
    console.log('✅ Service Worker registriert');
    
    // 3. UI-Layout und Routing aufbauen
    await initializeApp();
    console.log('✅ App-Layout geladen');

    // 4. Geschäftslogik und Event-Listener verknüpfen
    await initializeLogic();
    console.log('✅ RiskFlow erfolgreich gestartet');
    
    // 5. Einstellungsmenü initialisieren
    initSettings();
    console.log('✅ Settings-Modul geladen');
    
  } catch (error) {
    console.error('❌ Fehler beim Starten von RiskFlow:', error);
    // Hier ist es sicherer, document.body zu nutzen, falls 'app' nicht existiert
    const appContainer = document.getElementById('app') || document.body;
    appContainer.innerHTML = `
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
