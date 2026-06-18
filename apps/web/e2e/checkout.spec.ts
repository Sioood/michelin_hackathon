import { expect, test } from '@playwright/test'

const product = {
  bead: 'Folding Bead',
  brand: 'Michelin',
  cai: '123456',
  casingTechnologies: ['3x120 TPI'],
  category: 'road',
  createdAt: '2026-06-17T00:00:00.000Z',
  currency: 'EUR',
  cycleType: 'Road',
  cycleTypeWeb: 'Road',
  description: 'Pneu route rapide pour entrainement et competition.',
  diameterEtrto: '622',
  discontinuedDate: null,
  eBikeReady: false,
  eBikeTechnologies: [],
  eanCode: '3528701234567',
  fitting: 'Tubeless Ready',
  globalId: 'global-1',
  headline: 'Vitesse et grip',
  id: 1,
  imageKey: 'power-cup',
  internalDesignation: null,
  internalRange: null,
  labelType: 'MICHELIN',
  marketPerimeter: 'EU',
  maxPressureBar: 6,
  maxPressurePsi: 87,
  minPressureBar: 4,
  minPressurePsi: 58,
  mspnCode: null,
  priceCents: 5990,
  proStats: {
    highlight: 'Valide par les equipes pros.',
    podiums: 18,
    proTeams: ['Michelin Racing'],
    victories: 7,
  },
  productType: 'Tyre',
  rangeName: 'Power Cup',
  recommendedInnerTube: null,
  reflectiveStrip: false,
  reinforcementTechnologies: [],
  rimType: 'Tubeless Ready',
  rubberTechnologies: ['Gum-X'],
  segment: 'Competition',
  sidewallColor: 'Black',
  sidewallType: 'Classic',
  slug: 'power-cup',
  stock: 12,
  technologies: ['Gum-X', 'Tubeless Shield'],
  terrainTypes: ['ROAD'],
  tpi: '120',
  treadPatternColor: 'Black',
  treadPatternTechnologies: [],
  tubelessReady: true,
  upcCode: null,
  updatedAt: '2026-06-17T00:00:00.000Z',
  useCases: ['Competition'],
  webDiameterInch: '700',
  webDiameterMm: '700',
  webWidthInch: '25',
  webWidthMm: '25',
  weightG: 260,
  widthEtrto: '25',
}

test('login, add tyre to cart, and start checkout', async ({ page }) => {
  const cart = {
    currency: 'EUR',
    guestId: 'guest-test',
    id: 1,
    items: [] as Array<{
      id: number
      product: typeof product
      productId: number
      quantity: number
      subtotalCents: number
    }>,
    totalCents: 0,
    userId: 1,
  }

  await page.route('http://localhost:3001/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())

    if (url.pathname === '/products') {
      await route.fulfill({ json: [product] })
      return
    }

    if (url.pathname === '/auth/login') {
      await route.fulfill({
        json: {
          accessToken: 'test-token',
          user: {
            email: 'marie.dupont@example.com',
            firstName: 'Marie',
            id: 1,
            lastName: 'Dupont',
          },
        },
      })
      return
    }

    if (url.pathname === '/cart' && request.method() === 'GET') {
      await route.fulfill({ json: cart })
      return
    }

    if (url.pathname === '/cart/items' && request.method() === 'POST') {
      cart.items = [
        {
          id: 10,
          product,
          productId: product.id,
          quantity: 1,
          subtotalCents: product.priceCents,
        },
      ]
      cart.totalCents = product.priceCents
      await route.fulfill({ json: cart })
      return
    }

    if (url.pathname.endsWith('/cross-sell')) {
      await route.fulfill({ json: [] })
      return
    }

    if (url.pathname === '/checkout/session') {
      await route.fulfill({
        json: {
          orderId: 42,
          sessionId: 'demo_42',
          url: 'http://localhost:3000/checkout/success?orderId=42',
        },
      })
      return
    }

    await route.fulfill({ json: {} })
  })

  await page.goto('/login')
  await page.getByPlaceholder('marie.dupont@example.com').fill('marie.dupont@example.com')
  await page.getByPlaceholder('8 caractères minimum').fill('supersecret')
  await page.getByRole('button', { name: 'Se connecter' }).click()

  await expect(page).toHaveURL('/')
  const addToCartResponse = page.waitForResponse(
    (response) => response.url().includes('/cart/items') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Ajouter' }).first().click()
  await addToCartResponse
  await page.goto('/checkout')
  await expect(page.getByRole('heading', { name: 'Finaliser la commande' })).toBeVisible()
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByRole('button', { name: 'Continuer' }).click()
  await expect(page.getByLabel('Terminal Stripe de démonstration')).toContainText(
    '4242 4242 4242 4242',
  )
  await page.getByRole('button', { name: 'Payer avec Stripe' }).click()

  await expect(page).toHaveURL('/checkout/success?orderId=42')
  await expect(page.getByRole('heading', { name: /merci/i })).toBeVisible()
})
