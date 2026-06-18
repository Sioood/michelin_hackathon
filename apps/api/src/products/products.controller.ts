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
    const slugList = slugs.split(',').map((s) => s.trim()).filter(Boolean)
    if (slugList.length < 2 || slugList.length > 4) {
      throw new BadRequestException('Provide between 2 and 4 slugs')
    }
    return this.productsService.findBySlugs(slugList)
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string): Promise<ProductDto> {
    return this.productsService.findBySlug(slug)
  }
}
