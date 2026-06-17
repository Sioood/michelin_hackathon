import type { Product, ProductCategory } from '~/types/product'

export type { Product, ProductCategory } from '~/types/product'

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
