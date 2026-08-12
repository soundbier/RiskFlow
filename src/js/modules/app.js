/**
 * RiskFlow – Haupt-App Modul
 * Initialisiert die Benutzeroberfläche
 */

export async function initializeApp() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="app-container">
      <header class="app-header">
        <div class="app-header-content">
          <h1>RiskFlow</h1>
          <p>Gefährdungsbeurteilungen & Risikobewertung</p>
        </div>
      </header>
      
      <main class="app-main">
        <section class="action-panel">
          <button class="btn btn-primary" id="btn-new-assessment">
            <span class="btn-icon">➕</span>
            Neue Beurteilung
          </button>
          <button class="btn btn-secondary" id="btn-view-assessments">
            <span class="btn-icon">📋</span>
            Meine Beurteilungen
          </button>
        </section>
        
        <section class="content" id="content">
          <div class="welcome-section">
            <h2>Willkommen bei RiskFlow</h2>
            <p>Verwalten Sie Ihre Gefährdungsbeurteilungen effizient und offline.</p>
          </div>
        </section>
      </main>
      
      <footer class="app-footer">
        <p>RiskFlow v1.0 • Offline-fähig • Arbeitsschutz</p>
      </footer>
    </div>
  `;
  
  document.getElementById('btn-new-assessment').addEventListener('click', () => {
    console.log('Neue Gefährdungsbeurteilung in RiskFlow erstellen');
    // TODO: Navigation zu Beurteilungsformular
  });
  
  document.getElementById('btn-view-assessments').addEventListener('click', () => {
    console.log('Beurteilungen anzeigen');
    // TODO: Navigation zu Beurteilungsliste
  });
  
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}