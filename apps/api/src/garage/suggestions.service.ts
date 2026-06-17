import { Injectable } from '@nestjs/common'

import { ProductsService } from '../products/products.service'

import type { BikeType } from './bike.model'
import type { ProductDto, ProductFilters } from '../products/products.service'

@Injectable()
export class GarageSuggestionsService {
  constructor(private readonly productsService: ProductsService) {}

  async suggestForBike(
    type: BikeType | undefined,
    diameter: string | null | undefined,
  ): Promise<ProductDto[]> {
    const filters: ProductFilters = {
      category: this.categoryForBikeType(type),
      diameter: diameter ?? undefined,
      terrain: this.terrainForCurrentSeason(type),
    }
    const products = await this.productsService.findAll(filters)

    return products.slice(0, 8)
  }

  private categoryForBikeType(type: BikeType | undefined): ProductFilters['category'] {
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

  private terrainForCurrentSeason(type: BikeType | undefined): ProductFilters['terrain'] {
    const month = new Date().getMonth() + 1
    const winter = month === 12 || month <= 2

    if (type === 'mtb') {
      return 'MTB'
    }

    if (type === 'gravel' || winter) {
      return 'GRAVEL'
    }

    if (type === 'city' || type === 'e-bike') {
      return 'CITY'
    }

    return 'ROAD'
  }
}
