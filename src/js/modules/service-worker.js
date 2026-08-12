/**
 * RiskFlow Service Worker Registration & Management
 * Offline-Funktionalität und Auto-Updates
 */

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker wird nicht unterstützt');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          console.log('✅ RiskFlow wurde aktualisiert');
          notifyUpdate();
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('RiskFlow Service Worker Registrierung fehlgeschlagen:', error);
  }
}

function notifyUpdate() {
  if (Notification.permission === 'granted') {
    new Notification('RiskFlow aktualisiert', {
      body: 'Eine neue Version ist verfügbar.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png'
    });
  }
}

export async function skipWaiting() {
  const registration = await navigator.serviceWorker.ready;
  const worker = registration.waiting;
  if (worker) {
    worker.postMessage({ type: 'SKIP_WAITING' });
  }
}