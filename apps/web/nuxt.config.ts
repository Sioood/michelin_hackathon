// https://nuxt.com/docs/api/configuration/nuxt-config
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

const isDockerDev = process.env.DOCKER === '1'

function resolveApiOrigin(url: string): string | null {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

const apiOrigin =
  resolveApiOrigin(process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001') ??
  'http://localhost:3001'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  extends: [resolve('../../packages/ui')],

  app: {
    head: {
      link: [{ href: '/manifest.webmanifest', rel: 'manifest' }],
    },
  },
  css: [resolve('./app/assets/css/main.css')],
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
      start_url: '/',
      theme_color: '#111827',
    },
    workbox: {
      // SSR apps do not precache `/`; Workbox would throw non-precached-url otherwise.
      navigateFallback: null,
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
        'connect-src': ["'self'", apiOrigin],
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
})
