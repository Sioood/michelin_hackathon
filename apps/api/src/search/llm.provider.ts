import { Injectable } from '@nestjs/common'

import { searchSystemPrompt } from './prompts/search.prompt'

import type { LlmSearchPlan, SearchFilters, SearchTerrain } from './search.types'
import type { ProductCategory } from '../products/product.model'

export const LLM_PROVIDER = Symbol('LLM_PROVIDER')

export interface LlmProvider {
  createSearchPlan(query: string): Promise<LlmSearchPlan>
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const categoryKeywords: Array<{ category: ProductCategory; keywords: string[] }> = [
  { category: 'gravel', keywords: ['gravel', 'chemin', 'sentier'] },
  { category: 'mtb', keywords: ['vtt', 'mtb', 'enduro', 'trail'] },
  { category: 'road', keywords: ['route', 'road', 'competition', 'course'] },
  { category: 'e-bike', keywords: ['e-bike', 'ebike', 'electrique', 'vae'] },
  { category: 'commuting-tour', keywords: ['ville', 'trekking', 'commuting', 'urbain'] },
  { category: 'kids', keywords: ['enfant', 'junior', 'kids'] },
  { category: 'inner-tubes', keywords: ['chambre', 'air', 'tube'] },
]

const terrainKeywords: Array<{ keywords: string[]; terrain: SearchTerrain }> = [
  { keywords: ['gravel', 'chemin'], terrain: 'GRAVEL' },
  { keywords: ['vtt', 'mtb', 'boue', 'trail'], terrain: 'MTB' },
  { keywords: ['ville', 'urbain', 'commuting'], terrain: 'CITY' },
  { keywords: ['route', 'asphalte', 'road'], terrain: 'ROAD' },
]

@Injectable()
export class OpenAiLlmProvider implements LlmProvider {
  private readonly apiKey: string | null
  private readonly baseUrl: string
  private readonly model: string

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    this.apiKey = apiKey === undefined || apiKey.length === 0 ? null : apiKey
    this.baseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'
    this.model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
  }

  async createSearchPlan(query: string): Promise<LlmSearchPlan> {
    if (this.apiKey === null) {
      return createHeuristicSearchPlan(query)
    }

    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/u, '')}/chat/completions`, {
        body: JSON.stringify({
          messages: [
            { content: searchSystemPrompt, role: 'system' },
            { content: query, role: 'user' },
          ],
          model: this.model,
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        return createHeuristicSearchPlan(query)
      }

      const completion = (await response.json()) as ChatCompletionResponse
      const content = completion.choices?.[0]?.message?.content

      if (content === undefined || content.length === 0) {
        return createHeuristicSearchPlan(query)
      }

      return normalizeSearchPlan(JSON.parse(content) as unknown, query)
    } catch {
      return createHeuristicSearchPlan(query)
    }
  }
}

function createHeuristicSearchPlan(query: string): LlmSearchPlan {
  const normalizedQuery = normalizeText(query)
  const filters: SearchFilters = { search: query.trim() }
  const categoryMatch = categoryKeywords.find((item) =>
    item.keywords.some((keyword) => normalizedQuery.includes(keyword)),
  )
  const terrainMatch = terrainKeywords.find((item) =>
    item.keywords.some((keyword) => normalizedQuery.includes(keyword)),
  )
  const diameter = query.match(/\b(700|650|29|27\.5|27,5|26|24|20)\b/u)?.[1]

  if (categoryMatch !== undefined) {
    filters.category = categoryMatch.category
  }

  if (terrainMatch !== undefined) {
    filters.terrain = terrainMatch.terrain
  }

  if (diameter !== undefined) {
    filters.diameter = diameter.replace(',', '.')
  }

  if (normalizedQuery.includes('tubeless')) {
    filters.tubelessReady = true
  }

  if (
    normalizedQuery.includes('e-bike') ||
    normalizedQuery.includes('ebike') ||
    normalizedQuery.includes('electrique') ||
    normalizedQuery.includes('vae')
  ) {
    filters.eBikeReady = true
  }

  return {
    explanation: 'Sélection construite à partir des mots-clés de votre demande.',
    filters,
    suggestedSlugs: [],
  }
}

function normalizeSearchPlan(input: unknown, fallbackQuery: string): LlmSearchPlan {
  const record = isRecord(input) ? input : {}
  const filters = normalizeFilters(record.filters, fallbackQuery)
  const explanation =
    typeof record.explanation === 'string' && record.explanation.trim().length > 0
      ? record.explanation.trim()
      : 'Sélection construite à partir de votre demande.'
  const suggestedSlugs = Array.isArray(record.suggestedSlugs)
    ? record.suggestedSlugs.filter((slug): slug is string => typeof slug === 'string')
    : []

  return {
    explanation,
    filters,
    suggestedSlugs,
  }
}

function normalizeFilters(input: unknown, fallbackQuery: string): SearchFilters {
  const record = isRecord(input) ? input : {}
  const filters: SearchFilters = {}

  if (isProductCategory(record.category)) {
    filters.category = record.category
  }

  if (isTerrain(record.terrain)) {
    filters.terrain = record.terrain
  }

  if (typeof record.diameter === 'string' && record.diameter.length > 0) {
    filters.diameter = record.diameter
  }

  if (typeof record.tubelessReady === 'boolean') {
    filters.tubelessReady = record.tubelessReady
  }

  if (typeof record.eBikeReady === 'boolean') {
    filters.eBikeReady = record.eBikeReady
  }

  filters.search =
    typeof record.search === 'string' && record.search.trim().length > 0
      ? record.search.trim()
      : fallbackQuery.trim()

  return filters
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isProductCategory(value: unknown): value is ProductCategory {
  return (
    value === 'commuting-tour' ||
    value === 'e-bike' ||
    value === 'gravel' ||
    value === 'inner-tubes' ||
    value === 'kids' ||
    value === 'mtb' ||
    value === 'road'
  )
}

function isTerrain(value: unknown): value is SearchTerrain {
  return (
    value === 'CITY' ||
    value === 'GRAVEL' ||
    value === 'MIXED' ||
    value === 'MTB' ||
    value === 'ROAD'
  )
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}
