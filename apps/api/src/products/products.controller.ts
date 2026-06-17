import { Controller, Get, Param, Query } from '@nestjs/common'

import { ProductsService } from './products.service'

import type { ProductDto, ProductFilters } from './products.service'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() filters: ProductFilters): Promise<ProductDto[]> {
    return this.productsService.findAll(filters)
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string): Promise<ProductDto> {
    return this.productsService.findBySlug(slug)
  }
}
