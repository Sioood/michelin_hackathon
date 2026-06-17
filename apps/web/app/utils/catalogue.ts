export type ProductCategory =
  | 'commuting-tour'
  | 'e-bike'
  | 'gravel'
  | 'inner-tubes'
  | 'kids'
  | 'mtb'
  | 'road'

export interface Product {
  id?: number
  brand: string
  productType: string
  cycleTypeWeb: string
  category: ProductCategory
  segment: string | null
  rangeName: string
  slug: string
  cai: string
  eanCode: string | null
  designation: string
  webDiameterMm: string | null
  webDiameterInch: string | null
  webWidthMm: string | null
  webWidthInch: string | null
  rimType: string | null
  bead: string | null
  fitting: string | null
  tpi: string | null
  minPressureBar: number | null
  maxPressureBar: number | null
  minPressurePsi: number | null
  maxPressurePsi: number | null
  sidewallColor: string | null
  treadPatternColor: string | null
  labelType: string | null
  useCases: string[]
  terrainTypes: string[]
  technologies: string[]
  eBikeReady: boolean
  tubelessReady: boolean
  reflectiveStrip: boolean
  weightG: number | null
  headline: string
  description: string
  imageKey: string
}

export type CategoryFilter = ProductCategory | 'all'

/** Semantic badge/chip intents aligned with Michelin design tokens */
export type CategoryBadgeIntent =
  | 'accent'
  | 'info'
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'

export const categoryLabels: Record<CategoryFilter, string> = {
  all: 'Tous les pneus',
  'commuting-tour': 'Ville & trekking',
  'e-bike': 'E-bike',
  gravel: 'Gravel',
  'inner-tubes': 'Chambres à air',
  kids: 'Junior',
  mtb: 'VTT',
  road: 'Route',
}

export const categoryOrder: CategoryFilter[] = [
  'all',
  'road',
  'gravel',
  'mtb',
  'e-bike',
  'commuting-tour',
  'kids',
  'inner-tubes',
]

export const categoryIntents: Record<ProductCategory, CategoryBadgeIntent> = {
  'commuting-tour': 'info',
  'e-bike': 'success',
  gravel: 'warning',
  'inner-tubes': 'accent',
  kids: 'secondary',
  mtb: 'primary',
  road: 'primary',
}

export interface FeaturedRange {
  category: ProductCategory
  count: number
  headline: string
  rangeName: string
  sample: Product
  technologies: string[]
}

/** Card `elementIntent` only supports neutral | primary | secondary | accent */
export type CategoryCardIntent = 'accent' | 'neutral' | 'primary' | 'secondary'

const categoryCardIntents: Record<ProductCategory, CategoryCardIntent> = {
  'commuting-tour': 'primary',
  'e-bike': 'secondary',
  gravel: 'accent',
  'inner-tubes': 'accent',
  kids: 'secondary',
  mtb: 'primary',
  road: 'primary',
}

export function getCategoryIntent(category: CategoryFilter): CategoryBadgeIntent {
  return category === 'all' ? 'neutral' : categoryIntents[category]
}

export function getCategoryCardIntent(category: ProductCategory): CategoryCardIntent {
  return categoryCardIntents[category]
}
