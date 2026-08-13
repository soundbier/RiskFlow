/**
 * Modul zur Verwaltung des Einstellungsmenüs
 */

export function initSettings() {
  // DOM Elemente referenzieren
  const modal = document.getElementById('settings-modal');
  const openBtn = document.getElementById('open-settings-btn');
  const closeBtn = document.getElementById('close-settings-btn');
  const cancelBtn = document.getElementById('cancel-settings-btn');
  const saveBtn = document.getElementById('save-settings-btn');
  
  const tabs = document.querySelectorAll('.settings-tab');
  const panels = document.querySelectorAll('.settings-panel');

  // Sicherheitscheck: Abbrechen, falls das Modal im DOM fehlt
  if (!modal) {
    console.error('Settings-Modal im DOM nicht gefunden.');
    return;
  }

  // --- Modal öffnen ---
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      // Später: Hier aktuelle Werte aus storage.js laden, bevor das Modal angezeigt wird
      modal.showModal(); 
      document.body.style.overflow = 'hidden'; // Hintergrund-Scrollen verhindern
    });
  }

  // --- Modal schließen ---
  const closeModal = () => {
    modal.close();
    document.body.style.overflow = ''; // Scrollen wieder aktivieren
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Klick auf den Hintergrund (Backdrop) schließt das Modal ebenfalls
  modal.addEventListener('click', (event) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
                        rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
    if (!isInDialog) {
      closeModal();
    }
  });

  // --- Einstellungen Speichern ---
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      // Später: Werte aus den Inputs auslesen und über storage.js speichern
      console.log('Einstellungen werden gespeichert...');
      
      // Visuelles Feedback (optional später durch ein Toast-Modul ersetzen)
      saveBtn.textContent = 'Gespeichert!';
      setTimeout(() => {
        saveBtn.textContent = 'Speichern';
        closeModal();
      }, 800);
    });
  }

  // --- Tab Navigation Logik ---
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      // 1. Allen Tabs die 'active' Klasse entziehen
      tabs.forEach(t => t.classList.remove('active'));
      
      // 2. Alle Panels verstecken (Klasse 'hidden' hinzufügen)
      panels.forEach(p => {
        p.classList.add('hidden');
        p.classList.remove('active');
      });

      // 3. Dem geklickten Tab die 'active' Klasse geben
      const clickedTab = e.currentTarget;
      clickedTab.classList.add('active');

      // 4. Zugehöriges Panel einblenden
      const targetId = clickedTab.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      
      if (targetPanel) {
        targetPanel.classList.remove('hidden');
        targetPanel.classList.add('active');
      }
    });
  });
}
