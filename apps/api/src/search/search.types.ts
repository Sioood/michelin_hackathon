import type { ProductCategory } from '../products/product.model'
import type { ProductDto } from '../products/products.service'

export type SearchTerrain = 'CITY' | 'GRAVEL' | 'MIXED' | 'MTB' | 'ROAD'
export type SearchSource = 'heuristic' | 'mistral' | 'questionnaire'

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
  source: SearchSource
  suggestedSlugs: string[]
}

export interface SearchPlan {
  explanation: string
  filters: SearchFilters
  source: SearchSource
  suggestedSlugs: string[]
}

export interface LlmSearchPlan extends Omit<SearchPlan, 'source'> {
  source: Exclude<SearchSource, 'questionnaire'>
}

export interface QuestionnaireAnswers {
  category?: ProductCategory
  diameter?: string
  eBikeReady?: boolean
  priority?: 'comfort' | 'durability' | 'performance'
  terrain?: SearchTerrain
  tubelessReady?: boolean
}
