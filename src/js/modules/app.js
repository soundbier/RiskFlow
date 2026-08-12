/**
 * RiskFlow – Haupt-App Modul
 * Initialisiert die Benutzeroberfläche und das Routing
 */

// Einfacher State zur Verfolgung der aktuellen Ansicht
let currentView = 'dashboard';

export async function initializeApp() {
  // 1. Statisches App-Gerüst rendern
  renderLayout();

  // 2. Initiale Route anhand der URL ermitteln (wichtig für PWA-Shortcuts)
  handleRouting();

  // 3. Browser-Back-Button unterstützen
  window.addEventListener('popstate', handleRouting);
  
  // 4. Berechtigung für Notifications prüfen
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

/**
 * Baut das statische Grundgerüst (Header, Main-Container, Footer).
 * Wird nur einmal beim Start aufgerufen.
 */
function renderLayout() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="app-container">
      <header class="app-header">
        <div class="app-header-content">
          <!-- Klick auf den Titel führt zurück zur Startseite -->
          <h1 id="brand-title" tabindex="0" role="button">RiskFlow</h1>
          <p>Gefährdungsbeurteilungen & Risikobewertung</p>
        </div>
      </header>
      
      <!-- Hier werden die dynamischen Views ausgetauscht -->
      <main class="app-main" id="main-content"></main>
      
      <footer class="app-footer">
        <p>RiskFlow v1.0 • Offline-fähig • Arbeitsschutz</p>
      </footer>
    </div>
  `;

  // Navigation-Reset bei Klick auf das Logo
  const brandTitle = document.getElementById('brand-title');
  brandTitle.style.cursor = 'pointer';
  brandTitle.addEventListener('click', () => navigateTo('dashboard'));
}

/**
 * Liest die URL-Parameter aus (z.B. bei Start über Homescreen-Shortcut)
 */
function handleRouting() {
  const params = new URLSearchParams(window.location.search);
  const action = params.get('action');

  if (action === 'new-assessment') {
    navigateTo('new-assessment', false);
  } else if (action === 'view-assessments') {
    navigateTo('view-assessments', false);
  } else {
    navigateTo('dashboard', false);
  }
}

/**
 * Zentraler Router, der die Ansichten tauscht und die History aktualisiert
 */
function navigateTo(view, pushState = true) {
  currentView = view;
  
  if (pushState) {
    // URL updaten, ohne die Seite neu zu laden
    const url = view === 'dashboard' ? '/' : `/?action=${view}`;
    window.history.pushState({ view }, '', url);
  }

  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = ''; // Vorherigen Content sauber entfernen

  // Entsprechende View laden
  switch (view) {
    case 'new-assessment':
      renderNewAssessment(mainContent);
      break;
    case 'view-assessments':
      renderAssessmentList(mainContent);
      break;
    case 'dashboard':
    default:
      renderDashboard(mainContent);
      break;
  }
}

// ==========================================
// VIEWS
// ==========================================

/**
 * View: Dashboard / Startseite
 */
function renderDashboard(container) {
  // Für statische, sichere Layout-Elemente ist innerHTML weiterhin effizient
  const dashboardHTML = `
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
    
    <section class="content" id="welcome-content">
      <div class="welcome-section">
        <h2>Willkommen bei RiskFlow</h2>
        <p>Verwalten Sie Ihre Gefährdungsbeurteilungen effizient und offline.</p>
      </div>
    </section>
  `;
  
  container.insertAdjacentHTML('beforeend', dashboardHTML);

  // Event-Listener an die neuen Buttons hängen
  document.getElementById('btn-new-assessment').addEventListener('click', () => {
    navigateTo('new-assessment');
  });
  
  document.getElementById('btn-view-assessments').addEventListener('click', () => {
    navigateTo('view-assessments');
  });
}

/**
 * View: Neue Gefährdungsbeurteilung (Formular)
 */
function renderNewAssessment(container) {
  // Hier bauen wir das DOM elementweise auf (createElement) - 
  // das ist später bei Formulardaten essenziell für die Sicherheit!
  const formSection = document.createElement('section');
  formSection.className = 'content';
  
  const title = document.createElement('h2');
  title.textContent = 'Neue Gefährdungsbeurteilung';
  // Nutzt das funktionale Farb-Schema aus deiner style.css
  title.style.color = 'var(--color-primary)';
  title.style.marginBottom = 'var(--spacing-md)';
  
  const infoText = document.createElement('p');
  infoText.textContent = 'Das Formular wird geladen... (Hier entsteht später das Eingabeformular)';
  infoText.style.color = 'var(--color-text-light)';
  
  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-secondary';
  backBtn.style.marginTop = 'var(--spacing-lg)';
  backBtn.innerHTML = '<span class="btn-icon">⬅️</span> Zurück';
  backBtn.addEventListener('click', () => navigateTo('dashboard'));

  formSection.appendChild(title);
  formSection.appendChild(infoText);
  formSection.appendChild(backBtn);
  
  container.appendChild(formSection);
}

/**
 * View: Listenansicht der bisherigen Beurteilungen
 */
function renderAssessmentList(container) {
  const listSection = document.createElement('section');
  listSection.className = 'content';
  
  const title = document.createElement('h2');
  title.textContent = 'Meine Beurteilungen';
  title.style.color = 'var(--color-primary)';
  title.style.marginBottom = 'var(--spacing-md)';
  
  const listContainer = document.createElement('div');
  listContainer.textContent = 'Lade Daten aus IndexedDB... (wird über storage.js angebunden)';
  listContainer.style.color = 'var(--color-text-light)';
  
  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-secondary';
  backBtn.style.marginTop = 'var(--spacing-lg)';
  backBtn.innerHTML = '<span class="btn-icon">⬅️</span> Zurück';
  backBtn.addEventListener('click', () => navigateTo('dashboard'));

  listSection.appendChild(title);
  listSection.appendChild(listContainer);
  listSection.appendChild(backBtn);
  
  container.appendChild(listSection);
}
