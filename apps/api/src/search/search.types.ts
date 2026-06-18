import type { ProductCategory } from '../products/product.model'
import type { ProductDto } from '../products/products.service'

export type SearchTerrain = 'CITY' | 'GRAVEL' | 'MIXED' | 'MTB' | 'ROAD'

export interface SearchFilters {
  category?: ProductCategory
  diameter?: string
  eBikeReady?: boolean
  search?: string
  terrain?: SearchTerrain
  tubelessReady?: boolean
}

export interface SearchResult {
  matchReasons: string[]
  product: ProductDto
  score: number
}

export interface SearchResponse {
  explanation: string
  filters: SearchFilters
  results: SearchResult[]
  suggestedSlugs: string[]
}

export interface LlmSearchPlan {
  explanation: string
  filters: SearchFilters
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
