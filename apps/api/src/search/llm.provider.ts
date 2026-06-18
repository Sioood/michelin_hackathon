import { Injectable, Logger } from '@nestjs/common'

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

const genericSearchWords = new Set([
  'a',
  'ai',
  'avec',
  'besoin',
  'bicyclette',
  'cherche',
  'compatible',
  'd',
  'de',
  'des',
  'du',
  'en',
  'je',
  'l',
  'la',
  'le',
  'les',
  'michelin',
  'mon',
  'pour',
  'pneu',
  'pneus',
  'recherche',
  'souhaite',
  'un',
  'une',
  'velo',
  'voudrais',
  'veux',
])

const interpretedSearchWords = new Set(
  [
    ...categoryKeywords.flatMap((item) => item.keywords),
    ...terrainKeywords.flatMap((item) => item.keywords),
    'bike',
    'electrique',
    'tubeless',
    'vae',
  ].flatMap((keyword) => tokenizeSearchText(keyword)),
)

@Injectable()
export class MistralLlmProvider implements LlmProvider {
  private readonly apiKey: string | null
  private readonly baseUrl: string
  private readonly logger = new Logger(MistralLlmProvider.name)
  private readonly model: string

  constructor() {
    this.apiKey = readOptionalEnvironmentVariable('MISTRAL_API_KEY')
    this.baseUrl =
      readOptionalEnvironmentVariable('MISTRAL_BASE_URL') ?? 'https://api.mistral.ai/v1'
    this.model = readOptionalEnvironmentVariable('MISTRAL_MODEL') ?? 'ministral-3b-2512'
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
        this.logger.warn(
          `Mistral request failed with status ${response.status}; using local fallback.`,
        )
        return createHeuristicSearchPlan(query)
      }

      const completion = (await response.json()) as ChatCompletionResponse
      const content = completion.choices?.[0]?.message?.content

      if (content === undefined || content.length === 0) {
        this.logger.warn('Mistral returned an empty response; using local fallback.')
        return createHeuristicSearchPlan(query)
      }

      return normalizeSearchPlan(JSON.parse(content) as unknown, query)
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error'
      this.logger.warn(`Mistral response could not be used (${reason}); using local fallback.`)
      return createHeuristicSearchPlan(query)
    }
  }
}

function createHeuristicSearchPlan(query: string): LlmSearchPlan {
  const normalizedQuery = normalizeText(query)
  const filters: SearchFilters = {}
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

  const residualSearch = createResidualSearch(query)
  if (residualSearch !== undefined) {
    filters.search = residualSearch
  }

  return {
    explanation: 'Sélection construite à partir des mots-clés de votre demande.',
    filters,
    source: 'heuristic',
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
  return {
    explanation,
    filters,
    source: 'mistral',
    suggestedSlugs: [],
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

  const searchInput =
    typeof record.search === 'string' && record.search.trim().length > 0
      ? record.search
      : fallbackQuery
  const residualSearch = createResidualSearch(searchInput)

  if (residualSearch !== undefined) {
    filters.search = residualSearch
  }

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

function createResidualSearch(value: string): string | undefined {
  const residualWords = tokenizeSearchText(value).filter(
    (word) =>
      !genericSearchWords.has(word) &&
      !interpretedSearchWords.has(word) &&
      !/^(?:20|24|26|27\.5|29|650|700)$/u.test(word),
  )
  const residualSearch = residualWords.join(' ').trim()

  return residualSearch.length === 0 ? undefined : residualSearch
}

function tokenizeSearchText(value: string): string[] {
  return normalizeText(value)
    .replace(/[^\p{Letter}\p{Number}.]+/gu, ' ')
    .split(/\s+/u)
    .filter((word) => word.length > 0)
}

function readOptionalEnvironmentVariable(name: string): string | null {
  const value = process.env[name]?.trim()
  return value === undefined || value.length === 0 ? null : value
}
