import type { Page, Route } from '@playwright/test'

const apiBaseUrl = 'http://localhost:3001'

const emptyCart = {
  currency: 'EUR' as const,
  guestId: 'guest-test',
  id: 1,
  items: [] as Array<{
    id: number
    productId: number
    quantity: number
    subtotalCents: number
  }>,
  totalCents: 0,
  userId: null as number | null,
}

export async function mockApi(page: Page, options: { products?: unknown[] } = {}) {
  const products = options.products ?? []

  await page.route(`${apiBaseUrl}/**`, async (route: Route) => {
    const request = route.request()
    const url = new URL(request.url())

    if (url.pathname === '/products') {
      await route.fulfill({ json: products })
      return
    }

    if (url.pathname === '/cart' && request.method() === 'GET') {
      await route.fulfill({ json: emptyCart })
      return
    }

    await route.fulfill({ json: {} })
  })
}
