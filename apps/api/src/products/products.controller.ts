import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common'

import { ProductsService } from './products.service'

import type { ProductDto, ProductFilters } from './products.service'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() filters: ProductFilters): Promise<ProductDto[]> {
    return this.productsService.findAll(filters)
  }

  @Get('compare')
  compare(@Query('slugs') slugs: string): Promise<ProductDto[]> {
    if (!slugs || slugs.trim().length === 0) {
      throw new BadRequestException('slugs query param is required')
    }
    const slugList = slugs
      .split(',')
      .map((slug) => slug.trim())
      .filter(Boolean)
    if (slugList.length !== 2 || new Set(slugList).size !== 2) {
      throw new BadRequestException('Provide exactly 2 distinct slugs')
    }

    return this.productsService.findBySlugs(slugList)
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string): Promise<ProductDto> {
    return this.productsService.findBySlug(slug)
  }
}
