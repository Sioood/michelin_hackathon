// https://nuxt.com/docs/api/configuration/nuxt-config
import { createResolver } from '@nuxt/kit'
import { templateCompilerOptions } from '@tresjs/core'
const { resolve } = createResolver(import.meta.url)

const isDockerDev = process.env.DOCKER === '1'

export default defineNuxtConfig({
  app: {
    head: {
      link: [{ href: '/manifest.webmanifest', rel: 'manifest' }],
    },
  },
  compatibilityDate: '2025-07-15',
  css: [resolve('./app/assets/css/main.css')],
  devtools: { enabled: true },
  extends: [resolve('../../packages/ui')],
  i18n: {
    defaultLocale: 'fr-FR',
    locales: [
      { code: 'fr-FR', file: 'fr-FR/index.ts', language: 'fr-FR', name: 'Français' },
      { code: 'en-US', file: 'en-US/index.ts', language: 'en-US', name: 'English' },
    ],
  },
  pwa: {
    manifest: {
      background_color: '#ffffff',
      description: 'MichelinHackaton web application',
      display: 'standalone',
      icons: [
        {
          purpose: 'any',
          sizes: 'any',
          src: '/pwa-icon.svg',
          type: 'image/svg+xml',
        },
      ],
      lang: 'fr',
      name: 'MichelinHackaton',
      short_name: 'MichelinHackaton',
      shortcuts: [
        {
          description: 'Suivre les rappels de remplacement pneus',
          name: 'Garage',
          short_name: 'Garage',
          url: '/garage',
        },
      ],
      start_url: '/',
      theme_color: '#111827',
    },
    workbox: {
      runtimeCaching: [
        {
          handler: 'NetworkFirst',
          options: {
            cacheName: 'garage-reminders',
            expiration: {
              maxAgeSeconds: 60 * 30,
              maxEntries: 30,
            },
          },
          urlPattern: /^http:\/\/localhost:3001\/garage\/.*/,
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:3001',
      siteUrl: 'https://web.com',
    },
  },
  security: {
    headers: {
      contentSecurityPolicy: {
        'connect-src': ["'self'", 'http://localhost:3001', 'https:'],
        'script-src': ["'self'", "'strict-dynamic'", "'nonce-{{nonce}}'", "'wasm-unsafe-eval'"],
        'worker-src': ["'self'", 'blob:'],
      },
      permissionsPolicy: {
        notifications: ['self'],
      },
    },
  },
  vite: isDockerDev
    ? {
        server: {
          hmr: { clientPort: 3000 },
          watch: { usePolling: true },
        },
      }
    : undefined,
  vue: {
    compilerOptions: templateCompilerOptions.template.compilerOptions,
  },
})
