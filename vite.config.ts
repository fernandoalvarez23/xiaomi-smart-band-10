import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/xiaomi-smart-band-10/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['band-icon.svg'],
      manifest: {
        name: 'Xiaomi Smart Band 10 Dashboard',
        short_name: 'Band 10',
        description: 'Web dashboard for Xiaomi Smart Band 10 via Bluetooth',
        theme_color: '#ff6900',
        background_color: '#0f0f0f',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'band-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'band-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
