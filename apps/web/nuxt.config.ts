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
      link: [
        { href: '/favicon.ico', rel: 'icon', sizes: '32x32' },
        { href: '/favicon.png', rel: 'icon', sizes: '32x32', type: 'image/png' },
        { href: '/pwa-icon.webp', rel: 'icon', type: 'image/webp' },
        { href: '/apple-touch-icon.png', rel: 'apple-touch-icon', sizes: '180x180' },
        { href: '/manifest.webmanifest', rel: 'manifest' },
      ],
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
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
    },
    includeAssets: ['favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'pwa-icon.webp'],
    manifest: {
      background_color: '#ffffff',
      description: 'Michelin Bicycle — bike tyre catalogue and tools',
      display: 'standalone',
      icons: [
        {
          purpose: 'any',
          sizes: '192x192',
          src: '/pwa-icon.webp',
          type: 'image/webp',
        },
        {
          purpose: 'any',
          sizes: '512x512',
          src: '/pwa-icon.webp',
          type: 'image/webp',
        },
        {
          purpose: 'maskable',
          sizes: '512x512',
          src: '/pwa-icon.webp',
          type: 'image/webp',
        },
      ],
      lang: 'fr',
      name: 'Michelin Bicycle',
      short_name: 'Michelin Bicycle',
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
  site: {
    description: 'Michelin Bicycle — bike tyre catalogue and tools',
    name: 'Michelin Bicycle',
    url: 'https://michelin-front.theodupont.fr',
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
