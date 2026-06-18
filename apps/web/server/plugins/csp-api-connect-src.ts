function resolveApiOrigin(url: string): string | null {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    const apiOrigin = resolveApiOrigin(String(useRuntimeConfig(event).public.apiBaseUrl ?? ''))
    if (apiOrigin === null) {
      return
    }

    const header = getResponseHeader(event, 'Content-Security-Policy')
    if (typeof header !== 'string' || header.includes(apiOrigin)) {
      return
    }

    const connectSrcMatch = /connect-src ([^;]+)/.exec(header)
    if (connectSrcMatch === null) {
      return
    }

    setResponseHeader(
      event,
      'Content-Security-Policy',
      header.replace(connectSrcMatch[0], `connect-src ${connectSrcMatch[1]} ${apiOrigin}`),
    )
  })
})
