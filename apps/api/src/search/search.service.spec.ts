import { SearchService } from './search.service'

import type { LlmProvider } from './llm.provider'
import type { ProductDto, ProductsService } from '../products/products.service'

const gravelProduct = {
  category: 'gravel',
  designation: 'Power Gravel 700x40',
  eBikeReady: true,
  rangeName: 'Power Gravel',
  slug: 'power-gravel',
  terrainTypes: ['GRAVEL'],
  tubelessReady: true,
  webDiameterInch: null,
  webDiameterMm: '700',
} as ProductDto

const roadProduct = {
  category: 'road',
  designation: 'Power Cup 700x25',
  eBikeReady: false,
  rangeName: 'Power Cup',
  slug: 'power-cup',
  terrainTypes: ['ROAD'],
  tubelessReady: true,
  webDiameterInch: null,
  webDiameterMm: '700',
} as ProductDto

describe('SearchService', () => {
  it('maps LLM filters to product filters and post-filters capability flags', async () => {
    const findAll = jest
      .fn<Promise<ProductDto[]>, [unknown]>()
      .mockResolvedValue([gravelProduct, roadProduct])
    const productsService = { findAll } as unknown as ProductsService
    const llmProvider: LlmProvider = {
      createSearchPlan: jest.fn().mockResolvedValue({
        explanation: 'Gravel tubeless compatible e-bike.',
        filters: {
          category: 'gravel',
          diameter: '700',
          eBikeReady: true,
          search: 'gravel tubeless electrique',
          terrain: 'GRAVEL',
          tubelessReady: true,
        },
        suggestedSlugs: [],
      }),
    }
    const service = new SearchService(productsService, llmProvider)

    const response = await service.searchWithAi('gravel tubeless electrique 700')

    expect(findAll).toHaveBeenCalledWith({
      category: 'gravel',
      diameter: '700',
      search: 'gravel tubeless electrique',
      terrain: 'GRAVEL',
    })
    expect(response.results).toHaveLength(1)
    expect(response.results[0]?.product.slug).toBe('power-gravel')
    expect(response.suggestedSlugs).toEqual(['power-gravel'])
  })

  it('creates questionnaire filters from structured answers', () => {
    const productsService = { findAll: jest.fn() } as unknown as ProductsService
    const llmProvider = { createSearchPlan: jest.fn() } as unknown as LlmProvider
    const service = new SearchService(productsService, llmProvider)

    expect(
      service.createFiltersFromQuestionnaire({
        diameter: '700',
        eBikeReady: true,
        priority: 'performance',
        terrain: 'GRAVEL',
        tubelessReady: true,
      }),
    ).toEqual({
      category: 'e-bike',
      diameter: '700',
      eBikeReady: true,
      search: 'competition performance',
      terrain: 'GRAVEL',
      tubelessReady: true,
    })
  })
})
