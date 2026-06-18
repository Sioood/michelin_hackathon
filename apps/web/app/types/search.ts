import type { Product, ProductCategory } from './product'

export type SearchTerrain = 'CITY' | 'GRAVEL' | 'MIXED' | 'MTB' | 'ROAD'

interface SearchFilters {
  category?: ProductCategory
  diameter?: string
  eBikeReady?: boolean
  search?: string
  terrain?: SearchTerrain
  tubelessReady?: boolean
}

interface SearchResult {
  matchReasons: string[]
  product: Product
  score: number
}

export interface AiSearchResponse {
  explanation: string
  filters: SearchFilters
  results: SearchResult[]
  suggestedSlugs: string[]
}

export interface QuestionnaireAnswers {
  category?: ProductCategory
  diameter?: string
  eBikeReady?: boolean
  priority?: 'comfort' | 'durability' | 'performance'
  terrain?: SearchTerrain
  tubelessReady?: boolean
}
