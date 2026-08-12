import { registerSW } from 'virtual:pwa-register';

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const updateSW = registerSW({
        onNeedRefresh() {
          console.log('✅ RiskFlow wurde aktualisiert');
          notifyUpdate();
        },
        onOfflineReady() {
          console.log('App ist offline-ready');
        },
      });
    } catch (error) {
      console.error('RiskFlow Service Worker Registrierung fehlgeschlagen:', error);
    }
  } else {
    console.warn('Service Worker wird nicht unterstützt');
  }
}

function notifyUpdate() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('RiskFlow aktualisiert', {
      body: 'Eine neue Version ist verfügbar. Bitte lade die Seite neu.',
      icon: '/icons/icon-192.png'
    });
  }
}
