import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    // Aktiviert lokales HTTPS im Dev-Server (essenziell, da Service Worker HTTPS erzwingen)
    basicSsl(),
    
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto', // Übernimmt automatisch die Registrierung im DOM
      
      manifest: {
        // Die ID ist ein neuerer Standard, um die PWA eindeutig zu identifizieren
        id: 'de.riskflow.app', 
        name: 'RiskFlow – Gefährdungsbeurteilungen',
        short_name: 'RiskFlow',
        description: 'Progressive Web App für Gefährdungsbeurteilungen, Risikobewertung und Arbeitsschutzmanagement',
        
        // Sprache und Leserichtung (wichtig für Accessibility und Screenreader)
        lang: 'de',
        dir: 'ltr',
        
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        
        // Farben exakt abgestimmt auf deine style.css Variablen
        theme_color: '#0284c7', // Entspricht --color-primary
        background_color: '#f8fafc', // Entspricht --color-surface (verhindert den "weißen Blitz" beim App-Start)
        
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable' // Kritisch für Android, damit das Icon rund/eckig beschnitten werden kann
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        
        screenshots: [
          {
            src: '/screenshots/screenshot-540x720.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow' // Signalisiert dem App Store/Browser, dass dies ein Mobile-Screenshot ist
          },
          {
            src: '/screenshots/screenshot-1280x720.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          }
        ],
        
        categories: ['productivity', 'business', 'utilities'],
        shortcuts: [
          {
            name: 'Neue Gefährdungsbeurteilung',
            short_name: 'Neue Beurteilung',
            description: 'Starten Sie eine neue Gefährdungsbeurteilung',
            url: '/?action=new-assessment', // Wird nun perfekt vom Router in app.js abgefangen
            icons: [{ src: '/icons/new-assessment-192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Meine Beurteilungen',
            short_name: 'Übersicht',
            description: 'Alle Ihre Gefährdungsbeurteilungen anzeigen',
            url: '/?action=view-assessments',
            icons: [{ src: '/icons/view-assessments-192.png', sizes: '192x192', type: 'image/png' }]
          }
        ]
      },
      
      workbox: {
        // Lädt statische Assets beim Installieren der PWA in den Cache
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff2}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true, // Zwingt den neuen Service Worker, sofort aktiv zu werden
        clientsClaim: true,
        
        runtimeCaching: [
          // 1. Zukünftige Backend/API-Aufrufe (für Datensynchronisation)
          {
            urlPattern: /^https:\/\/api\.dein-backend\.de\/.*/i, // TODO: Anpassen, sobald ein Backend existiert
            handler: 'NetworkFirst', // Versucht zuerst das Netz, nimmt bei Offline-Status den Cache
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100, // Speichert die letzten 100 API-Antworten
                maxAgeSeconds: 60 * 60 * 24 * 14 // Hält die Daten für 14 Tage im Cache
              },
              cacheableResponse: {
                statuses: [0, 200] // Speichert nur erfolgreiche Requests (0 ist für opake Responses)
              }
            }
          },
          // 2. Externe Assets (falls du z.B. später externe Schriften einbindest)
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst', // Schriften ändern sich selten, daher extrem schnelles Laden aus dem Cache
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 Jahr im Cache behalten
              }
            }
          }
        ],
        
        // Single Page App Support (SPA)
        navigateFallback: '/index.html',
        // Verhindert, dass echte Backend-API-Fehler durch die index.html maskiert werden
        navigateFallbackDenylist: [/^\/api\//] 
      },
      
      // Hält den Service Worker auch im lokalen Test-Modus aktiv
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module'
      }
    })
  ],
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        // Chunking-Strategie: Trennt Vendor-Bibliotheken (idb) von deinem eigenen App-Code.
        // Das sorgt dafür, dass Browser 'idb' nicht neu laden müssen, wenn du nur was an app.js änderst.
        manualChunks: {
          vendor: ['idb']
          // Wenn später z.B. eine PDF-Export-Library (wie jspdf) dazukommt, diese hier eintragen.
        }
      }
    }
  },
  
  server: {
    port: 5173,
    https: true,
    strictPort: false,
    open: true
  }
})
