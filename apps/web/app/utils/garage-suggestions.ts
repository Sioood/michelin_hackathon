import type { BikeType } from '~/types/garage'
import type { Product, ProductCategory } from '~/types/product'

export function categoryForBikeType(type: BikeType | undefined): ProductCategory | undefined {
  switch (type) {
    case 'city':
      return 'commuting-tour'
    case 'e-bike':
      return 'e-bike'
    case 'gravel':
      return 'gravel'
    case 'mtb':
      return 'mtb'
    case 'road':
      return 'road'
    case undefined:
      return undefined
  }
}

export function normalizeDiameter(diameter: string | null | undefined): string[] {
  if (diameter === undefined || diameter === null || diameter.trim().length === 0) {
    return []
  }

  const raw = diameter.trim().toLowerCase()
  const variants = new Set<string>([diameter.trim()])

  if (raw.includes('700') || raw === '622' || raw.includes('28c')) {
    variants.add('700')
    variants.add('700C')
    variants.add('622')
  }

  if (raw.includes('650') || raw.includes('27.5') || raw.includes('27,5')) {
    variants.add('27.5')
    variants.add('650')
    variants.add('650B')
    variants.add('650b')
  }

  if (raw.includes('29')) {
    variants.add('29')
  }

  if (raw === '28' || raw === '28"') {
    variants.add('28')
  }

  if (raw.includes('26')) {
    variants.add('26')
  }

  return [...variants]
}

function matchesDiameter(product: Product, diameterVariants: string[]): boolean {
  if (diameterVariants.length === 0) {
    return true
  }

  const fields = [product.webDiameterMm, product.webDiameterInch, product.diameterEtrto].filter(
    (value): value is string => value !== null && value.length > 0,
  )

  return diameterVariants.some((variant) =>
    fields.some((field) => field.toLowerCase().includes(variant.toLowerCase())),
  )
}

export function pickGarageSuggestions(
  products: Product[],
  diameter: string | null | undefined,
  limit = 8,
): Product[] {
  const diameterVariants = normalizeDiameter(diameter)
  const inStock = products.filter((product) => product.stock > 0)
  const matched = inStock.filter((product) => matchesDiameter(product, diameterVariants))

  return (matched.length > 0 ? matched : inStock).slice(0, limit)
}
