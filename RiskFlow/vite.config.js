import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      
      manifest: {
        name: 'RiskFlow – Gefährdungsbeurteilungen',
        short_name: 'RiskFlow',
        description: 'Progressive Web App für Gefährdungsbeurteilungen, Risikobewertung und Arbeitsschutzmanagement',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#0284c7',
        background_color: '#ffffff',
        orientation: 'portrait-primary',
        
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
            purpose: 'maskable'
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
            form_factor: 'narrow'
          },
          {
            src: '/screenshots/screenshot-1280x720.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          }
        ],
        
        categories: ['productivity', 'utilities'],
        shortcuts: [
          {
            name: 'Neue Gefährdungsbeurteilung',
            short_name: 'Neue Beurteilung',
            description: 'Starten Sie eine neue Gefährdungsbeurteilung',
            url: '/?action=new-assessment',
            icons: [
              {
                src: '/icons/new-assessment-192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          },
          {
            name: 'Meine Beurteilungen',
            short_name: 'Übersicht',
            description: 'Alle Ihre Gefährdungsbeurteilungen anzeigen',
            url: '/?action=view-assessments',
            icons: [
              {
                src: '/icons/view-assessments-192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          }
        ]
      },
      
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400
              }
            }
          }
        ],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module'
      },
      
      minify: 'terser',
      injectRegister: 'auto'
    })
  ],
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['idb']
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