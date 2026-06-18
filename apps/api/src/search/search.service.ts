import { Inject, Injectable } from '@nestjs/common'

import {
  productMatchesDiameterVariants,
  normalizeDiameterVariants,
} from '../products/diameter-variants'
import { ProductsService } from '../products/products.service'

import { LLM_PROVIDER, type LlmProvider } from './llm.provider'
import { productMatchesSearchTerrain } from './terrain-map'

import type {
  LlmSearchPlan,
  QuestionnaireAnswers,
  SearchFilters,
  SearchResponse,
  SearchResult,
} from './search.types'
import type { ProductDto, ProductFilters } from '../products/products.service'

@Injectable()
export class SearchService {
  constructor(
    private readonly productsService: ProductsService,
    @Inject(LLM_PROVIDER) private readonly llmProvider: LlmProvider,
  ) {}

  async searchWithAi(query: string): Promise<SearchResponse> {
    const plan = await this.llmProvider.createSearchPlan(query)
    const filters = this.normalizeFilters(plan.filters)

    return this.createResponse({
      explanation: plan.explanation,
      filters,
      suggestedSlugs: plan.suggestedSlugs,
    })
  }

  async searchWithQuestionnaire(answers: QuestionnaireAnswers): Promise<SearchResponse> {
    const filters = this.createFiltersFromQuestionnaire(answers)

    return this.createResponse(
      {
        explanation: this.createQuestionnaireExplanation(filters),
        filters,
        suggestedSlugs: [],
      },
      answers.priority,
    )
  }

  createFiltersFromQuestionnaire(answers: QuestionnaireAnswers): SearchFilters {
    const filters: SearchFilters = {}

    if (answers.category !== undefined) {
      filters.category = answers.category
    } else if (answers.eBikeReady === true) {
      filters.category = 'e-bike'
    }

    if (answers.terrain !== undefined) {
      filters.terrain = answers.terrain
    }

    if (answers.diameter !== undefined && answers.diameter.trim().length > 0) {
      filters.diameter = answers.diameter.trim()
    }

    if (answers.eBikeReady === true) {
      filters.eBikeReady = true
    }

    if (answers.tubelessReady === true) {
      filters.tubelessReady = true
    }

    return filters
  }

  private async createResponse(
    plan: LlmSearchPlan,
    priority?: QuestionnaireAnswers['priority'],
  ): Promise<SearchResponse> {
    const apiFilters = this.toProductFilters(plan.filters)
    const products = await this.productsService.findAll(apiFilters)
    const filteredProducts = products.filter((product) =>
      this.productMatches(product, plan.filters),
    )
    const results = this.rankProducts(filteredProducts, plan.filters, priority)

    return {
      explanation: plan.explanation,
      filters: plan.filters,
      results,
      suggestedSlugs:
        plan.suggestedSlugs.length > 0
          ? plan.suggestedSlugs
          : results.slice(0, 3).map((result) => result.product.slug),
    }
  }

  private normalizeFilters(filters: SearchFilters): SearchFilters {
    return {
      ...filters,
      diameter: filters.diameter?.trim(),
      search: filters.search?.trim(),
    }
  }

  private toProductFilters(filters: SearchFilters): ProductFilters {
    return {
      category: filters.category,
      diameter: filters.diameter,
      search: filters.search,
      terrain: filters.terrain,
    }
  }

  private productMatches(product: ProductDto, filters: SearchFilters): boolean {
    if (filters.tubelessReady === true && !product.tubelessReady) {
      return false
    }

    if (filters.eBikeReady === true && !product.eBikeReady) {
      return false
    }

    return true
  }

  private rankProducts(
    products: ProductDto[],
    filters: SearchFilters,
    priority?: QuestionnaireAnswers['priority'],
  ): SearchResult[] {
    return products
      .map((product) => {
        const matchReasons: string[] = []
        let score = 0

        if (filters.category !== undefined && product.category === filters.category) {
          score += 3
          matchReasons.push('Univers de pratique correspondant')
        }

        if (
          filters.terrain !== undefined &&
          productMatchesSearchTerrain(product.terrainTypes, filters.terrain)
        ) {
          score += 2
          matchReasons.push('Terrain compatible')
        }

        if (
          filters.diameter !== undefined &&
          productMatchesDiameterVariants(product, normalizeDiameterVariants(filters.diameter))
        ) {
          score += 2
          matchReasons.push('Diametre demande')
        }

        if (filters.tubelessReady === true && product.tubelessReady) {
          score += 1
          matchReasons.push('Tubeless ready')
        }

        if (filters.eBikeReady === true && product.eBikeReady) {
          score += 1
          matchReasons.push('Compatible e-bike')
        }

        score += this.priorityScore(product, priority)

        if (matchReasons.length === 0) {
          matchReasons.push('Référence proche de votre recherche')
        }

        return { matchReasons, product, score }
      })
      .sort(
        (first, second) =>
          second.score - first.score ||
          first.product.rangeName.localeCompare(second.product.rangeName),
      )
      .slice(0, 24)
  }

  private priorityScore(
    product: ProductDto,
    priority: QuestionnaireAnswers['priority'] | undefined,
  ): number {
    if (priority === undefined) {
      return 0
    }

    const haystack = [
      product.rangeName,
      product.designation,
      product.headline,
      product.description,
      product.segment,
      ...(product.useCases ?? []),
      ...(product.technologies ?? []),
    ]
      .join(' ')
      .toLowerCase()

    switch (priority) {
      case 'comfort':
        return haystack.includes('comfort') || haystack.includes('touring') ? 2 : 0
      case 'durability':
        return haystack.includes('shield') || haystack.includes('protection') ? 2 : 0
      case 'performance':
        return haystack.includes('racing') || haystack.includes('competition') ? 2 : 0
    }
  }

  private createQuestionnaireExplanation(filters: SearchFilters): string {
    const parts = [
      filters.category !== undefined ? `catégorie ${filters.category}` : null,
      filters.terrain !== undefined ? `terrain ${filters.terrain.toLowerCase()}` : null,
      filters.diameter !== undefined ? `diamètre ${filters.diameter}` : null,
      filters.tubelessReady === true ? 'tubeless' : null,
      filters.eBikeReady === true ? 'compatible e-bike' : null,
    ].filter((part): part is string => part !== null)

    return parts.length > 0
      ? `Sélection basée sur vos réponses: ${parts.join(', ')}.`
      : 'Sélection Michelin recommandée pour démarrer.'
  }
}
