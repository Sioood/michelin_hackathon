import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'

import { mapSearchTerrainToProductTerrains } from '../search/terrain-map'

import { normalizeDiameterVariants } from './diameter-variants'
import { Product } from './product.model'
import { seedProducts } from './products.seed'
import { enrichProductSeed } from './seed-prices'

import type { ProductAttributes } from './product.model'
import type { WhereOptions } from 'sequelize'

export type ProductDto = ProductAttributes

export interface ProductFilters {
  category?: string
  diameter?: string
  search?: string
  terrain?: string
}

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}

  async onModuleInit(): Promise<void> {
    const productCount = await this.productModel.count()
    if (productCount === seedProducts.length) {
      return
    }

    await this.productModel.truncate({ cascade: true, restartIdentity: true })
    await this.productModel.bulkCreate(seedProducts.map(enrichProductSeed), { validate: true })
  }

  async findAll(filters: ProductFilters = {}): Promise<ProductDto[]> {
    const where = this.createWhere(filters)
    const products = await this.productModel.findAll({
      order: [
        ['category', 'ASC'],
        ['rangeName', 'ASC'],
        ['designation', 'ASC'],
      ],
      where,
    })

    return products.map((product) => product.toJSON<ProductDto>())
  }

  async findBySlug(slug: string): Promise<ProductDto> {
    const product = await this.productModel.findOne({ where: { slug } })

    if (product === null) {
      throw new NotFoundException('Product not found')
    }

    return product.toJSON<ProductDto>()
  }

  async findModelById(id: number): Promise<Product> {
    const product = await this.productModel.findByPk(id)

    if (product === null) {
      throw new NotFoundException('Product not found')
    }

    return product
  }

  private createWhere(filters: ProductFilters): WhereOptions<ProductAttributes> {
    const conditions: WhereOptions<ProductAttributes>[] = []

    if (filters.category !== undefined && filters.category.length > 0) {
      conditions.push({ category: filters.category })
    }

    if (filters.diameter !== undefined && filters.diameter.length > 0) {
      const diameterVariants = normalizeDiameterVariants(filters.diameter)
      if (diameterVariants.length > 0) {
        conditions.push({
          [Op.or]: diameterVariants.flatMap((variant) => [
            { webDiameterMm: variant },
            { webDiameterInch: variant },
            { webDiameterMm: { [Op.iLike]: `%${variant}%` } },
            { webDiameterInch: { [Op.iLike]: `%${variant}%` } },
            { diameterEtrto: variant },
          ]),
        } as WhereOptions<ProductAttributes>)
      }
    }

    if (filters.terrain !== undefined && filters.terrain.length > 0) {
      conditions.push({
        terrainTypes: {
          [Op.overlap]: mapSearchTerrainToProductTerrains(filters.terrain),
        },
      } as WhereOptions<ProductAttributes>)
    }

    if (filters.search !== undefined && filters.search.length > 0) {
      const search = `%${filters.search}%`
      conditions.push({
        [Op.or]: [
          { designation: { [Op.iLike]: search } },
          { rangeName: { [Op.iLike]: search } },
          { headline: { [Op.iLike]: search } },
          { description: { [Op.iLike]: search } },
        ],
      } as WhereOptions<ProductAttributes>)
    }

    if (conditions.length === 0) {
      return {}
    }

    return { [Op.and]: conditions } as WhereOptions<ProductAttributes>
  }
}
