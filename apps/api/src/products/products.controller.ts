import { BadRequestException, Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common'

import { CrossSellService } from '../cross-sell/cross-sell.service'

import { ProductsService } from './products.service'

import type { ProductDto, ProductFilters } from './products.service'

@Controller('products')
export class ProductsController {
  constructor(
    private readonly crossSellService: CrossSellService,
    private readonly productsService: ProductsService,
  ) {}

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

  @Get(':id/cross-sell')
  findCrossSell(@Param('id', ParseIntPipe) id: number): Promise<ProductDto[]> {
    return this.crossSellService.findForProduct(id)
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string): Promise<ProductDto> {
    return this.productsService.findBySlug(slug)
  }
}
